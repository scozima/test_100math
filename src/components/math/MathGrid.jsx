import { useRef } from "react"
import PropTypes from 'prop-types'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

const MathGrid = ({
  problemData,
  start,
  userAnswers,
  answerStates,
  isFormValid,
  onAnswerChange,
  onStart,
  onSubmit,
  firstInputRef,
  btnHide
}) => {
  const { t } = useTranslation()
  
  // 個別のセルごとにrefを管理するためのオブジェクト
  const inputRefs = useRef({})
  
  if (!problemData) return null

  const generateKey = (rowIndex, colIndex, rowValue, colValue) => {
    return `${rowIndex}-${colIndex}_${rowValue}${problemData.operator}${colValue}`
  }

  const handleFocus = (key) => {
    if (inputRefs.current[key]) {
      inputRefs.current[key].select()
    }
  }

  const handleInputChange = (rowIndex, colIndex, rowValue, colValue, e) => {
    const key = generateKey(rowIndex, colIndex, rowValue, colValue)
    console.log(`INPUT: Generated key="${key}" for rowIndex=${rowIndex}, colIndex=${colIndex}, rowValue=${rowValue}, colValue=${colValue}, inputValue="${e.target.value}"`)
    onAnswerChange(key, e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-x-auto relative">
        <table className="w-full border-collapse table-fixed bg-white shadow-sm mb-5">
          <thead>
            <tr>
              <th className="w-16 h-16 border-2 border-gray-200 text-center text-xl font-semibold bg-gray-50">
                {problemData.operator}
              </th>
              {problemData.x.map((colValue, colIndex) => (
                <th key={colIndex} className="w-16 h-16 border-2 border-gray-200 text-center text-xl font-semibold bg-gray-50">
                  {colValue}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {problemData.y.map((rowValue, rowIndex) => (
              <tr key={rowIndex}>
                <th className="w-16 h-16 border-2 border-gray-200 text-center text-xl font-semibold bg-gray-50">
                  {rowValue}
                </th>
                {problemData.x.map((colValue, colIndex) => {
                  const key = generateKey(rowIndex, colIndex, rowValue, colValue)
                  const answerState = answerStates[key]

                  return (
                    <td key={colIndex} className="w-16 h-16 border-2 border-gray-200 relative p-0">
                      <Input
                        onFocus={() => handleFocus(key)}
                        ref={(node) => {
                          // 各セルのrefを保存
                          inputRefs.current[key] = node
                          // 最初のセルの場合は外部から渡されたrefにも設定
                          if (rowIndex === 0 && colIndex === 0 && firstInputRef) {
                            firstInputRef.current = node
                          }
                        }}
                        type="number"
                        value={userAnswers[key] || ""}
                        onChange={(e) => handleInputChange(rowIndex, colIndex, rowValue, colValue, e)}
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

      {/* コントロールボタン */}
      <div className="flex justify-center">
        {!start ? (
          <Button
            type="button"
            onClick={onStart}
            className="w-32 py-3"
            size="lg"
          >
            {t('math_table.start')}
          </Button>
        ) : (
          <div className="space-y-4">
            {!btnHide && (
              <Button
                type="submit"
                className="w-32 mx-auto block py-3"
                size="lg"
                disabled={!isFormValid}
              >
                {t('math_table.submit')}
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

MathGrid.propTypes = {
  problemData: PropTypes.shape({
    operator: PropTypes.string.isRequired,
    x: PropTypes.arrayOf(PropTypes.number).isRequired,
    y: PropTypes.arrayOf(PropTypes.number).isRequired
  }),
  start: PropTypes.bool.isRequired,
  userAnswers: PropTypes.object.isRequired,
  answerStates: PropTypes.object.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  firstInputRef: PropTypes.object,
  btnHide: PropTypes.bool.isRequired
}

export default MathGrid 