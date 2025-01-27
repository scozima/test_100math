import { useState, useRef, useEffect } from 'react';
import './MathTable.scss';

const array = [{
  id: 1,
  name: "plus01",
  value: "+",  // 演算子（+、-、×、÷）
  x: [2, 8, 5, 1, 7],
  y: [4, 5, 1, 8, 3]
}];

function MathTable() {
  const [start, setStart] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [time, setTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [answerStates, setAnswerStates] = useState({});
  const [btnHide, setBtnHide] = useState(false);

  const firstInputRef = useRef(null); // 最初の input を参照する

  const calculateAnswer = (rowValue, colValue, operator) => {
    switch (operator) {
      case "+":
        return rowValue + colValue;
      case "-":
        return rowValue - colValue;
      case "×":
        return rowValue * colValue;
      case "÷":
        return rowValue / colValue;
      default:
        return 0;
    }
  };

  const handleChange = (rowValue, colValue, e) => {
    const { value } = e.target;

    const updatedAnswers = {
      ...userAnswers,
      [`${rowValue}${array[0].value}${colValue}`]: value,
    };

    setUserAnswers(updatedAnswers);

    // 入力チェックの実行
    validateForm(updatedAnswers);
  };

  const validateForm = (answers) => {
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

    setAnswerStates(newAnswerStates); // クラス更新
    setScore(correctAnswers);

    const endTime = Date.now();
    const elapsedTime = Math.round((endTime - startTime) / 1000);
    setTime(elapsedTime);
  };

  const startFlag = () => {
    setStart(true);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (start && firstInputRef.current) {
      firstInputRef.current.focus(); // 最初の input にフォーカス
    }
  }, [start]);

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
                    const answerState = answerStates[key]; // 正解/不正解の状態

                    return (
                      <td key={colIndex}>
                        <input
                          type="text"
                          className={`user-answer ${answerState || ''}`} // クラスを動的に設定
                          value={userAnswer}
                          onChange={(e) => handleChange(rowValue, colValue, e)}
                          ref={rowIndex === 0 && colIndex === 0 ? firstInputRef : null} // 最初の input に ref を割り当て
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {btnHide === false && (
            <button
              className='btn02'
              type='submit'
              disabled={!isFormValid}
            >
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
