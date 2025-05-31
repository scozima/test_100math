import { Button } from "@/components/ui/button"
import PropTypes from 'prop-types'

function ResultDisplay({ score, time, totalQuestions, onRestart }) {
  return (
    <div className="text-center mt-4">
      <p className="text-lg font-semibold mb-2">
        スコア: {totalQuestions}問中{score}問正解
      </p>
      <p className="text-md mb-4">
        所要時間: {time} 秒
      </p>
      <Button
        onClick={onRestart}
        className="w-32 mx-auto block py-3"
        size="lg"
      >
        もう一度
      </Button>
    </div>
  )
}

ResultDisplay.propTypes = {
  score: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onRestart: PropTypes.func.isRequired,
}

export default ResultDisplay 