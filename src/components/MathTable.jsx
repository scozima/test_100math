import { useState, useEffect } from 'react';
import './MathTable.scss';

const array = [{
  id: 1,
  name: "plus01",
  value: "×",  // 演算子（+、-、×、÷）
  x: [2, 8, 5, 1, 7, 3, 6, 9, 0, 4],
  y: [4, 5, 1, 8, 3, 9, 0, 2, 7, 6]
}];

function MathTable() {
  const [start, setStart] = useState(false); // 回答をスタートする
  const [userAnswers, setUserAnswers] = useState({}); // ユーザ回答
  const [score, setScore] = useState(null);  // 得点
  const [time, setTime] = useState(null);    // 経過時間
  const [startTime, setStartTime] = useState(null);  // 開始時間
  const [isFormValid, setIsFormValid] = useState(false);  // フォームが有効かどうか

  // 演算子に応じて計算する関数
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
        return 0;  // デフォルトで0（不正な演算子用）
    }
  };

  // 回答をチェックする関数
  const checkAnswer = (rowValue, colValue, userAnswer, operator) => {
    const correctAnswer = calculateAnswer(rowValue, colValue, operator);
    return correctAnswer === parseFloat(userAnswer);
  };


  const handleChange = (rowValue, colValue, e) => {
    const { value } = e.target;

    // 入力された値が空文字の場合、そのまま処理をしない
    if (value === "") {
      setUserAnswers(prevAnswers => {
        const newAnswers = {
          ...prevAnswers,
          [`${rowValue}${array[0].value}${colValue}`]: value
        };

        // フォームが全て埋まっているかどうかを判定
        const allFilled = array[0].y.every((rowValue) =>
          array[0].x.every((colValue) => newAnswers[`${rowValue}${array[0].value}${colValue}`] !== "")
        );

        setIsFormValid(allFilled);

        return newAnswers;
      });
    } else {
      setUserAnswers(prevAnswers => {
        const newAnswers = {
          ...prevAnswers,
          [`${rowValue}${array[0].value}${colValue}`]: value
        };

        // フォームが全て埋まっているかどうかを判定
        const allFilled = array[0].y.every((rowValue) =>
          array[0].x.every((colValue) => newAnswers[`${rowValue}${array[0].value}${colValue}`] !== null)
        );

        setIsFormValid(allFilled);

        return newAnswers;
      });
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("回答: ", userAnswers);

    let correctAnswers = 0;
    array[0].y.forEach((rowValue) => {
      array[0].x.forEach((colValue) => {
        const userAnswer = userAnswers[`${rowValue}${array[0].value}${colValue}`];
        if (checkAnswer(rowValue, colValue, userAnswer, array[0].value)) {
          correctAnswers++;
        }
      });
    });

    setScore(correctAnswers);  // 得点を設定

    const endTime = Date.now();
    const elapsedTime = Math.round((endTime - startTime) / 1000);  // 秒単位
    setTime(elapsedTime);  // 経過時間を設定
  };

  const startFlag = () => {
    setStart(prevStart => !prevStart)
    setStartTime(Date.now());

    console.log(startTime);
  }

  return (

    <form onSubmit={handleSubmit}>

      {start === false ?
        (
          <button className='btn01' onClick={startFlag}>
            Start
          </button>
        ) :
        (
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
                      const answer = calculateAnswer(rowValue, colValue, array[0].value);
                      const userAnswer = userAnswers[`${rowValue}${array[0].value}${colValue}`];

                      return (
                        <td key={colIndex}>
                          <span className="answer">{answer}</span>
                          <input
                            type="text"
                            className={`user-answer ${checkAnswer(rowValue, colValue, userAnswer, array[0].value) ? 'correct' : 'incorrect'}`}
                            value={userAnswer || ''}
                            onChange={(e) => handleChange(rowValue, colValue, e)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className='btn02' type='submit' disabled={!isFormValid}>Submit</button>
          </>
        )}

      {/* 結果表示 */}
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
