'use client'

import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthProvider'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	Legend,
	ResponsiveContainer 
} from 'recharts'

const Dashboard = () => {
	const { user } = useContext(AuthContext)
	const [results, setResults] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedProblem, setSelectedProblem] = useState('all')
	const [dateRange, setDateRange] = useState('month')
	const [currentDate, setCurrentDate] = useState(new Date())

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

	// データ取得
	useEffect(() => {
		const fetchResults = async () => {
			if (user) {
				try {
					setLoading(true)
					const resultsCollection = collection(db, "users", user.uid, "results")
					const querySnapshot = await getDocs(resultsCollection)

					const resultsData = []
					querySnapshot.forEach((doc) => {
						resultsData.push({ id: doc.id, ...doc.data() })
					})

					console.log('Fetched results:', resultsData)
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
	console.log('Filtered data:', filteredData)

	// グラフ用のデータを整形
	const chartData = filteredData.map(result => ({
		date: new Date(result.createdAt.seconds * 1000).toLocaleDateString(),
		score: result.score,
		time: result.time,
		problem: result.problemName
	}))
	console.log('Chart data:', chartData)

	if (loading) {
		return <div>Loading...</div>
	}

	return (
		<div>
			{user ? (
				<>
					<h2>{user.displayName || 'User'}のダッシュボード</h2>
          
					<div>
						{/* 問題選択 */}
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

						{/* 期間選択 */}
						<select 
							value={dateRange} 
							onChange={(e) => setDateRange(e.target.value)}
						>
							<option value="month">月表示</option>
							<option value="week">週表示</option>
							<option value="day">日表示</option>
						</select>

						{/* 期間ナビゲーション */}
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

					{chartData.length > 0 ? (
						<div>
							<ResponsiveContainer width="100%" height={400}>
								<BarChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis 
										dataKey="date"
										tick={{ fontSize: 12 }}
									/>
									<YAxis 
										yAxisId="left" 
										orientation="left" 
										stroke="#8884d8"
										tick={{ fontSize: 12 }}
										label={{ 
											value: 'スコア', 
											angle: -90, 
											position: 'insideLeft' 
										}}
									/>
									<YAxis 
										yAxisId="right" 
										orientation="right" 
										stroke="#82ca9d"
										tick={{ fontSize: 12 }}
										label={{ 
											value: '時間(秒)', 
											angle: 90, 
											position: 'insideRight' 
										}}
									/>
									<Tooltip />
									<Legend />
									<Bar 
										yAxisId="left" 
										dataKey="score" 
										fill="#8884d8" 
										name="スコア"
									/>
									<Bar 
										yAxisId="right" 
										dataKey="time" 
										fill="#82ca9d" 
										name="時間(秒)"
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					) : (
						<div>
							<p>選択した期間のデータがありません。</p>
						</div>
					)}
				</>
			) : (
				<div>
					<h2>ログインしてください</h2>
				</div>
			)}
		</div>
	)
}

export default Dashboard