import React from 'react'

const MathGrid = ({ 
  array, 
  start, 
  userAnswers, 
  answerStates, 
  handleChange, 
  firstInputRef 
}) => {
  const generateKey = (rowIndex, colIndex, rowValue, colValue) => {
    return `${rowIndex}-${colIndex}_${rowValue}${array[0].operator}${colValue}`
  }

  return (
    <table className={`table01 mb15 ${start ? '' : '-inactive'}`}>
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
              const key = generateKey(rowIndex, colIndex, rowValue, colValue)
              const userAnswer = userAnswers[key] || ''
              return (
                <td key={colIndex}>
                  <input
                    type="number"
                    className={`user-answer ${answerStates[key] || ''}`}
                    value={userAnswer}
                    onChange={(e) =>
                      handleChange(rowIndex, colIndex, rowValue, colValue, e)
                    }
                    ref={rowIndex === 0 && colIndex === 0 ? firstInputRef : null}
                  />
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MathGrid 