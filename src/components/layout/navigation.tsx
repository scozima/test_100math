import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { signInWithGoogle, logout } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Navigation() {
  const [user] = useAuthState(auth)

  return (
    <nav className="fixed right-0 top-0 h-screen w-64 bg-background border-l p-4 flex flex-col">
      {/* パブリックメニュー */}
      <div className="flex-1 space-y-2">
        <Link 
          to="/" 
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
        >
          <Home className="w-5 h-5" />
          <span>ホーム</span>
        </Link>
        
        <Link 
          to="/lesson" 
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
        >
          <BookOpen className="w-5 h-5" />
          <span>レッスン</span>
        </Link>

        {/* ログイン済みの場合のみ表示するメニュー */}
        {user && (
          <>
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>ダッシュボード</span>
            </Link>
            {/* ... その他のログイン済みユーザー向けメニュー */}
          </>
        )}
      </div>

      {/* ログインボタン / ユーザー情報 */}
      <div className="border-t pt-4">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2">
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || ''} 
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.displayName}
                </p>
              </div>
            </div>
            <Button 
              onClick={logout}
              variant="ghost"
              className="w-full flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => signInWithGoogle()} 
            className="w-full"
            variant="outline"
          >
            <img 
              src="google-icon.svg" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            Googleでログイン
          </Button>
        )}
      </div>
    </nav>
  )
} 