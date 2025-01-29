import { useState, useRef, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import './MathTable.scss';
import db from '../firebase';

function MathTable() {
  const [start, setStart] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [time, setTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [answerStates, setAnswerStates] = useState({});
  const [btnHide, setBtnHide] = useState(false);
  const [array, setArray] = useState([]); // Firebaseデータを格納するためのステート

  const firstInputRef = useRef(null);

  useEffect(() => {
    // Firestore からデータを取得
    const fetchData = async () => {
      try {
        const docRef = doc(db, "basic_db", "minus01"); // コレクション名、ドキュメント名
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setArray([{
            id: 1,
            value: data.value,  
            x: data.x, 
            y: data.y
          }]);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const calculateAnswer = (rowValue, colValue, operator) => {
    switch (operator) {
      case "+": return rowValue + colValue;
      case "-": return rowValue - colValue;
      case "×": return rowValue * colValue;
      case "÷": return rowValue / colValue;
      default: return 0;
    }
  };

  const handleChange = (rowValue, colValue, e) => {
    const { value } = e.target;
    const updatedAnswers = {
      ...userAnswers,
      [`${rowValue}${array[0].value}${colValue}`]: value,
    };

    setUserAnswers(updatedAnswers);
    validateForm(updatedAnswers);
  };

  const validateForm = (answers) => {
    if (array.length === 0) return;
    const allKeys = array[0].y.flatMap(rowValue =>
      array[0].x.map(colValue => `${rowValue}${array[0].value}${colValue}`)
    );

    const allFilled = allKeys.every(key => answers[key] && answers[key].trim() !== "");
    setIsFormValid(allFilled);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBtnHide(true);

    let correctAnswers = 0;
    const newAnswerStates = {};

    array[0].y.forEach((rowValue) => {
      array[0].x.forEach((colValue) => {
        const key = `${rowValue}${array[0].value}${colValue}`;
        const userAnswer = userAnswers[key];
        const correct = calculateAnswer(rowValue, colValue, array[0].value) === parseFloat(userAnswer);

        newAnswerStates[key] = correct ? 'correct' : 'incorrect';
        if (correct) correctAnswers++;
      });
    });

    setAnswerStates(newAnswerStates);
    setScore(correctAnswers);

    const endTime = Date.now();
    setTime(Math.round((endTime - startTime) / 1000));
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
      {!start ? (
        <button className='btn01' onClick={startFlag}>
          Start
        </button>
      ) : (
        <>
          <table className='table01'>
            <thead>
              <tr>
                <th>{array[0].value}</th>
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
                    const key = `${rowValue}${array[0].value}${colValue}`;
                    const userAnswer = userAnswers[key] || "";
                    const answerState = answerStates[key];

                    return (
                      <td key={colIndex}>
                        <input
                          type="text"
                          className={`user-answer ${answerState || ''}`}
                          value={userAnswer}
                          onChange={(e) => handleChange(rowValue, colValue, e)}
                          ref={rowIndex === 0 && colIndex === 0 ? firstInputRef : null}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {btnHide === false && (
            <button className='btn02' type='submit' disabled={!isFormValid}>
              Submit
            </button>
          )}
        </>
      )}

      {score !== null && (
        <div className="result">
          <p>Score: {score} / {array[0].x.length * array[0].y.length}</p>
          <p>Time: {time} seconds</p>
        </div>
      )}
    </form>
  );
}

export default MathTable;
