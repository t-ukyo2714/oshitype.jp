import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fdfcfb] px-6 py-12 text-center">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] h-64 w-64 rounded-full bg-purple-100/50 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="animate-fade-in z-10 max-w-xl space-y-8">
        <header className="space-y-4">
          <div className="mx-auto w-fit rounded-full bg-purple-50 px-4 py-1 text-xs font-semibold tracking-wider text-purple-600 uppercase">
            K-POP Fandom Analysis
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            推しタイプ診断
            <span className="mt-2 block text-2xl font-medium text-gray-500">OshiType</span>
          </h1>
        </header>

        <p className="text-lg leading-relaxed text-gray-600">
          「自分らしく推す」ための20の質問。<br />
          あなたの推し活スタイルを、丁寧な解析でお届けします。
        </p>

        <div className="space-y-4 pt-4">
          <Link
            href="/quiz"
            className="premium-gradient inline-block rounded-full px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            診断をはじめる
          </Link>
          <p className="text-xs text-gray-400">
            所要時間：約3分 / 個人情報の入力は最小限です
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 pt-12 text-left sm:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xl">✨</div>
            <h3 className="font-bold text-gray-800">当たってる感</h3>
            <p className="text-sm text-gray-500">20の多角的な質問で、あなたの深層を分析。</p>
          </div>
          <div className="space-y-2 border-y border-gray-100 py-4 sm:border-y-0 sm:border-x sm:px-4 sm:py-0">
            <div className="text-xl">🔒</div>
            <h3 className="font-bold text-gray-800">プライバシー</h3>
            <p className="text-sm text-gray-500">ニックネーム不要。データは統計にのみ使用。</p>
          </div>
          <div className="space-y-2">
            <div className="text-xl">📱</div>
            <h3 className="font-bold text-gray-800">ワンタップ共有</h3>
            <p className="text-sm text-gray-500">診断結果はすぐにSNSへ。見やすいカード形式。</p>
          </div>
        </section>
      </div>
    </main>
  );
}
