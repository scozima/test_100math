export function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">
        100mathへようこそ
      </h1>
      
      <div className="prose max-w-none">
        <p className="text-xl mb-4">
          数学の学習をサポートするプラットフォームです。
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              無料で利用できる機能
            </h2>
            <ul className="space-y-2">
              <li>基本的なレッスンの閲覧</li>
              <li>問題演習</li>
              {/* ... その他の無料機能 */}
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg bg-muted">
            <h2 className="text-2xl font-semibold mb-4">
              ログインするとできること
            </h2>
            <ul className="space-y-2">
              <li>進捗の保存</li>
              <li>カスタマイズされたレッスン</li>
              <li>詳細な解説へのアクセス</li>
              {/* ... その他のプレミアム機能 */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 