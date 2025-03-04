import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain, Clock, PenSquare, Target } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

function Home() {
  const { t } = useTranslation()

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: t("home.feature1.title", "基本的な計算力の向上"),
      description: t("home.feature1.description", "足し算、引き算、掛け算、割り算の基礎を楽しく習得できます。")
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: t("home.feature2.title", "タイムトライアル"),
      description: t("home.feature2.description", "時間を計測しながら問題に挑戦。自己ベストを更新していきましょう。")
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: t("home.feature3.title", "レベル別の問題"),
      description: t("home.feature3.description", "基本問題からオリジナル問題まで、自分のペースで学習できます。")
    },
    {
      icon: <PenSquare className="h-6 w-6" />,
      title: t("home.feature4.title", "オリジナル問題作成"),
      description: t("home.feature4.description", "自分だけの問題を作成して、より効果的な学習が可能です。")
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* ヒーローセクション */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("home.title", "100マス計算で計算力アップ！")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("home.subtitle1", "基礎的な計算力を楽しく身につけられる、")}
          <br />
          {t("home.subtitle2", "シンプルで効果的な学習ツールです。")}
        </p>
        <Link 
          to="/lesson" 
          className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
        >
          {t("home.start_button", "今すぐ始める")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 機能紹介 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader>
              <div className="mb-2 p-2 w-fit rounded-lg bg-primary/10">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 使い方セクション */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("home.usage.title", "使い方")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">{t("home.usage.step1.title", "1. 問題を選ぶ")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.usage.step1.description", "基本問題またはオリジナル問題から、挑戦したい問題を選択します。")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{t("home.usage.step2.title", "2. 計算開始")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.usage.step2.description", "スタートボタンを押すと時間計測が始まります。順番に答えを入力していきましょう。")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{t("home.usage.step3.title", "3. 結果確認")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.usage.step3.description", "全ての問題に答え終わると、正答数と所要時間が表示されます。")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">{t("home.usage.step4.title", "4. 進捗管理")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("home.usage.step4.description", "ダッシュボードで学習の進捗を確認できます。日々の成長を実感しましょう。")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Home
