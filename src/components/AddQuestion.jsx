import { useState, useEffect } from "react"
import { doc, updateDoc, collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore"
import { db, auth } from '../firebase'
import PropTypes from 'prop-types'

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
      toast.error("すべての項目を入力してください")
      return
    }

    const xArray = x.split(",").map(Number)
    const yArray = y.split(",").map(Number)
    
    const user = auth.currentUser
    if (!user) {
      toast.error("ログインしてください")
      return
    }

    const userUid = user.uid
    const userCollectionRef = collection(db, "users", userUid, "questions")

    try {
      if (problem) {
        const problemRef = doc(userCollectionRef, problem.id)
        await updateDoc(problemRef, {
          name,
          operator,
          x: xArray,
          y: yArray,
          updatedAt: serverTimestamp(),
        })
        toast.success("更新しました")
      } else {
        const q = query(userCollectionRef, where("name", "==", name))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          toast.error("同じ問題名が既に存在します")
          return
        }

        await addDoc(userCollectionRef, {
          name,
          operator,
          x: xArray,
          y: yArray,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        toast.success("登録しました")
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
      toast.error("エラーが発生しました：" + error.message)
    }
  }

  return (
    <Card className="w-full min-w-[500px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            問題名
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：足し算レベル1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator">
            演算子
          </Label>
          <Select value={operator} onValueChange={setOperator}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
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
            Xの値
            <span className="text-sm text-muted-foreground ml-2">
              (カンマ区切りで入力)
            </span>
          </Label>
          <Input
            id="x"
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="例：1, 2, 3, 4, 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="y">
            Yの値
            <span className="text-sm text-muted-foreground ml-2">
              (カンマ区切りで入力)
            </span>
          </Label>
          <Input
            id="y"
            value={y}
            onChange={(e) => setY(e.target.value)}
            placeholder="例：1, 2, 3, 4, 5"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={closeModal}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>
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
