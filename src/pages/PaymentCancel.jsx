import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function PaymentCancel() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const handleGoToHome = () => {
    navigate('/')
  }

  const handleRetryPayment = () => {
    // プレミアムアップグレードダイアログを開く処理
    // または直接決済ページに戻る
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600">
            決済がキャンセルされました
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              プレミアムプランへのアップグレードがキャンセルされました
            </p>
            <p className="text-sm text-muted-foreground">
              いつでも再度アップグレードをお試しいただけます。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">プレミアム機能（利用開始をお待ちしています）</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 無制限のカスタム問題作成</li>
              <li>• 高度な分析機能</li>
              <li>• 優先サポート</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <Button onClick={handleRetryPayment} className="w-full">
              再度アップグレードを試す
            </Button>
            
            {user ? (
              <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
                ダッシュボードへ戻る
              </Button>
            ) : (
              <Button onClick={handleGoToHome} variant="outline" className="w-full">
                ホームへ戻る
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentCancel 