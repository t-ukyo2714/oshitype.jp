import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { isResultCode } from '@/lib/result';
import { resultCopy } from '@/data/resultCopy';

export const runtime = 'edge';
const size = {
  width: 1200,
  height: 630
};

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  if (!isResultCode(code)) {
    return new Response('Not Found', { status: 404 });
  }

  const copy = resultCopy[code];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background: '#111827',
          color: '#ffffff',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ fontSize: 30, opacity: 0.9, marginBottom: 20 }}>推しタイプ診断（OshiType）</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 12 }}>{code}</div>
        <div style={{ fontSize: 42, fontWeight: 700 }}>{copy.title.split('｜')[1]}</div>
      </div>
    ),
    size
  );
}
