import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useEffect } from 'react'

// ページコンポーネント
import { Home } from '@/pages/home'
import { Lesson } from '@/pages/lesson'
import { Login } from '@/pages/login'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Dashboard } from '@/pages/dashboard'
import { Progress } from '@/pages/progress'
// ... その他のインポート

export default function App() {
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 初期アクセス時の処理
    if (!loading) {
      // ログインページにいる場合
      if (location.pathname === '/login') {
        if (user) {
          // ログイン済みならダッシュボードへ
          navigate('/dashboard', { replace: true })
        } else {
          // 未ログインならホームへ
          navigate('/', { replace: true })
        }
      }
    }
  }, [user, loading, navigate, location])

  // ローディング中は何もレンダリングしない
  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      {/* パブリックルート */}
      <Route path="/" element={<Home />} />
      <Route path="/lesson" element={<Lesson />} />

      {/* 認証必要なルート */}
      <Route
        path="/dashboard/*"
        element={
          user ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/progress" element={<Progress />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ログインページ - 未認証時のみアクセス可能 */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />  // ログインしていない場合はホームページへ
          )
        } 
      />

      {/* 404ページ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
} 