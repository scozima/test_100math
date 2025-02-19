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

type DateRange = 'month' | 'week' | 'day'
type Result = {
	id: string
	problemName: string
	score: number
	time: number
	createdAt: {
		seconds: number
	}
}

const Dashboard = () => {
	const { user } = useContext(AuthContext)
	const [results, setResults] = useState<Result[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedProblem, setSelectedProblem] = useState('all')
	const [dateRange, setDateRange] = useState<DateRange>('month')
	const [currentDate, setCurrentDate] = useState(new Date())

	// ... existing code ...

	return (
		<div className="p-6">
			{user ? (
				<>
					<h2 className="text-2xl font-bold mb-6">
						{user.displayName || 'User'}のダッシュボード
					</h2>
          
					<div className="flex items-center gap-4 mb-6">
						{/* 問題選択 */}
						<select 
							value={selectedProblem} 
							onChange={(e) => setSelectedProblem(e.target.value)}
							className="select select-bordered w-full max-w-xs"
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
							onChange={(e) => setDateRange(e.target.value as DateRange)}
							className="select select-bordered w-full max-w-xs"
						>
							<option value="month">月表示</option>
							<option value="week">週表示</option>
							<option value="day">日表示</option>
						</select>

						{/* 期間ナビゲーション */}
						<div className="flex items-center gap-2">
							<button 
								onClick={() => handleDateNavigation('prev')}
								className="btn btn-circle"
							>
								&lt;
							</button>
							<span className="px-4 font-medium">
								{getDateRangeLabel()}
							</span>
							<button 
								onClick={() => handleDateNavigation('next')}
								className="btn btn-circle"
							>
								&gt;
							</button>
						</div>
					</div>

					{chartData.length > 0 ? (
						<div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4">
							<ResponsiveContainer>
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
						<div className="text-center py-8 bg-gray-50 rounded-lg">
							<p className="text-gray-600">
								選択した期間のデータがありません。
							</p>
						</div>
					)}
				</>
			) : (
				<div className="text-center py-8">
					<h2 className="text-xl font-medium text-gray-700">
						ログインしてください
					</h2>
				</div>
			)}
		</div>
	)
}

export default Dashboard 