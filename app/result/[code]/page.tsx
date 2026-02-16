import { resultCopy } from '@/data/resultCopy';
import { buildShareIntentUrl, isResultCode } from '@/lib/result';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded border bg-white p-4">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
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
  if (!isResultCode(upperCode)) {
    return { title: 'タイプが見つかりません' };
  }

  return {
    title: `${resultCopy[upperCode].title} | 推しタイプ診断`,
    openGraph: {
      title: `${resultCopy[upperCode].title} | 推しタイプ診断`,
      images: [`/og/${upperCode}`]
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og/${upperCode}`]
    }
  };
}

export default function ResultPage({ params, searchParams }: Props) {
  const upperCode = params.code.toUpperCase();
  if (!isResultCode(upperCode)) {
    notFound();
  }

  const copy = resultCopy[upperCode];
  if (!copy) {
    throw new Error(`Missing result copy: ${upperCode}`);
  }

  const headerList = headers();
  const host = headerList.get('host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;
  const intentUrl = buildShareIntentUrl(origin, upperCode, copy.shareText);

  const pctRows = [
    { key: 'Lpct', value: searchParams.lpct },
    { key: 'Spct', value: searchParams.spct },
    { key: 'Opct', value: searchParams.opct },
    { key: 'Npct', value: searchParams.npct }
  ];

  const showPct = pctRows.every((row) => typeof row.value === 'string');

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <section className="rounded border bg-white p-4">
        <h1 className="text-2xl font-bold">{copy.title}</h1>
      </section>

      <ListSection title="特徴" items={copy.feature} />
      <ListSection title="あるある" items={copy.aruaru} />
      <ListSection title="推し活の強み" items={copy.strength} />
      <ListSection title="注意報" items={copy.caution} />

      <section className="rounded border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">シェア</h2>
        <div className="flex flex-wrap gap-2">
          <a className="rounded bg-black px-4 py-2 text-white" href={intentUrl} target="_blank" rel="noreferrer">
            Xでシェア
          </a>
          <code className="rounded bg-gray-100 px-3 py-2 text-xs">{copy.shareText}</code>
        </div>
      </section>

      {showPct && (
        <section className="rounded border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">4軸%</h2>
          <ul className="list-disc pl-5 text-sm">
            {pctRows.map((row) => (
              <li key={row.key}>
                {row.key}: {row.value}%
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
