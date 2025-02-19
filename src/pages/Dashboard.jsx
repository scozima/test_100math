import { useContext, useEffect, useState } from "react"
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

// 曜日の配列を追加
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProblem, setSelectedProblem] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('chart')

  // 問題の一覧を取得
  const uniqueProblems = [...new Set(results.map(result => result.problemName))]

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

    const startDate = new Date(currentDate)
    const endDate = new Date(currentDate)

    switch(dateRange) {
      case 'month':
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
      case 'week':
        startDate.setDate(currentDate.getDate() - currentDate.getDay())
        endDate.setDate(startDate.getDate() + 6)
        return `${formatter.format(startDate)} 〜 ${formatter.format(endDate)}`
      case 'day':
        return formatter.format(currentDate)
      default:
        return ''
    }
  }

  // 日付範囲に基づいてデータをフィルタリング
  const getFilteredData = () => {
    let startDate = new Date(currentDate)
    let endDate = new Date(currentDate)

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
      return (
        resultDate >= startDate && 
        resultDate <= endDate &&
        (selectedProblem === 'all' || result.problemName === selectedProblem)
      )
    })
  }

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

  // フィルタリングされたデータの確認
  const filteredData = getFilteredData()

  // 日付フォーマット用のヘルパー関数
  const formatDate = (date) => {
    const d = new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekday = WEEKDAYS[d.getDay()]
    return `${month}/${day}(${weekday})`
  }

  // グラフ用のデータを整形
  const chartData = filteredData
    .map(result => {
      const totalQuestions = result.totalQuestions || 0
      const scorePercentage = totalQuestions > 0 ? (result.score / totalQuestions) * 100 : 0

      return {
        timestamp: result.createdAt.seconds * 1000, // タイムスタンプを追加
        date: formatDate(result.createdAt.seconds * 1000),
        scorePercentage: Math.round(scorePercentage * 10) / 10,
        time: result.time,
        problem: result.problemName
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp) // 古い順にソート

  // テーブル表示部分も同様にソート
  const sortedFilteredData = filteredData
    .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {user ? (
        <>
          <h2>{user.displayName || "User"}</h2>
          
          <div>
            <button onClick={() => setView('chart')}>
              グラフ表示
            </button>
            <button onClick={() => setView('list')}>
              リスト表示
            </button>
          </div>

          <div>
            <select 
              value={selectedProblem} 
              onChange={(e) => setSelectedProblem(e.target.value)}
            >
              <option value="all">全ての問題</option>
              {uniqueProblems.map(problem => (
                <option key={problem} value={problem}>
                  {problem}
                </option>
              ))}
            </select>

            <div>
              <button onClick={() => setDateRange('month')}>
                月表示
              </button>
              <button onClick={() => setDateRange('week')}>
                週表示
              </button>
              <button onClick={() => setDateRange('day')}>
                日表示
              </button>
            </div>

            <div>
              <button onClick={() => handleDateNavigation('prev')}>
                &lt;
              </button>
              <span>{getDateRangeLabel()}</span>
              <button onClick={() => handleDateNavigation('next')}>
                &gt;
              </button>
            </div>
          </div>

          {view === 'chart' ? (
            chartData.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      stroke="#8884d8"
                      label={{ 
                        value: '時間(秒)', 
                        angle: -90, 
                        position: 'insideLeft' 
                      }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                      label={{ 
                        value: 'スコア(%)', 
                        angle: 90, 
                        position: 'insideRight' 
                      }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === '時間') return [`${value}秒`, name]
                        if (name === 'スコア') return [`${value}%`, name]
                        return [value, name]
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="time"
                      stroke="#8884d8"
                      name="時間"
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                    <Scatter
                      yAxisId="right"
                      dataKey="scorePercentage"
                      fill="#82ca9d"
                      name="スコア"
                      data={chartData.map(data => ({
                        ...data,
                        z: data.score
                      }))}
                      legendType="circle"
                      shape={(props) => {
                        const { cx, cy, fill } = props
                        const size = (props.payload.score || 0) * 2 // スコアに基づいて大きさを設定
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={Math.max(4, Math.min(size, 20))} // 最小4px、最大20pxに制限
                            fill={fill}
                            stroke="none"
                          />
                        )
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>選択した期間のデータがありません。</p>
            )
          ) : (
            <div>
              <table className="table02">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>問題</th>
                    <th>スコア</th>
                    <th>時間(秒)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFilteredData.map((result, index) => {
                    const totalQuestions = result.totalQuestions || 0
                    const scorePercentage = totalQuestions > 0 ? (result.score / totalQuestions) * 100 : 0

                    return (
                      <tr key={result.id || index}>
                        <td>{formatDate(result.createdAt.seconds * 1000)}</td>
                        <td>{result.problemName}</td>
                        <td>
                          {result.score}/{totalQuestions} ({Math.round(scorePercentage * 10) / 10}%)
                          <span>（{totalQuestions}問）</span>
                        </td>
                        <td>{result.time}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <h2>ログインしてください</h2>
      )}
    </div>
  )
}

export default Dashboard 