import { resultCopy } from '@/data/resultCopy';
import { axisDefinitions } from '@/data/axisDefinitions';
import { buildShareIntentUrl, isResultCode } from '@/lib/result';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

function ContentCard({ title, items, icon }: { title: string; items: string[]; icon: string }) {
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

type Props = {
  params: { code: string };
  searchParams: { lpct?: string; spct?: string; opct?: string; npct?: string };
};

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const upperCode = params.code.toUpperCase();
  if (!isResultCode(upperCode)) return { title: 'Not Found' };
  const copy = resultCopy[upperCode];
  return {
    title: `${copy.title} | 推しタイプ診断`,
    description: copy.shareText,
    openGraph: { images: [`/og/${upperCode}`] },
    twitter: { card: 'summary_large_image', images: [`/og/${upperCode}`] }
  };
}

export default function ResultPage({ params, searchParams }: Props) {
  const upperCode = params.code.toUpperCase();
  if (!isResultCode(upperCode)) notFound();

  const copy = resultCopy[upperCode];
  const host = headers().get('host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;
  const intentUrl = buildShareIntentUrl(origin, upperCode, copy.shareText);

  // Parse codes for description
  const codes = upperCode.split('') as (keyof typeof axisDefinitions)[];

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
          <div className="premium-gradient inline-block rounded-3xl px-8 py-4 shadow-xl shadow-purple-100">
            <span className="text-2xl font-black text-white sm:text-3xl">{copy.title}</span>
          </div>
        </div>
      </section>

      {/* Axis Descriptions */}
      <section className="animate-fade-in grid grid-cols-2 gap-4">
        {codes.map((c, i) => {
          const def = axisDefinitions[c];
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
        <ContentCard icon="✨" title="あなたの特徴" items={copy.feature} />
        <ContentCard icon="🤝" title="推し活あるある" items={copy.aruaru} />
        <ContentCard icon="💪" title="推し活の強み" items={copy.strength} />
        <ContentCard icon="⚠️" title="大切にしたいこと" items={copy.caution} />
      </div>

      {/* Share Section - Fixed at bottom for mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 p-4 backdrop-blur-md sm:relative sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto max-w-2xl space-y-4">
          <a
            href={intentUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#1DA1F2] py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.25h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            結果をXでシェアする
          </a>
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
