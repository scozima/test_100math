import { useState, useEffect } from "react"
import { doc, updateDoc, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore"
import { db, auth } from '../firebase'
import PropTypes from 'prop-types'
import { useTranslation } from "react-i18next"
import { usePlanRestrictions } from "@/hooks/usePlanRestrictions"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Label from "@/components/ui/label"

const AddQuestion = ({ title, btnTitle, problem, closeModal }) => {
  const { t } = useTranslation()
  const { canCreateCustomProblem, customProblemCount, userPlan } = usePlanRestrictions()
  const [name, setName] = useState(problem?.name || "")
  const [operator, setOperator] = useState(problem?.operator || "")
  const [x, setX] = useState(problem?.x ? problem.x.join(", ") : "")
  const [y, setY] = useState(problem?.y ? problem.y.join(", ") : "")

  useEffect(() => {
    if (problem) {
      setName(problem.name || "")
      setOperator(problem.operator || "")
      setX(problem.x ? problem.x.join(", ") : "")
      setY(problem.y ? problem.y.join(", ") : "")
    }
  }, [problem])

  const handleSubmit = async () => {
    if (!name || !operator || !x || !y) {
      toast.error(t('problem.addQuestion.errorAllFields'))
      return
    }

    const user = auth.currentUser
    if (!user) {
      toast.error(t('problem.addQuestion.errorLogin'))
      return
    }

    // 新規作成の場合のみプラン制限をチェック
    if (!problem && !canCreateCustomProblem()) {
      if (userPlan === 'standard') {
        toast.error(`スタンダードプランでは、カスタム問題を1つまで作成できます。現在の作成数: ${customProblemCount}/1`)
      } else {
        toast.error('カスタム問題を作成するには、プレミアムプランが必要です。')
      }
      return
    }

    const xArray = x.split(",").map(Number)
    const yArray = y.split(",").map(Number)
    
    const userUid = user.uid
    const userCollectionRef = collection(db, "users", userUid, "questions")

    try {
      if (problem) {
        // 編集の場合
        const problemRef = doc(userCollectionRef, problem.id)
        await updateDoc(problemRef, {
          name,
          operator,
          x: xArray,
          y: yArray,
          updatedAt: serverTimestamp(),
        })
        toast.success(t('problem.addQuestion.successUpdate'))
      } else {
        // 新規作成の場合
        const q = query(userCollectionRef, where("name", "==", name))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          toast.error(t('problem.addQuestion.errorDuplicateName'))
          return
        }

        await addDoc(userCollectionRef, {
          name,
          operator,
          x: xArray,
          y: yArray,
          createdBy: userUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        toast.success(t('problem.addQuestion.successRegister'))
      }

      // closeModalが存在する場合のみ実行
      if (closeModal) {
        closeModal()
      }

      // フォームをリセット（すべての処理が成功した後）
      setName("")
      setOperator("")
      setX("")
      setY("")
      
    } catch (error) {
      console.error("エラー:", error)
      toast.error(t('problem.addQuestion.error') + error.message)
    }
  }

  return (
    <Card className="w-full min-w-[500px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {/* プラン制限の表示 */}
        {userPlan === 'standard' && !problem && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            スタンダードプラン: カスタム問題 {customProblemCount}/1
            {customProblemCount >= 1 && (
              <div className="text-destructive font-medium mt-1">
                制限に達しています。無制限に作成するにはプレミアムプランにアップグレードしてください。
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('problem.addQuestion.problemName')}
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('problem.addQuestion.problemNameExample')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator">
            {t('problem.addQuestion.operator')}
          </Label>
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger>
              <SelectValue placeholder={t('problem.addQuestion.operatorPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {["+", "-", "✕", "÷"].map((op) => (
                <SelectItem key={op} value={op}>
                  {op}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="x">
            {t('problem.addQuestion.xValues')}
            <span className="text-sm text-muted-foreground ml-2">
              {t('problem.addQuestion.xValuesNote')}
            </span>
          </Label>
          <Input
            id="x"
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder={t('problem.addQuestion.xValuesExample')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="y">
            {t('problem.addQuestion.yValues')}
            <span className="text-sm text-muted-foreground ml-2">
              {t('problem.addQuestion.yValuesNote')}
            </span>
          </Label>
          <Input
            id="y"
            value={y}
            onChange={(e) => setY(e.target.value)}
            placeholder={t('problem.addQuestion.yValuesExample')}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={closeModal}>
            {t('problem.addQuestion.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!problem && !canCreateCustomProblem()}
          >
            {btnTitle}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

AddQuestion.propTypes = {
  title: PropTypes.string.isRequired,
  btnTitle: PropTypes.string.isRequired,
  problem: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    operator: PropTypes.string,
    x: PropTypes.arrayOf(PropTypes.number),
    y: PropTypes.arrayOf(PropTypes.number)
  }),
  closeModal: PropTypes.func
}

export default AddQuestion
