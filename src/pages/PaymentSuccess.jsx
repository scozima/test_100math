import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    }
    
    // 3秒後にローディングを解除
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [searchParams])

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const handleGoToHome = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h2 className="text-lg font-semibold">決済処理中...</h2>
              <p className="text-sm text-muted-foreground text-center">
                決済の確認を行っています。しばらくお待ちください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            決済完了！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              プレミアムプランへのアップグレードが完了しました
            </p>
            <p className="text-sm text-muted-foreground">
              これで全ての機能をお使いいただけます。
            </p>
            {sessionId && (
              <p className="text-xs text-muted-foreground mt-4">
                セッションID: {sessionId.substring(0, 20)}...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">プレミアム機能</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 無制限のカスタム問題作成</li>
              <li>• 高度な分析機能</li>
              <li>• 優先サポート</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            {user ? (
              <Button onClick={handleGoToDashboard} className="w-full">
                ダッシュボードへ移動
              </Button>
            ) : (
              <Button onClick={handleGoToHome} className="w-full">
                ホームへ移動
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSuccess 