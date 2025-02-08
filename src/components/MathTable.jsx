import { useState, useRef, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

import "./MathTable.scss";
import { db, auth, provider } from '../firebase';



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
  const [problems, setProblems] = useState({ basic_question_db: [], custom_question_db: [] });
  const [selectedProblem, setSelectedProblem] = useState("");
  const [selectedCollection, setSelectedCollection] =
    useState("basic_question_db");

  const firstInputRef = useRef(null);

  // Firestore から `basic_question_db` と `custom_question_db` の問題リストを取得
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const basicSnapshot = await getDocs(
          collection(db, "basic_question_db")
        );
        const basicList = basicSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          collection: "basic_question_db",
        }));

        const dataSnapshot = await getDocs(collection(db, "custom_question_db"));
        const customList = dataSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          collection: "custom_question_db",
        }));

        setProblems({ basic_question_db: basicList, custom_question_db: customList });

        if (basicList.length > 0) {
          setSelectedProblem(basicList[0].id);
          setSelectedCollection("basic_question_db");
        } else if (customList.length > 0) {
          setSelectedProblem(customList[0].id);
          setSelectedCollection("custom_question_db");
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, []);

  // Firestore から選択された問題のデータを取得
  useEffect(() => {
    if (!selectedProblem || !selectedCollection) return;

    const fetchProblemData = async () => {
      try {
        const docRef = doc(db, selectedCollection, selectedProblem);
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
  }, [selectedProblem, selectedCollection]);

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
    if (array.length === 0) return;

    const allKeys = array[0].y.flatMap((rowValue, rowIndex) =>
      array[0].x.map((colValue, colIndex) =>
        generateKey(rowIndex, colIndex, rowValue, colValue)
      )
    );

    const allFilled = allKeys.every(
      (key) => answers[key] && answers[key].trim() !== ""
    );
    setIsFormValid(allFilled);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnHide(true);

    let correctAnswers = 0;
    const newAnswerStates = {};

    array[0].y.forEach((rowValue, rowIndex) => {
      array[0].x.forEach((colValue, colIndex) => {
        const key = generateKey(rowIndex, colIndex, rowValue, colValue);
        const userAnswer = userAnswers[key];
        const correct =
          calculateAnswer(rowValue, colValue, array[0].operator) ===
          parseFloat(userAnswer);

        newAnswerStates[key] = correct ? "correct" : "incorrect";
        if (correct) correctAnswers++;
      });
    });

    setAnswerStates(newAnswerStates);
    setScore(correctAnswers);
    setTime(Math.round((Date.now() - startTime) / 1000));
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

  if (array.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 問題の選択 */}
      <select
        onChange={(e) => {
          const [collectionName, problemName] = e.target.value.split("/");
          setSelectedCollection(collectionName);
          setSelectedProblem(problemName);
        }}
        value={`${selectedCollection}/${selectedProblem}`}
      >
        <optgroup label="basic_question_db">
          {problems.basic_question_db.map((problem) => (
            <option key={problem.id} value={`basic_question_db/${problem.id}`}>
              {problem.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="custom_question_db">
          {problems.custom_question_db.map((problem) => (
            <option key={problem.id} value={`custom_question_db/${problem.id}`}>
              {problem.name}
            </option>
          ))}
        </optgroup>
      </select>

      {!start ? (
        <button className="btn01" onClick={startFlag}>
          Start
        </button>
      ) : (
        <>
          <table className="table01 mb15">
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
                          type="text"
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
            <div className="result">
              <p>
                Score: {score} / {array[0].x.length * array[0].y.length}
              </p>
              <p>Time: {time} seconds</p>
            </div>
          )}
        </>
      )}
    </form>
  );
}

export default MathTable;
