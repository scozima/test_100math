import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useContext, useState } from "react"
import { AuthContext } from "@/context/AuthProvider"
import Header from "@/components/Header"
import { 
  Home,
  BookOpen,
  LayoutDashboard,
  Settings
} from "lucide-react"
import { useTranslation } from "react-i18next"

function MainLayout({ children }) {
  const { user, logout } = useContext(AuthContext)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  const isCurrentPath = (path) => {
    return location.pathname === path
  }

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false)
  }

  const menuItems = [
    { 
      path: "/", 
      label: t("common.home"),
      icon: <Home className="h-4 w-4" />
    },
    { 
      path: "/lesson", 
      label: t("common.lesson"),
      icon: <BookOpen className="h-4 w-4" />
    },
    { 
      path: "/dashboard", 
      label: t("common.dashboard"),
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    { 
      path: "/problem", 
      label: t("common.settings"),
      icon: <Settings className="h-4 w-4" />
    },
  ]

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {/* サイドバー */}
      <div className={cn(
        "border-r bg-background",
        "fixed inset-y-0 z-50 w-[280px] transition-transform duration-300 lg:static lg:block",
        "shadow-lg",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center justify-between border-b px-6">
            <Link 
              to="/" 
              className="font-semibold"
              onClick={handleMenuItemClick}
            >
              100math
            </Link>
            <Button 
              variant="ghost" 
              className="lg:hidden" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✕
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium gap-2">
              {menuItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={handleMenuItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isCurrentPath(path) 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* オーバーレイ - モバイルでメニューを開いたときに表示 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* メインコンテンツ */}
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
          <Button 
            variant="ghost" 
            className="lg:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            ☰
          </Button>
          <Header />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout 