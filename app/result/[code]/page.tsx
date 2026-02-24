import prisma from '@/lib/prisma';
import { isResultCode } from '@/lib/result';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShareButton } from './ShareButton';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const upperCode = params.code.toUpperCase();
  if (!isResultCode(upperCode)) return {};

  const result = await prisma.resultContent.findUnique({ where: { code: upperCode } });
  if (!result) return {};

  const title = `診断結果: ${result.title} | 推しタイプ診断`;
  const description = result.shareText || '私の推し活タイプを診断しました！';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: result.ogpImageUrl ? [result.ogpImageUrl] : [],
    },
    twitter: {
      card: result.ogpImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: result.ogpImageUrl ? [result.ogpImageUrl] : [],
    },
  };
}

function ContentCard({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="animate-fade-in rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3 text-sm leading-relaxed text-gray-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-300" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AxisBar({ labelLeft, labelRight, value, color }: { labelLeft: string; labelRight: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-bold tracking-tighter text-gray-400 uppercase">
        <span>{labelLeft}</span>
        <span>{labelRight}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="absolute h-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[13px] font-black text-gray-800">
        <span className={value >= 50 ? 'text-purple-600' : ''}>{value}%</span>
        <span className={value < 50 ? 'text-purple-600' : ''}>{100 - value}%</span>
      </div>
    </div>
  );
}

export default async function ResultPage({ params, searchParams }: { params: { code: string }; searchParams: { lpct?: string; spct?: string; opct?: string; npct?: string } }) {
  const upperCode = params.code.toUpperCase();
  if (!isResultCode(upperCode)) notFound();

  const [result, axesData] = await Promise.all([
    prisma.resultContent.findUnique({ where: { code: upperCode } }),
    prisma.axisDefinition.findMany()
  ]);

  if (!result) notFound();

  // Parse percentages
  const lpct = Number(searchParams.lpct ?? 50);
  const spct = Number(searchParams.spct ?? 50);
  const opct = Number(searchParams.opct ?? 50);
  const npct = Number(searchParams.npct ?? 50);

  // Parse codes for description
  const codes = upperCode.split('');

  const axesMap: Record<string, any> = {};
  axesData.forEach(a => {
    axesMap[a.code] = a;
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 pt-12 pb-24">
      {/* Result Hero */}
      <section className="animate-fade-in space-y-4 text-center">
        <div className="mx-auto w-fit rounded-full bg-purple-50 px-4 py-1 text-xs font-bold tracking-widest text-purple-600 uppercase">
          Analysis Result
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          あなたのタイプは...
        </h1>
        <div className="py-8">
          <div className="premium-gradient inline-block rounded-3xl px-8 py-4 shadow-xl shadow-purple-100 text-center relative overflow-hidden">
            {result.imageUrl && (
              <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${result.imageUrl})` }}></div>
            )}
            <span className="text-2xl font-black text-white sm:text-3xl relative z-10 drop-shadow-md">{result.title}</span>
          </div>
        </div>

        {/* Dynamic Image Display */}
        {result.imageUrl && (
          <div className="w-full flex justify-center mb-6">
            <img src={result.imageUrl} alt={result.title} className="rounded-3xl shadow-xl max-h-80 object-cover" />
          </div>
        )}
      </section>

      {/* Diagnostic Basis (Percentage Bars) */}
      <section className="animate-fade-in rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Diagnostic Basis</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <AxisBar labelLeft="Loop" labelRight="Keep" value={lpct} color="#6c5ce7" />
          <AxisBar labelLeft="Solo" labelRight="Group" value={spct} color="#a29bfe" />
          <AxisBar labelLeft="Observe" labelRight="Express" value={opct} color="#6c5ce7" />
          <AxisBar labelLeft="iNtuitive" labelRight="Track" value={npct} color="#a29bfe" />
        </div>
      </section>

      {/* Axis Descriptions */}
      <section className="animate-fade-in grid grid-cols-2 gap-4">
        {codes.map((c, i) => {
          const def = axesMap[c];
          if (!def) return null;
          return (
            <div key={i} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold shadow-sm text-purple-600">{c}</span>
                <span className="text-xs font-bold text-gray-400 tracking-tight">{def.label}</span>
              </div>
              <div className="text-sm font-bold text-gray-800 mb-1">{def.sub}</div>
              <p className="text-[11px] leading-relaxed text-gray-500">{def.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Main Content Blocks */}
      <div className="grid gap-6 sm:grid-cols-1">
        <ContentCard icon="✨" title="あなたの特徴" items={result.feature as string[]} />
        <ContentCard icon="🤝" title="推し活あるある" items={result.aruaru as string[]} />
        <ContentCard icon="💪" title="推し活の強み" items={result.strength as string[]} />
        <ContentCard icon="⚠️" title="大切にしたいこと" items={result.caution as string[]} />
      </div>

      {/* Share Section - Fixed at bottom for mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 p-4 backdrop-blur-md sm:relative sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto max-w-2xl space-y-4">
          <ShareButton code={upperCode} shareText={result.shareText} />
          <div className="flex justify-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-600">
              ホームへ戻る
            </Link>
            <Link href="/quiz" className="text-sm font-medium text-gray-400 hover:text-gray-600">
              もう一度診断する
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
