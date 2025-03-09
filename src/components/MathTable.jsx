import { useState, useRef, useEffect } from "react";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

import { db, auth } from '../firebase';

import ProblemSelector from './math/ProblemSelector'
import MathGrid from './math/MathGrid'
import ResultDisplay from './math/ResultDisplay'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function MathTable() {
  const { t } = useTranslation();
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

  // カラムの表示状態を管理
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    problem: true,
    score: true,
    time: true
  })

  // 結果データの状態管理
  const [results, setResults] = useState([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // ベーシック問題を取得（ログイン不要）
        const basicSnapshot = await getDocs(
          collection(db, "basic_question_db")
        );
        const basicList = basicSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          collection: "basic_question_db",
        }));

        // カスタム問題はログインユーザーのみ取得
        let customList = [];
        if (currentUser) {
          const userQuestionsRef = collection(db, `users/${currentUser.uid}/questions`);
          const userQuestionsSnapshot = await getDocs(userQuestionsRef);
          customList = userQuestionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            collection: "users",
            path: doc.ref.path
          }));
        }

        setProblems({ basic_question_db: basicList, users: customList });

        // 初期選択問題の設定
        if (basicList.length > 0) {
          const firstProblem = basicList[0];
          setSelectedProblem(`${firstProblem.collection}/${firstProblem.id}`);
          setSelectedCollection("basic_question_db");
        } else if (customList.length > 0 && currentUser) {
          const firstProblem = customList[0];
          setSelectedProblem(`${firstProblem.collection}/${firstProblem.id}`);
          setSelectedCollection("users");
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedProblem) return;

    const fetchProblemData = async () => {
      try {
        const [collection, id] = selectedProblem.split('/');
        let docRef;
        if (collection === "basic_question_db") {
          docRef = doc(db, collection, id);
        } else if (currentUser) {
          docRef = doc(db, `users/${currentUser.uid}/questions`, id);
        } else {
          return; // ログインしていない場合はカスタム問題を取得しない
        }

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // x と y の配列の要素を数値型に変換
          const xArray = data.x.map(Number);
          const yArray = data.y.map(Number);
          
          setArray([{ 
            id: 1, 
            operator: data.operator, 
            x: xArray,  // 数値型の配列
            y: yArray   // 数値型の配列
          }]);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching problem data:", error);
      }
    };

    fetchProblemData();
  }, [selectedProblem, currentUser]);

  const calculateAnswer = (rowValue, colValue, operator) => {
    // 数値に変換してから計算する
    const numRowValue = Number(rowValue);
    const numColValue = Number(colValue);
    
    switch (operator) {
      case "+":
        return numRowValue + numColValue;
      case "-":
        return numRowValue - numColValue;
      case "✕":
        return numRowValue * numColValue;
      case "÷":
        return numRowValue / numColValue;
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
          docRef = doc(db, selectedCollection, selectedProblem.split('/')[1]);
        } else {
          docRef = doc(db, `users/${currentUser.uid}/questions`, selectedProblem.split('/')[1]);
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
          problemId: selectedProblem.split('/')[1],
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
    setSelectedProblem(value)

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

  // カラムの切り替え処理を修正
  const toggleColumn = (columnName) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }))
  }

  // ローディング中の表示
  if (array.length === 0) {
    return <p>{t('math_table.loading')}</p>;
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader>
          <ProblemSelector
            problems={problems}
            selectedCollection={selectedCollection}
            selectedProblem={selectedProblem}
            onProblemChange={handleProblemSelection}
            currentUser={currentUser}
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
                  {t('math_table.start')}
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
                      {t('math_table.submit')}
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