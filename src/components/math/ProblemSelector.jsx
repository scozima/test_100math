import React from 'react'

const ProblemSelector = ({ problems, selectedCollection, selectedProblem, onProblemSelection }) => {
  return (
    <select
      onChange={onProblemSelection}
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
  )
}

export default ProblemSelector 