export const calculateAnswer = (rowValue, colValue, operator) => {
  switch (operator) {
    case '+':
      return rowValue + colValue
    case '-':
      return rowValue - colValue
    case '✕':
      return rowValue * colValue
    case '÷':
      return rowValue / colValue
    default:
      return 0
  }
}

export const generateKey = (rowIndex, colIndex, rowValue, operator, colValue) => {
  return `${rowIndex}-${colIndex}_${rowValue}${operator}${colValue}`
} 