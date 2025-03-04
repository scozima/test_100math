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

function ProblemSelector({ problems, selectedCollection, selectedProblem, onProblemSelection }) {
  const { t } = useTranslation()

  return (
    <Select
      value={`${selectedCollection}/${selectedProblem}`}
      onValueChange={onProblemSelection}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="問題を選択" />
      </SelectTrigger>
      <SelectContent>
        {problems.basic_question_db.length > 0 && (
          <SelectGroup>
            <SelectLabel>{t('math_table.categories.basic')}</SelectLabel>
            {problems.basic_question_db.map((problem) => (
              <SelectItem
                key={problem.id}
                value={`${problem.collection}/${problem.id}`}
              >
                {problem.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {problems.users.length > 0 && (
          <SelectGroup>
            <SelectLabel>{t('math_table.categories.original')}</SelectLabel>
            {problems.users.map((problem) => (
              <SelectItem
                key={problem.id}
                value={`${problem.collection}/${problem.id}`}
              >
                {problem.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}

export default ProblemSelector 