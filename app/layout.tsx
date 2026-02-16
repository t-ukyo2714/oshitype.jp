import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '推しタイプ診断（OshiType）',
  description: 'K-POP向け20問診断で推し活タイプを判定'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
