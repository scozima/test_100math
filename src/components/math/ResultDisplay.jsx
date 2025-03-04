import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"

function ResultDisplay({ score, time, totalQuestions, onRestart }) {
  const { t } = useTranslation()

  return (
    <div className="text-center mt-4">
      <p className="text-lg font-semibold mb-2">
        {t('math_table.result.score')}: {score} {t('math_table.result.total')} {totalQuestions}
      </p>
      <p className="text-md mb-4">
        {t('math_table.result.time_taken')}: {time} {t('math_table.result.seconds')}
      </p>
      <Button
        onClick={onRestart}
        className="w-32 mx-auto block"
        size="lg"
      >
        {t('math_table.restart')}
      </Button>
    </div>
  )
}

export default ResultDisplay 