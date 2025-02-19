'use client'

import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/AuthProvider'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid, 
	Tooltip, 
	Legend,
	ResponsiveContainer,
	Scatter,
	ComposedChart
} from 'recharts'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CustomShape = ({ cx, cy, fill, payload }) => {
	if (!cx || !cy || !fill || !payload) {
		return null
	}

	const size = (payload.score ?? 0) * 2
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
		return (
			<div className="space-y-4 p-4">
				<Skeleton className="h-8 w-[250px]" />
				<div className="space-y-2">
					<Skeleton className="h-10 w-[200px]" />
					<Skeleton className="h-10 w-[200px]" />
					<Skeleton className="h-[400px] w-full" />
				</div>
			</div>
		)
	}

	return (
		<div className="p-4 space-y-4">
			{user ? (
				<>
					<h2 className="text-2xl font-bold">
						{user.displayName || 'User'}のダッシュボード
					</h2>
          
					<div className="flex flex-wrap gap-4 items-center">
						<Select
							value={selectedProblem}
							onValueChange={setSelectedProblem}
						>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="問題を選択" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">全ての問題</SelectItem>
								{uniqueProblems.map(problem => (
									<SelectItem key={problem} value={problem}>
										{problem}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={dateRange}
							onValueChange={setDateRange}
						>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="期間を選択" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="month">月表示</SelectItem>
								<SelectItem value="week">週表示</SelectItem>
								<SelectItem value="day">日表示</SelectItem>
							</SelectContent>
						</Select>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => handleDateNavigation('prev')}
							>
								&lt;
							</Button>
							<span className="min-w-[120px] text-center">
								{getDateRangeLabel()}
							</span>
							<Button
								variant="outline"
								size="icon"
								onClick={() => handleDateNavigation('next')}
							>
								&gt;
							</Button>
						</div>
					</div>

					<Tabs defaultValue="graph" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="graph">チャート</TabsTrigger>
							<TabsTrigger value="list">一覧</TabsTrigger>
						</TabsList>
					</Tabs>

					{chartData.length > 0 ? (
						<Card>
							<CardHeader>
								<CardTitle>学習進捗</CardTitle>
							</CardHeader>
							<CardContent>
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
											shape={CustomShape}
										/>
									</ComposedChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-6">
								<p className="text-center text-muted-foreground">
									選択した期間のデータがありません。
								</p>
							</CardContent>
						</Card>
					)}
				</>
			) : (
				<Card>
					<CardContent className="p-6">
						<h2 className="text-xl font-semibold text-center">
							ログインしてください
						</h2>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

export default Dashboard