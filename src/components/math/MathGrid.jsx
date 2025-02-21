import React from 'react'
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const MathGrid = ({ 
  array, 
  start, 
  userAnswers, 
  answerStates, 
  handleChange, 
  firstInputRef 
}) => {
  if (array.length === 0) return null

  const generateKey = (rowIndex, colIndex, rowValue, colValue) => {
    return `${rowIndex}-${colIndex}_${rowValue}${array[0].operator}${colValue}`
  }

  return (
    <div className="overflow-x-auto relative p-4">
      <table className="w-full border-collapse table-fixed bg-white shadow-sm">
        <thead>
          <tr>
            <th className="w-16 h-16 border-2 border-gray-200 text-center text-xl font-semibold bg-gray-50">
              {array[0].operator}
            </th>
            {array[0].x.map((colValue, colIndex) => (
              <th key={colIndex} className="w-16 h-16 border-2 border-gray-200 text-center text-xl font-semibold bg-gray-50">
                {colValue}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {array[0].y.map((rowValue, rowIndex) => (
            <tr key={rowIndex}>
              <th className="w-16 h-16 border-2 border-gray-200 text-center text-xl font-semibold bg-gray-50">
                {rowValue}
              </th>
              {array[0].x.map((colValue, colIndex) => {
                const key = generateKey(rowIndex, colIndex, rowValue, colValue)
                const answerState = answerStates[key]
                
                return (
                  <td key={colIndex} className="w-16 h-16 border-2 border-gray-200 relative p-0">
                    <Input
                      ref={rowIndex === 0 && colIndex === 0 ? firstInputRef : null}
                      type="number"
                      value={userAnswers[key] || ""}
                      onChange={(e) => handleChange(rowIndex, colIndex, rowValue, colValue, e)}
                      disabled={!start}
                      className={cn(
                        "absolute inset-0 w-full h-full text-center text-lg",
                        "!outline-none !ring-0 !ring-offset-0 !border-0 !shadow-none",
                        "focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus:!border-0 focus:!shadow-none",
                        "focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!border-0 focus-visible:!shadow-none",
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        !start && "bg-gray-100 cursor-not-allowed",
                        answerState === "correct" && "bg-green-50",
                        answerState === "incorrect" && "bg-red-50"
                      )}
                      style={{
                        borderRadius: 0,
                        border: 'none',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield',
                        boxShadow: 'none',
                        textAlign: 'center',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        focusVisible: 'none'
                      }}
                    />
                    {answerState && (
                      <div className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-base transition-all duration-200",
                        answerState === "correct" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}>
                        {answerState === "correct" ? "○" : "×"}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MathGrid 