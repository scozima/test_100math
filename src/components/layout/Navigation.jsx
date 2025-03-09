import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/auth"
import { useTranslation } from "react-i18next"
import { 
  Home, 
  BookOpen, 
  LayoutDashboard, 
  Settings,
  Lock,
  PenSquare,
  LineChart,
  Timer
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Navigation() {
  const { user } = useAuth()
  const { t } = useTranslation()

  // ログイン案内モーダルの内容
  const LoginPrompt = ({ feature }) => (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{t('login.title')}</DialogTitle>
        <DialogDescription className="space-y-4">
          {/* アクセスしようとした機能の説明 */}
          <p className="text-muted-foreground">
            {feature === t('common.dashboard') ? (
              t('login.features.dashboard')
            ) : feature === t('common.settings') ? (
              t('login.features.problem_management')
            ) : (
              t('login.subtitle')
            )}
          </p>

          {/* ログインのメリット一覧 */}
          <div className="mt-4 space-y-3">
            <h4 className="font-medium">{t('login.benefits.title')}</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <LayoutDashboard className="w-3 h-3" />
                </div>
                <span className="text-sm">{t('login.benefits.progress_tracking')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <PenSquare className="w-3 h-3" />
                </div>
                <span className="text-sm">{t('login.benefits.custom_problems')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <LineChart className="w-3 h-3" />
                </div>
                <span className="text-sm">{t('login.benefits.analytics')}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <Timer className="w-3 h-3" />
                </div>
                <span className="text-sm">{t('login.benefits.progress_save')}</span>
              </li>
            </ul>
          </div>
        </DialogDescription>
      </DialogHeader>
      <div className="mt-6">
        <Button 
          onClick={() => signInWithGoogle()} 
          className="w-full"
          variant="outline"
        >
          <img 
            src="/google-icon.svg" 
            alt="Google" 
            className="w-5 h-5 mr-2"
          />
          {t('login.googleButton')}
        </Button>
      </div>
    </DialogContent>
  )

  // メニュー項目の定義
  const menuItems = [
    {
      path: "/",
      label: t('common.home'),
      icon: <Home className="w-5 h-5" />,
      requiresAuth: false
    },
    {
      path: "/lesson",
      label: t('common.lesson'),
      icon: <BookOpen className="w-5 h-5" />,
      requiresAuth: false
    },
    {
      path: "/dashboard",
      label: t('common.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      requiresAuth: true
    },
    {
      path: "/problem",
      label: t('common.settings'),  // common.problem から common.settings に戻す
      icon: <Settings className="w-5 h-5" />,
      requiresAuth: true
    }
  ]

  return (
    <nav className="flex flex-col relative justify-between h-full">
      {/* メインメニュー */}
      <div className="flex-1 space-y-2 px-4 py-2 overflow-y-auto">
        {menuItems.map((item) => (
          item.requiresAuth && !user ? (
            // 未ログイン時の認証必要なメニュー項目
            <Dialog key={item.path}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground">
                  {item.icon}
                  <span>{item.label}</span>
                  <Lock className="w-4 h-4 ml-auto" />
                </button>
              </DialogTrigger>
              <LoginPrompt feature={item.label} />
            </Dialog>
          ) : (
            // 通常のメニュー項目
            <Link 
              key={item.path}
              to={item.path}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        ))}
      </div>

      {/* ゲストユーザー向けログインボタン */}
      {!user && (
        <div className="p-4 bg-background">
          <Button 
            onClick={() => signInWithGoogle()} 
            className="w-full shadow-lg"
            variant="outline"
          >
            <img 
              src="/google-icon.svg" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            {t('login.googleButton')}
          </Button>
        </div>
      )}
    </nav>
  )
} 