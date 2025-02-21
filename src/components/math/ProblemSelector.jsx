import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ProblemSelector = ({ problems, selectedProblem, selectedCollection, onProblemSelection }) => {
  const currentValue = selectedProblem ? `${selectedCollection}/${selectedProblem}` : ""

  return (
    <Select value={currentValue} onValueChange={onProblemSelection}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="問題を選択" />
      </SelectTrigger>
      <SelectContent>
        {/* ベーシック問題 */}
        <SelectGroup>
          <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-muted">
            ベーシック問題
          </SelectLabel>
          {problems.basic_question_db.map((problem) => (
            <SelectItem
              key={`basic_question_db/${problem.id}`}
              value={`basic_question_db/${problem.id}`}
              className="pl-8"
            >
              {problem.name}
            </SelectItem>
          ))}
        </SelectGroup>

        <div className="my-1 px-2 border-t border-border" />

        {/* オリジナル問題 */}
        <SelectGroup>
          <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-muted">
            オリジナル問題
          </SelectLabel>
          {problems.users.map((problem) => (
            <SelectItem
              key={`users/${problem.id}`}
              value={`users/${problem.id}`}
              className="pl-8"
            >
              {problem.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ProblemSelector 