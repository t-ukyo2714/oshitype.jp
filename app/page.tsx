import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">推しタイプ診断（OshiType）</h1>
      <p className="text-gray-600">K-POP向け20問であなたの推し活タイプを診断します。</p>
      <Link href="/quiz" className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
        診断を始める
      </Link>
    </main>
  );
}
