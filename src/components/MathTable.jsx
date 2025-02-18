import { useState, useRef, useEffect } from "react";
import { collection, getDocs, doc, getDoc, query, where, addDoc } from "firebase/firestore";

import "./MathTable.scss";
import { db, auth } from '../firebase';

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

  const handleProblemSelection = (e) => {
    const [collectionName, problemId] = e.target.value.split("/");
    setSelectedCollection(collectionName);
    setSelectedProblem(problemId);

    // Startボタンのリセット
    setStart(false);
    setStartTime(null);
    setScore(null);
    setTime(null);
    setBtnHide(false);
  };

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
    <form onSubmit={handleSubmit}>
      <select
        onChange={handleProblemSelection}
        value={`${selectedCollection}/${selectedProblem}`}
        className="mb20"
      >
        <optgroup label="basic_question_db">
          {problems.basic_question_db.map((problem) => (
            <option key={problem.id} value={`basic_question_db/${problem.id}`}>
              {problem.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="users">
          {problems.users.map((problem) => (
            <option key={problem.id} value={`users/${problem.id}`}>
              {problem.name}
            </option>
          ))}
        </optgroup>
      </select>

      <button
        className={`btn01 mb20 ${start ? "disabled" : ""}`}
        onClick={startFlag}
        disabled={start}
      >
        Start
      </button>


      <>
        <table className={`table01 mb15 ${start ? "" : "-inactive"}`}>
          <thead>
            <tr>
              <th>{array[0].operator}</th>
              {array[0].x.map((item, index) => (
                <th key={index}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {array[0].y.map((rowValue, rowIndex) => (
              <tr key={rowIndex}>
                <th>{rowValue}</th>
                {array[0].x.map((colValue, colIndex) => {
                  const key = generateKey(
                    rowIndex,
                    colIndex,
                    rowValue,
                    colValue
                  );
                  const userAnswer = userAnswers[key] || "";
                  return (
                    <td key={colIndex}>
                      <input
                        type="number"
                        className={`user-answer ${answerStates[key] || ""}`}
                        value={userAnswer}
                        onChange={(e) =>
                          handleChange(
                            rowIndex,
                            colIndex,
                            rowValue,
                            colValue,
                            e
                          )
                        }
                        ref={
                          rowIndex === 0 && colIndex === 0
                            ? firstInputRef
                            : null
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {!btnHide && (
          <button className="btn02" type="submit" disabled={!isFormValid}>
            Submit
          </button>
        )}

        {score !== null && (
          <>
            <div className="result">
              <p>Score: {score} / {array[0].x.length * array[0].y.length}</p>
              <p>Time: {time} seconds</p>
            </div>
            <button className="btn02" onClick={handleRestart}>
              Restart
            </button>
          </>
        )}

      </>
    </form>
  );
}

export default MathTable;