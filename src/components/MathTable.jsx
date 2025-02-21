import { useState, useRef, useEffect } from "react";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";

import { db, auth } from '../firebase';

import ProblemSelector from './math/ProblemSelector'
import MathGrid from './math/MathGrid'
import ResultDisplay from './math/ResultDisplay'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function MathTable() {
  const [start, setStart] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [time, setTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [answerStates, setAnswerStates] = useState({});
  const [btnHide, setBtnHide] = useState(false);
  const [array, setArray] = useState([]);
  const [problems, setProblems] = useState({ basic_question_db: [], users: [] });
  const [selectedProblem, setSelectedProblem] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("basic_question_db");
  const [currentUser, setCurrentUser] = useState(null);

  const firstInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      if (!currentUser) return;

      try {
        const basicSnapshot = await getDocs(
          collection(db, "basic_question_db")
        );
        const basicList = basicSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          collection: "basic_question_db",
        }));

        const userQuestionsRef = collection(db, `users/${currentUser.uid}/questions`);
        const userQuestionsSnapshot = await getDocs(userQuestionsRef);
        const customList = userQuestionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          collection: "users",
          path: doc.ref.path
        }));

        setProblems({ basic_question_db: basicList, users: customList });

        if (basicList.length > 0) {
          setSelectedProblem(basicList[0].id);
          setSelectedCollection("basic_question_db");
        } else if (customList.length > 0) {
          setSelectedProblem(customList[0].id);
          setSelectedCollection("users");
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedProblem || !selectedCollection || !currentUser) return;

    const fetchProblemData = async () => {
      try {
        let docRef;
        if (selectedCollection === "basic_question_db") {
          docRef = doc(db, selectedCollection, selectedProblem);
        } else {
          docRef = doc(db, `users/${currentUser.uid}/questions`, selectedProblem);
        }

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setArray([{ id: 1, operator: data.operator, x: data.x, y: data.y }]);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching problem data:", error);
      }
    };

    fetchProblemData();
  }, [selectedProblem, selectedCollection, currentUser]);

  const calculateAnswer = (rowValue, colValue, operator) => {
    switch (operator) {
      case "+":
        return rowValue + colValue;
      case "-":
        return rowValue - colValue;
      case "✕":
        return rowValue * colValue;
      case "÷":
        return rowValue / colValue;
      default:
        return 0;
    }
  };

  const generateKey = (rowIndex, colIndex, rowValue, colValue) => {
    return `${rowIndex}-${colIndex}_${rowValue}${array[0].operator}${colValue}`;
  };

  const handleChange = (rowIndex, colIndex, rowValue, colValue, e) => {
    const { value } = e.target;
    const key = generateKey(rowIndex, colIndex, rowValue, colValue);

    const updatedAnswers = { ...userAnswers, [key]: value };
    setUserAnswers(updatedAnswers);
    validateForm(updatedAnswers);
  };

  const validateForm = (answers) => {
    if (array.length === 0 || !array[0].x || !array[0].y) return;

    // データ構造が正しいかチェック
    // console.log("Current problem data:", array[0]);

    // 問題のすべてのキーを取得
    const allKeys = array[0].y.flatMap((rowValue, rowIndex) =>
      array[0].x.map((colValue, colIndex) =>
        generateKey(rowIndex, colIndex, rowValue, colValue)
      )
    );

    // すべてのキーに対して回答が入力されているかを確認
    const allFilled = allKeys.every((key) => answers[key] && answers[key].trim() !== "");

    // 判定結果をセット
    setIsFormValid(allFilled);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnHide(true);

    let correctAnswers = 0;
    const newAnswerStates = {};
    const answersData = [];

    array[0].y.forEach((rowValue, rowIndex) => {
      array[0].x.forEach((colValue, colIndex) => {
        const key = generateKey(rowIndex, colIndex, rowValue, colValue);
        const userAnswer = userAnswers[key];
        const correct =
          calculateAnswer(rowValue, colValue, array[0].operator) ===
          parseFloat(userAnswer);

        newAnswerStates[key] = correct ? "correct" : "incorrect";
        if (correct) correctAnswers++;

        answersData.push({
          question: `${rowValue} ${array[0].operator} ${colValue}`,
          userAnswer: userAnswer,
          correctAnswer: calculateAnswer(rowValue, colValue, array[0].operator),
          isCorrect: correct,
        });
      });
    });

    setAnswerStates(newAnswerStates);
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    setScore(correctAnswers);
    setTime(elapsedTime);

    if (currentUser) {
      try {
        // 問題の詳細を取得
        let docRef;
        if (selectedCollection === "basic_question_db") {
          docRef = doc(db, selectedCollection, selectedProblem);
        } else {
          docRef = doc(db, `users/${currentUser.uid}/questions`, selectedProblem);
        }

        const docSnap = await getDoc(docRef);
        let problemName = "Unknown";
        let problemUpdatedAt = null;

        if (docSnap.exists()) {
          const data = docSnap.data();
          problemName = data.name || "Unknown";
          problemUpdatedAt = data.updatedAt || null;
        }

        // Firebase に保存
        await addDoc(collection(db, `users/${currentUser.uid}/results`), {
          problemId: selectedProblem,
          problemCollection: selectedCollection,
          problemName: problemName,
          problemUpdatedAt: problemUpdatedAt,
          score: correctAnswers,
          totalQuestions: answersData.length,
          time: elapsedTime,
          answers: answersData,
          createdAt: new Date(),
        });
        console.log("結果がFirebaseに保存されました。");
      } catch (error) {
        console.error("Firebaseへの保存中にエラーが発生しました:", error);
      }
    }
  };


  const startFlag = () => {
    setStart(true);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (start && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [start]);

  const handleProblemSelection = (value) => {
    const [collectionName, problemId] = value.split("/")
    setSelectedCollection(collectionName)
    setSelectedProblem(problemId)

    // Startボタンのリセット
    setStart(false)
    setStartTime(null)
    setScore(null)
    setTime(null)
    setBtnHide(false)
  }

  // リスタート用の関数
  const handleRestart = () => {
    const emptyAnswers = {};
    // Reset all answers to empty strings
    array[0].y.forEach((rowValue, rowIndex) => {
      array[0].x.forEach((colValue, colIndex) => {
        const key = generateKey(rowIndex, colIndex, rowValue, colValue);
        emptyAnswers[key] = "";
      });
    });

    setUserAnswers(emptyAnswers);
    setAnswerStates({});
    setScore(null);
    setTime(null);
    setStartTime(Date.now());
    setBtnHide(false);
    setIsFormValid(false); // Explicitly reset form validity
    setStart(true);

    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 0);
  };


  if (!currentUser) {
    return <p>Please log in to access the math problems.</p>;
  }

  if (array.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          
          <ProblemSelector
            problems={problems}
            selectedCollection={selectedCollection}
            selectedProblem={selectedProblem}
            onProblemSelection={handleProblemSelection}
          />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div>
              <MathGrid
                array={array}
                start={start}
                userAnswers={userAnswers}
                answerStates={answerStates}
                handleChange={handleChange}
                firstInputRef={firstInputRef}
              />

              {!start ? (
                <Button
                  type="button"
                  onClick={startFlag}
                  className="w-32 mx-auto block py-3"
                  size="lg"
                >
                  スタート
                </Button>
              ) : (
                <>
                  {!btnHide && (
                    <Button
                      type="submit"
                      className="w-32 mx-auto block py-3"
                      size="lg"
                      disabled={!isFormValid}
                    >
                      回答する
                    </Button>
                  )}

                  {score !== null && (
                    <ResultDisplay
                      score={score}
                      time={time}
                      totalQuestions={array[0].x.length * array[0].y.length}
                      onRestart={handleRestart}
                    />
                  )}
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default MathTable;