import { useState, useRef, useEffect } from 'react'
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase'

export function useMathGame() {
  const [start, setStart] = useState(false)
  const [userAnswers, setUserAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [time, setTime] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [answerStates, setAnswerStates] = useState({})
  const [btnHide, setBtnHide] = useState(false)
  const [array, setArray] = useState([])
  const [problems, setProblems] = useState({ basic_question_db: [], users: [] })
  const [selectedProblem, setSelectedProblem] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const firstInputRef = useRef(null)

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  // 問題データの取得
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // ベーシック問題を取得（ログイン不要）
        const basicSnapshot = await getDocs(collection(db, "basic_question_db"))
        const basicList = basicSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          collection: "basic_question_db",
        }))

        // カスタム問題はログインユーザーのみ取得
        let customList = []
        if (currentUser) {
          const userQuestionsRef = collection(db, `users/${currentUser.uid}/questions`)
          const userQuestionsSnapshot = await getDocs(userQuestionsRef)
          customList = userQuestionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            collection: "users",
            path: doc.ref.path
          }))
        }

        setProblems({ basic_question_db: basicList, users: customList })

        // 初期選択問題の設定
        if (basicList.length > 0) {
          const firstProblem = basicList[0]
          const problemKey = `${firstProblem.collection}/${firstProblem.id}`
          setSelectedProblem(problemKey)
          
          // 初期問題データをロード
          const problemData = await loadProblemData(firstProblem.id, firstProblem.collection)
          if (problemData) {
            setArray([problemData])
            setTotalQuestions(problemData.x.length * problemData.y.length)
          }
        } else if (customList.length > 0 && currentUser) {
          const firstProblem = customList[0]
          const problemKey = `${firstProblem.collection}/${firstProblem.id}`
          setSelectedProblem(problemKey)
          
          // 初期問題データをロード
          const problemData = await loadProblemData(firstProblem.id, firstProblem.collection)
          if (problemData) {
            setArray([problemData])
            setTotalQuestions(problemData.x.length * problemData.y.length)
          }
        }
      } catch (error) {
        console.error("Error fetching problems:", error)
      }
    }

    fetchProblems()
  }, [currentUser])

  // 問題の読み込み
  const loadProblemData = async (problemId, collection) => {
    try {
      let docRef
      if (collection === "users" && currentUser) {
        docRef = doc(db, "users", currentUser.uid, "questions", problemId)
      } else {
        docRef = doc(db, collection, problemId)
      }

      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        // x, y配列を数値に変換
        return {
          ...data,
          x: Array.isArray(data.x) ? data.x.map(val => Number(val)) : [],
          y: Array.isArray(data.y) ? data.y.map(val => Number(val)) : []
        }
      }
    } catch (error) {
      console.error("Error loading problem:", error)
    }
    return null
  }

  // 問題選択のハンドリング
  const handleProblemSelection = async (value) => {
    const [collection, problemId] = value.split("/")
    setSelectedProblem(value)

    const problemData = await loadProblemData(problemId, collection)
    if (problemData) {
      setArray([problemData])
      setTotalQuestions(problemData.x.length * problemData.y.length)
    }

    // ゲーム状態をリセット
    resetGame()
  }

  // ゲーム開始
  const startGame = () => {
    setStart(true)
    setStartTime(Date.now())
    setBtnHide(false)
    
    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus()
      }
    }, 100)
  }

  // ゲームリセット
  const resetGame = () => {
    setStart(false)
    setUserAnswers({})
    setScore(null)
    setTime(null)
    setStartTime(null)
    setIsFormValid(false)
    setAnswerStates({})
    setBtnHide(false)
    setCorrectAnswers(0)
  }

  // 回答の処理
  const handleAnswerChange = (key, value) => {
    const newAnswers = { ...userAnswers, [key]: value }
    setUserAnswers(newAnswers)

    // フォームの妥当性チェック
    if (array.length > 0) {
      const totalQuestions = array[0].x.length * array[0].y.length
      const answeredQuestions = Object.keys(newAnswers).filter(k => newAnswers[k] !== "").length
      setIsFormValid(answeredQuestions === totalQuestions)
    }
  }

  // 結果の計算と保存
  const calculateAndSaveResults = async () => {
    if (!array.length || !currentUser) return

    const endTime = Date.now()
    const timeTaken = Math.round((endTime - startTime) / 1000)
    
    let correctCount = 0
    const newAnswerStates = {}
    const problemData = array[0]

    console.log('=== DEBUG: SCORING START ===')
    console.log('Problem Data:', problemData)
    console.log('User Answers:', userAnswers)

    // 正解数をカウント - MathGrid.jsxと同じループ構造
    problemData.y.forEach((rowValue, rowIndex) => {
      problemData.x.forEach((colValue, colIndex) => {
        // MathGrid.jsxと完全に同じキー生成方法
        const key = `${rowIndex}-${colIndex}_${rowValue}${problemData.operator}${colValue}`
        const userAnswer = parseInt(userAnswers[key])
        let correctAnswer

        switch (problemData.operator) {
          case "+":
            correctAnswer = Number(rowValue) + Number(colValue)
            break
          case "-":
            correctAnswer = Number(rowValue) - Number(colValue)
            break
          case "✕":
            correctAnswer = Number(rowValue) * Number(colValue)
            break
          case "÷":
            correctAnswer = Number(rowValue) / Number(colValue)
            break
          default:
            correctAnswer = 0
        }

        const isCorrect = userAnswer === correctAnswer
        if (isCorrect) correctCount++
        
        console.log(`DEBUG: Key="${key}", UserAnswer=${userAnswer}, CorrectAnswer=${correctAnswer}, IsCorrect=${isCorrect}`)
        
        newAnswerStates[key] = isCorrect ? "correct" : "incorrect"
      })
    })

    console.log('=== DEBUG: SCORING END ===')
    console.log('Correct Count:', correctCount)
    console.log('Total Questions:', problemData.x.length * problemData.y.length)
    console.log('Answer States:', newAnswerStates)

    const totalQuestions = problemData.x.length * problemData.y.length
    const finalScore = Math.round((correctCount / totalQuestions) * 100)

    setScore(finalScore)
    setTime(timeTaken)
    setAnswerStates(newAnswerStates)
    setBtnHide(true)
    setCorrectAnswers(correctCount)

    // 結果をFirestoreに保存
    try {
      const [collectionName, problemId] = selectedProblem.split("/")
      const problem = problems[collectionName]?.find(p => p.id === problemId)
      
      await addDoc(collection(db, "users", currentUser.uid, "results"), {
        score: finalScore,
        time: timeTaken,
        problemName: problem?.name || "Unknown Problem",
        problemId: problemId,
        problemCollection: collectionName,
        totalQuestions: totalQuestions,
        correctAnswers: correctCount,
        createdAt: new Date(),
      })
    } catch (error) {
      console.error("Error saving result:", error)
    }
  }

  return {
    // State
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
    
    // Actions
    handleProblemSelection,
    startGame,
    resetGame,
    handleAnswerChange,
    calculateAndSaveResults
  }
} 