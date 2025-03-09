import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function ProblemSelector({ problems, selectedProblem, onProblemChange, currentUser }) {
  const { t } = useTranslation()

  return (
    <Select value={selectedProblem} onValueChange={onProblemChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={t('math_table.categories.basic')} />
      </SelectTrigger>
      <SelectContent>
        {/* ベーシック問題 */}
        <SelectGroup>
          <SelectLabel>{t('math_table.categories.basic')}</SelectLabel>
          {problems.basic_question_db.map((problem) => (
            <SelectItem
              key={`${problem.collection}/${problem.id}`}
              value={`${problem.collection}/${problem.id}`}
            >
              {problem.name}
            </SelectItem>
          ))}
        </SelectGroup>

        {/* オリジナル問題（ログインユーザーのみ表示） */}
        {currentUser && problems.users.length > 0 && (
          <>
            <div className="my-1 px-2 border-t border-border" />
            <SelectGroup>
              <SelectLabel>{t('math_table.categories.original')}</SelectLabel>
              {problems.users.map((problem) => (
                <SelectItem
                  key={`${problem.collection}/${problem.id}`}
                  value={`${problem.collection}/${problem.id}`}
                >
                  {problem.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  )
}

export default ProblemSelector 