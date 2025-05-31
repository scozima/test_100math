import { useTranslation } from "react-i18next"
import { useMathGame } from "@/hooks/useMathGame"
import ProblemSelector from './math/ProblemSelector'
import MathGrid from './math/MathGrid'
import ResultDisplay from './math/ResultDisplay'
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function MathTable() {
  const { t } = useTranslation()
  const {
    start,
    userAnswers,
    score,
    time,
    isFormValid,
    answerStates,
    btnHide,
    array,
    problems,
    selectedProblem,
    currentUser,
    firstInputRef,
    totalQuestions,
    correctAnswers,
    handleProblemSelection,
    startGame,
    resetGame,
    handleAnswerChange,
    calculateAndSaveResults
  } = useMathGame()

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 問題選択セクション */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">{t('math_table.title')}</h2>
        </CardHeader>
        <CardContent>
          <ProblemSelector
            problems={problems}
            selectedProblem={selectedProblem}
            onProblemChange={handleProblemSelection}
            currentUser={currentUser}
          />
        </CardContent>
      </Card>

      {/* ゲームエリア */}
      {array.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <MathGrid
              problemData={array[0]}
              start={start}
              userAnswers={userAnswers}
              answerStates={answerStates}
              isFormValid={isFormValid}
              onAnswerChange={handleAnswerChange}
              onStart={startGame}
              onSubmit={calculateAndSaveResults}
              onReset={resetGame}
              firstInputRef={firstInputRef}
              btnHide={btnHide}
            />
          </CardContent>
        </Card>
      )}

      {/* 結果表示 */}
      {score !== null && (
        <ResultDisplay
          score={correctAnswers}
          time={time}
          totalQuestions={totalQuestions}
          onRestart={resetGame}
        />
      )}
    </div>
  )
}

export default MathTable