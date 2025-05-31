import { useContext, useEffect, useState, useMemo } from "react"
import { AuthContext } from "../context/AuthProvider"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { useTranslation } from "react-i18next"
import dayjs from "dayjs"
import 'dayjs/locale/ja'
import 'dayjs/locale/en'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import localizedFormat from 'dayjs/plugin/localizedFormat'
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
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"

// プラグインを拡張
dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(localizedFormat)

const CustomShape = ({ cx, cy, fill, payload }) => {
  if (!cx || !cy || !fill || !payload) {
    return null
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      fillOpacity={0.5}
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
const formatDate = (timestamp, locale) => {
  if (!timestamp) return '';

  let date;
  // timestampがオブジェクトの場合（Firestore timestamp）
  if (typeof timestamp === 'object' && timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  }
  // timestampが数値の場合（ミリ秒）
  else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  // 指定された言語に基づいてフォーマット
  return dayjs(date).locale(locale).format('MM/DD (ddd)');
}

// 平均値計算のヘルパー関数
const average = (arr) => arr.length ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0

const Dashboard = () => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ja' ? 'ja' : 'en';
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
      
      if (validProblemIds.has(problemKey)) {
        const problemString = JSON.stringify({
          id: result.problemId,
          name: result.problemName,
          collection,
          exists: true
        })
        
        if (!acc[collection].includes(problemString)) {
          acc[collection].push(problemString)
        }
      }
      
      return acc
    }, { basic_question_db: [], users: [] })
  }, [results, problemsData])

  // 日付範囲ラベルを生成する関数
  const getDateRangeLabel = (currentDate, dateRange, locale) => {
    const current = dayjs(currentDate).locale(locale)
    
    switch (dateRange) {
      case 'day':
        return current.format('YYYY年M月D日')
      case 'week': {
        const weekStart = current.startOf('week')
        const weekEnd = current.endOf('week')
        return `${weekStart.format('M/D')} - ${weekEnd.format('M/D')}`
      }
      case 'month':
        return current.format('YYYY年M月')
      default:
        return ''
    }
  }

  // 日付ナビゲーション関数
  const handleDateNavigation = (direction) => {
    const current = dayjs(currentDate)
    let newDate
    
    switch (dateRange) {
      case 'day':
        newDate = direction === -1 ? current.subtract(1, 'day') : current.add(1, 'day')
        break
      case 'week':
        newDate = direction === -1 ? current.subtract(1, 'week') : current.add(1, 'week')
        break
      case 'month':
        newDate = direction === -1 ? current.subtract(1, 'month') : current.add(1, 'month')
        break
      default:
        newDate = current
    }
    
    setCurrentDate(newDate.toDate())
  }

  // フィルタリングされた結果を計算
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      if (!result.createdAt) return false

      let resultDate
      if (typeof result.createdAt === 'object' && result.createdAt.seconds) {
        resultDate = dayjs(result.createdAt.seconds * 1000)
      } else if (typeof result.createdAt === 'number') {
        resultDate = dayjs(result.createdAt)
      } else {
        return false
      }

      const current = dayjs(currentDate)

      let isInRange = false
      switch (dateRange) {
        case 'day':
          isInRange = resultDate.isSame(current, 'day')
          break
        case 'week':
          isInRange = resultDate.isSame(current, 'week')
          break
        case 'month':
          isInRange = resultDate.isSame(current, 'month')
          break
        default:
          isInRange = true
      }

      if (!isInRange) return false

      // 問題フィルター
      if (selectedProblem !== 'all') {
        const [collection, problemId] = selectedProblem.split('/')
        return result.problemCollection === collection && result.problemId === problemId
      }

      return true
    })
  }, [results, currentDate, dateRange, selectedProblem])

  // チャートデータの準備
  const chartData = useMemo(() => {
    return filteredResults.map(result => ({
      date: result.createdAt?.seconds ? result.createdAt.seconds * 1000 : Date.now(),
      score: result.score || 0,
      time: result.time || 0,
      problem: result.problemName || 'Unknown'
    })).sort((a, b) => a.date - b.date)
  }, [filteredResults])

  // 詳細統計を計算する関数
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
      name: t('dashboard.progress.list.tableHeaders.date'),
      sortable: true,
    },
    {
      id: "problem",
      name: t('dashboard.progress.list.tableHeaders.problem'),
      sortable: true,
    },
    {
      id: "score",
      name: t('dashboard.progress.list.tableHeaders.score'),
      sortable: true,
    },
    {
      id: "time",
      name: t('dashboard.progress.list.tableHeaders.time'),
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
        formatDate(item.createdAt, locale).includes(filterValue)
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
  }, [filteredResults, filterValue, sortConfig, locale])

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
        <div className="text-lg">{t('dashboard.loading')}</div>
      </div>
    )
  }

  return (
    <div className="container space-y-4 p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.streak.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.currentStreak}{t('dashboard.stats.streak.current')}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.streak.max')}{detailedStats.maxStreak}{t('dashboard.stats.streak.current')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.totalTime.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(detailedStats.totalTime / 60)}{t('dashboard.stats.totalTime.minutes')}</div>
            <p className="text-xs text-muted-foreground">
              {detailedStats.totalDays}{t('dashboard.stats.totalTime.days')}{detailedStats.totalTime}{t('dashboard.stats.totalTime.seconds')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.bestScore.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.bestScore}{t('dashboard.stats.bestScore.percent')}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.bestScore.fastestTime')} {detailedStats.bestTime}{t('dashboard.stats.totalTime.seconds')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.recovery.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedStats.recoveryCount}{t('dashboard.stats.recovery.times')}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.recovery.description')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.progress.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>

            <div className="flex items-center justify-between mb-4">
              <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                <SelectTrigger className="w-fit min-w-[200px] max-w-[300px]">
                  <SelectValue placeholder={t('dashboard.progress.problemSelect.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="pl-8 font-medium">{t('dashboard.progress.problemSelect.all')}</SelectItem>

                  {/* ベーシック問題 */}
                  <SelectGroup>
                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-muted">{t('dashboard.progress.problemSelect.basic')}</SelectLabel>
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
                    <SelectLabel className="px-2 py-1.5 text-sm font-semibold bg-muted">{t('dashboard.progress.problemSelect.original')}</SelectLabel>
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
              {/* 期間選択 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDateNavigation(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">{getDateRangeLabel(currentDate, dateRange, locale)}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDateNavigation(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(new Date())}
                    className="px-10"
                  >
                    {t('dashboard.progress.dateRange.today')}
                  </Button>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder={t('dashboard.progress.dateRange.period')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">{t('dashboard.progress.dateRange.month')}</SelectItem>
                      <SelectItem value="week">{t('dashboard.progress.dateRange.week')}</SelectItem>
                      <SelectItem value="day">{t('dashboard.progress.dateRange.day')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Tabs defaultValue="graph" className="space-y-4">
              <TabsList>
                <TabsTrigger value="graph">{t('dashboard.progress.tabs.chart')}</TabsTrigger>
                <TabsTrigger value="list">{t('dashboard.progress.tabs.list')}</TabsTrigger>
              </TabsList>

              <TabsContent value="graph" className="space-y-4">
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
                          tickFormatter={(str) => formatDate(str, locale)}
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
                            value: t('dashboard.progress.chart.timeAxis'),
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
                            value: t('dashboard.progress.chart.scoreAxis'),
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
                          labelFormatter={(label) => {
                            const data = chartData.find(item => item.date === label)
                            return data ? data.problem : ''
                          }}
                          formatter={(value, name) => {
                            if (name === t('dashboard.progress.chart.time')) return [`${value}${t('dashboard.stats.totalTime.seconds')}`, name]
                            if (name === t('dashboard.progress.chart.score')) return [`${value}${t('dashboard.stats.bestScore.percent')}`, name]
                            return [value, name]
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
                          name={t('dashboard.progress.chart.time')}
                          dot={{ r: 4, fill: "hsl(var(--primary))" }}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Scatter
                          yAxisId="right"
                          dataKey="score"
                          fill="hsl(var(--muted-foreground))"
                          name={t('dashboard.progress.chart.score')}
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
                      <p className="text-muted-foreground">{t('dashboard.progress.chart.noData')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="list">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={t('dashboard.progress.list.filter')}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto h-8 px-2">
                          {t('dashboard.progress.list.columns')} <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[150px]">
                        {columns.map((column) => (
                          visibleColumns.includes(column.id) && (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={visibleColumns.includes(column.id)}
                              onCheckedChange={() => {
                                setVisibleColumns(prev => 
                                  prev.includes(column.id) 
                                    ? prev.filter(c => c !== column.id)
                                    : [...prev, column.id]
                                )
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
                                {column.sortable ? (
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleSort(column.id)}
                                    className="h-8 px-2 font-medium"
                                    disabled={!column.sortable}
                                  >
                                    {t(`dashboard.progress.list.tableHeaders.${column.id}`)}
                                    {sortConfig.key === column.id ? (
                                      sortConfig.direction === 'asc' ? (
                                        <ChevronUp className="ml-2 h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                      )
                                    ) : (
                                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                                    )}
                                  </Button>
                                ) : (
                                  t(`dashboard.progress.list.tableHeaders.${column.id}`)
                                )}
                              </TableHead>
                            )
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                              {t('dashboard.progress.chart.noData')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedData.map((result) => (
                            <TableRow key={result.id}>
                              {visibleColumns.includes('date') && (
                                <TableCell>{formatDate(result.createdAt, locale)}</TableCell>
                              )}
                              {visibleColumns.includes('problem') && (
                                <TableCell>{result.problemName || 'Unknown'}</TableCell>
                              )}
                              {visibleColumns.includes('score') && (
                                <TableCell>{result.score}%</TableCell>
                              )}
                              {visibleColumns.includes('time') && (
                                <TableCell>{result.time}{t('dashboard.stats.totalTime.seconds')}</TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* ページネーション */}
                  <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                      {filteredData.length}{t('dashboard.progress.list.pagination.showing')} {paginatedData.length}{t('dashboard.progress.list.pagination.display')}
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{t('dashboard.progress.list.pagination.pageSize')}</p>
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
                          <span className="sr-only">{t('dashboard.progress.list.pagination.prev')}</span>
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
                          <span className="sr-only">{t('dashboard.progress.list.pagination.next')}</span>
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