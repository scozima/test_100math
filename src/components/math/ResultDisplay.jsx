import React from 'react'

const ResultDisplay = ({ score, time, totalQuestions, onRestart }) => {
  return (
    <div className="result owl10">
      <p>Score: {score} / {totalQuestions}</p>
      <p>Time: {time} seconds</p>
      <button className="btn02" onClick={onRestart}>
        Restart
      </button>
    </div>
  )
}

export default ResultDisplay 