import { useContext, useEffect, useState, useMemo } from "react"
import { AuthContext } from "../context/AuthProvider"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter
} from 'recharts'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Input } from "../components/ui/input"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"  // アイコン用

// 曜日の配列を追加
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const CustomShape = ({ cx, cy, fill, payload }) => {
  const size = (payload.score || 0) * 2
  return (
    <circle
      cx={cx}
      cy={cy}
      r={Math.max(4, Math.min(size, 20))}
      fill={fill}
      stroke="none"
    />
  )
}

CustomShape.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  fill: PropTypes.string.isRequired,
  payload: PropTypes.shape({
    score: PropTypes.number.isRequired
  }).isRequired
}

// 日付フォーマット関数を修正
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  
  // timestampがオブジェクトの場合（Firestore timestamp）
  if (typeof timestamp === 'object' && timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = WEEKDAYS[date.getDay()]
    return `${month}/${day}(${weekday})`
  }
  
  // timestampが数値の場合（ミリ秒）
  if (typeof timestamp === 'number') {
    const date = new Date(timestamp)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = WEEKDAYS[date.getDay()]
    return `${month}/${day}(${weekday})`
  }
  
  return ''
}

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProblem, setSelectedProblem] = useState('all')
  const [dateRange, setDateRange] = useState('month') // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterValue, setFilterValue] = useState('')
  const [visibleColumns, setVisibleColumns] = useState(['date', 'problem', 'score', 'time'])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [problemsData, setProblemsData] = useState({
    basic_question_db: [],
    users: []
  })

  // データ取得のuseEffect
  useEffect(() => {
    const fetchResults = async () => {
      if (user) {
        try {
          setLoading(true)
          const resultsCollection = collection(db, "users", user.uid, "results")
          const querySnapshot = await getDocs(resultsCollection)

          const resultsData = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            resultsData.push({ id: doc.id, ...data })
          })

          setResults(resultsData)
        } catch (error) {
          console.error("Error fetching results:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchResults()
  }, [user])

  // 問題データを取得するuseEffectを追加
  useEffect(() => {
    const fetchProblems = async () => {
      if (user) {
        try {
          // ユーザーの問題を取得
          const userQuestionsRef = collection(db, "users", user.uid, "questions")
          const userQuestionsSnapshot = await getDocs(userQuestionsRef)
          const userQuestions = userQuestionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            collection: 'users'
          }))

          // 基本問題を取得
          const basicQuestionsRef = collection(db, "basic_question_db")
          const basicQuestionsSnapshot = await getDocs(basicQuestionsRef)
          const basicQuestions = basicQuestionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            collection: 'basic_question_db'
          }))

          setProblemsData({
            basic_question_db: basicQuestions,
            users: userQuestions
          })
        } catch (error) {
          console.error("Error fetching problems:", error)
        }
      }
    }

    fetchProblems()
  }, [user])

  // 問題の分類を行う処理を修正
  const categorizedProblems = useMemo(() => {
    // 有効な問題のIDを Set として保持
    const validProblemIds = new Set([
      ...problemsData.basic_question_db.map(p => `basic_question_db/${p.id}`),
      ...problemsData.users.map(p => `users/${p.id}`)
    ])

    return results.reduce((acc, result) => {
      const collection = result.problemCollection || 'basic_question_db'
      const problemKey = `${collection}/${result.problemId}`
      
      // 問題が存在する場合のみ追加
      if (result.problemName && result.problemId && validProblemIds.has(problemKey)) {
        if (!acc[collection]) {
          acc[collection] = new Set()
        }
        
        const problemData = JSON.stringify({
          id: result.problemId,
          name: result.problemName
        })
        
        acc[collection].add(problemData)
      }
      
      return acc
    }, {
      basic_question_db: new Set(),
      users: new Set()
    })
  }, [results, problemsData])

  // 期間の移動処理
  const handleDateNavigation = (direction) => {
    const newDate = new Date(currentDate)
    
    switch(dateRange) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1))
        break
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7))
        break
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -1 : 1))
        break
    }
    setCurrentDate(newDate)
  }

  // 期間の表示文字列を生成
  const getDateRangeLabel = () => {
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    switch(dateRange) {
      case 'month':
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
      case 'week': {
        const startDate = new Date(currentDate)
        startDate.setDate(currentDate.getDate() - currentDate.getDay())
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        return `${formatter.format(startDate)} 〜 ${formatter.format(endDate)}`
      }
      case 'day':
        return formatter.format(currentDate)
      default:
        return ''
    }
  }

  // フィルタリングされたデータを取得する処理も修正
  const getFilteredData = () => {
    // 有効な問題のIDを Set として保持
    const validProblemIds = new Set([
      ...problemsData.basic_question_db.map(p => `basic_question_db/${p.id}`),
      ...problemsData.users.map(p => `users/${p.id}`)
    ])

    let startDate = new Date(currentDate)
    let endDate = new Date(currentDate)

    // 日付範囲の設定（既存のコード）
    switch(dateRange) {
      case 'month':
        startDate.setDate(1)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        break
      case 'week':
        startDate.setDate(currentDate.getDate() - currentDate.getDay())
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'day':
        endDate.setDate(endDate.getDate() + 1)
        break
    }

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return results.filter(result => {
      const resultDate = new Date(result.createdAt.seconds * 1000)
      const problemKey = `${result.problemCollection || 'basic_question_db'}/${result.problemId}`
      
      // 問題フィルタリングの修正
      const problemMatch = selectedProblem === 'all' || selectedProblem === problemKey

      return resultDate >= startDate && 
             resultDate <= endDate && 
             problemMatch &&
             validProblemIds.has(problemKey) // 有効な問題のみ表示
    })
  }

  const filteredResults = getFilteredData()

  // グラフデータの整形部分を修正
  const chartData = filteredResults.map(result => {
    const totalQuestions = result.totalQuestions || 0
    const scorePercentage = totalQuestions > 0 ? (result.score / totalQuestions) * 100 : 0

    return {
      date: result.createdAt.seconds * 1000,  // Unix timestamp（ミリ秒）に変換
      scorePercentage: Math.round(scorePercentage * 10) / 10,
      time: result.time,
      score: result.score,
      problem: result.problemName
    }
  }).sort((a, b) => a.date - b.date)  // 日付順にソート

  // average関数を追加
  const average = (arr) => {
    if (!arr.length) return 0
    return arr.reduce((sum, val) => sum + val, 0) / arr.length
  }

  // 統計計算の関数を追加
  const calculateDetailedStats = () => {
    if (!results.length) return {
      totalTime: 0,
      totalDays: 0,
      maxStreak: 0,
      currentStreak: 0,
      recoveryCount: 0,
      totalProblems: 0,
      averageScore: 0,
      bestScore: 0,
      bestTime: 0,
      improvementRate: 0
    }

    // 日付ごとにグループ化
    const dailyResults = results.reduce((acc, result) => {
      const date = new Date(result.createdAt.seconds * 1000)
      const dateStr = date.toISOString().split('T')[0]
      if (!acc[dateStr]) {
        acc[dateStr] = []
      }
      acc[dateStr].push(result)
      return acc
    }, {})

    // 日付を配列にして昇順ソート
    const sortedDates = Object.keys(dailyResults).sort()

    // 連続日数の計算
    let currentStreak = 0
    let maxStreak = 0
    let recoveryCount = 0
    let lastDate = null

    sortedDates.forEach(dateStr => {
      const currentDate = new Date(dateStr)
      if (lastDate) {
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          if (currentStreak > 0) recoveryCount++
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }
      lastDate = currentDate
    })

    // その他の統計
    const totalTime = results.reduce((sum, r) => sum + (r.time || 0), 0)
    const bestScore = Math.max(...results.map(r => {
      const total = r.totalQuestions || 1
      return (r.score / total) * 100
    }))
    const bestTime = Math.min(...results.filter(r => r.time > 0).map(r => r.time))

    // 成長率の計算部分を修正
    const recentScores = results.slice(-5).map(r => r.score)  // 直近5回の正解数
    const initialScores = results.slice(0, 5).map(r => r.score)  // 最初の5回の正解数

    // 平均値を計算
    const recentAverage = average(recentScores)
    const initialAverage = average(initialScores)

    const improvementRate = recentScores.length && initialScores.length
      ? Math.round(recentAverage - initialAverage)  // 差分を整数に
      : 0

    return {
      totalTime,
      totalDays: sortedDates.length,
      maxStreak,
      currentStreak,
      recoveryCount,
      bestScore: Math.round(bestScore * 10) / 10,
      bestTime,
      improvementRate
    }
  }

  const detailedStats = calculateDetailedStats()

  // カラム定義
  const columns = [
    {
      id: "date",
      name: "日付",
      sortable: true,
    },
    {
      id: "problem",
      name: "問題",
      sortable: true,
    },
    {
      id: "score",
      name: "スコア",
      sortable: true,
    },
    {
      id: "time",
      name: "時間",
      sortable: true,
    },
  ]

  // フィルタリングとソートを適用したデータを取得
  const filteredData = useMemo(() => {
    let filtered = [...filteredResults]
    
    // フィルター適用
    if (filterValue) {
      filtered = filtered.filter(item => 
        item.problemName.toLowerCase().includes(filterValue.toLowerCase()) ||
        formatDate(item.createdAt).includes(filterValue)
      )
    }
    
    // ソート適用
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        
        if (sortConfig.key === 'date') {
          aValue = new Date(a.createdAt.seconds * 1000)
          bValue = new Date(b.createdAt.seconds * 1000)
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    
    return filtered
  }, [filteredResults, filterValue, sortConfig])

  // ページネーション適用
  const paginatedData = useMemo(() => {
    const start = page * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, page, pageSize])

  // ソート処理
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container space-y-4 p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学習継続</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.currentStreak}日</div>
            <p className="text-xs text-muted-foreground">
              連続学習中 / 最高{detailedStats.maxStreak}日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総学習時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(detailedStats.totalTime / 60)}分</div>
            <p className="text-xs text-muted-foreground">
              {detailedStats.totalDays}日間で{detailedStats.totalTime}秒
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ベストスコア</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.bestScore}%</div>
            <p className="text-xs text-muted-foreground">
              最速: {detailedStats.bestTime}秒
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">再開記録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.recoveryCount}回</div>
            <p className="text-xs text-muted-foreground">
              再開した回数
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>学習進捗</CardTitle>
              <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="問題を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="pl-8 font-medium">すべての問題</SelectItem>
                  
                  {/* ベーシック問題 */}
                  <SelectGroup>
                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-muted">ベーシック問題</SelectLabel>
                    {[...categorizedProblems.basic_question_db]
                      .map(problemStr => JSON.parse(problemStr))
                      .filter(problem => problem.exists !== false)  // 存在する問題のみ表示
                      .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
                      .map(problem => (
                        <SelectItem 
                          key={`basic_question_db/${problem.id}`}
                          value={`basic_question_db/${problem.id}`}
                          className="pl-8 hover:bg-accent"
                        >
                          {problem.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  
                  <div className="my-1 px-2 border-t border-border" /> {/* 区切り線 */}
                  
                  {/* オリジナル問題 */}
                  <SelectGroup>
                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-muted">オリジナル問題</SelectLabel>
                    {[...categorizedProblems.users]
                      .map(problemStr => JSON.parse(problemStr))
                      .filter(problem => problem.exists !== false)  // 存在する問題のみ表示
                      .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
                      .map(problem => (
                        <SelectItem 
                          key={`users/${problem.id}`}
                          value={`users/${problem.id}`}
                          className="pl-8 hover:bg-accent"
                        >
                          {problem.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="graph" className="space-y-4">
              <TabsList>
                <TabsTrigger value="graph">チャート</TabsTrigger>
                <TabsTrigger value="list">一覧</TabsTrigger>
              </TabsList>
              
              <TabsContent value="graph" className="space-y-4">
                {/* フィルターUI */}
                <div className="flex items-center justify-between">
                  {/* 期間選択 */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDateNavigation('prev')}
                      >
                        ←
                      </Button>
                      <span className="text-sm font-medium">{getDateRangeLabel()}</span>
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleDateNavigation('next')}
                      >
                        →
                      </Button>
                    </div>

                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="期間" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">月表示</SelectItem>
                        <SelectItem value="week">週表示</SelectItem>
                        <SelectItem value="day">日表示</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* グラフ本体 */}
                <div className="h-[500px]">
                  {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={chartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 35 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          className="stroke-muted"
                        />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ 
                            fontSize: 12,
                            angle: -45,  // 45度傾ける
                            textAnchor: 'end',  // テキストの配置位置
                            dy: 10  // Y方向のオフセット
                          }}
                          height={60}  // 軸の高さを増やして、傾けたテキストが収まるようにする
                          stroke="hsl(var(--foreground))"
                        />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          stroke="hsl(var(--foreground))"
                          label={{ 
                            value: '時間(秒)', 
                            angle: -90, 
                            position: 'insideBottom',
                            offset: 0,
                            style: {
                              fill: "hsl(var(--foreground))",
                              fontSize: 12,
                              fontWeight: 500
                            }
                          }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="hsl(var(--foreground))"
                          label={{ 
                            value: 'スコア(%)', 
                            angle: 90, 
                            position: 'insideBottom',
                            offset: 0,
                            style: {
                              fill: "hsl(var(--foreground))",
                              fontSize: 12,
                              fontWeight: 500
                            }
                          }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            padding: "8px 12px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                          }}
                          labelStyle={{
                            color: "hsl(var(--foreground))",
                            fontWeight: 500,
                            marginBottom: "4px"
                          }}
                          itemStyle={{
                            color: "hsl(var(--foreground))",
                            padding: "2px 0"
                          }}
                        />
                        <Legend 
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{
                            paddingTop: "8px",
                            color: "hsl(var(--foreground))"
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="time"
                          stroke="hsl(var(--primary))"
                          name="時間"
                          dot={{ r: 4, fill: "hsl(var(--primary))" }}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Scatter
                          yAxisId="right"
                          dataKey="score"
                          fill="hsl(var(--muted-foreground))"
                          name="スコア"
                          data={chartData.map(data => ({
                            ...data,
                            z: data.score
                          }))}
                          legendType="circle"
                          shape={CustomShape}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">データがありません</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="list">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="フィルター..."
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto h-8 px-2">
                          Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[150px]">
                        {columns.map((column) => (
                          visibleColumns.includes(column.id) && (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={visibleColumns.includes(column.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setVisibleColumns([...visibleColumns, column.id])
                                } else {
                                  setVisibleColumns(visibleColumns.filter((id) => id !== column.id))
                                }
                              }}
                            >
                              {column.name}
                            </DropdownMenuCheckboxItem>
                          )
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map((column) => (
                            visibleColumns.includes(column.id) && (
                              <TableHead key={column.id} className="h-10">
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSort(column.id)}
                                  className="h-8 px-2 font-medium"
                                  disabled={!column.sortable}
                                >
                                  {column.name}
                                  {sortConfig.key === column.id ? (
                                    sortConfig.direction === 'asc' ? (
                                      <ChevronUp className="ml-2 h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="ml-2 h-4 w-4" />
                                    )
                                  ) : (
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                  )}
                                </Button>
                              </TableHead>
                            )
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((result) => (
                          <TableRow key={result.id} className="h-12">
                            {visibleColumns.includes('date') && (
                              <TableCell>{formatDate(result.createdAt)}</TableCell>
                            )}
                            {visibleColumns.includes('problem') && (
                              <TableCell>{result.problemName}</TableCell>
                            )}
                            {visibleColumns.includes('score') && (
                              <TableCell>
                                <span className="font-medium">{result.score}</span>
                                <span className="text-muted-foreground">/{result.totalQuestions || 0}</span>
                              </TableCell>
                            )}
                            {visibleColumns.includes('time') && (
                              <TableCell>{result.time}秒</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                      {filteredData.length}件中 {paginatedData.length}件を表示
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">表示件数</p>
                        <Select
                          value={pageSize.toString()}
                          onValueChange={(value) => {
                            setPageSize(Number(value))
                            setPage(0)  // ページサイズ変更時は1ページ目に戻す
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 20, 50].map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                        >
                          <span className="sr-only">前のページ</span>
                          <ChevronDown className="h-4 w-4 rotate-90" />
                        </Button>
                        <div className="text-sm font-medium">
                          {page + 1} / {Math.ceil(filteredData.length / pageSize)}
                        </div>
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setPage((p) => Math.min(Math.ceil(filteredData.length / pageSize) - 1, p + 1))}
                          disabled={page >= Math.ceil(filteredData.length / pageSize) - 1}
                        >
                          <span className="sr-only">次のページ</span>
                          <ChevronDown className="h-4 w-4 -rotate-90" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard