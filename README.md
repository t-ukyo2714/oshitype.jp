# 推しタイプ診断（OshiType）

## 主要ファイル構成
- `app/page.tsx`: LP（診断開始ボタン）
- `app/quiz/page.tsx`: プロフィール→20問→年代入力UI
- `app/result/[code]/page.tsx`: 結果ページ（直アクセス対応、Xシェア、OGPメタデータ）
- `app/og/[code]/route.tsx`: タイプ別OG画像を動的生成（バイナリ不要）
- `app/api/log-submission/route.ts`: 採点 + GAS転送API
- `lib/scoring.ts`: 採点関数（逆転なし・左右比率）
- `data/questions.ts`: 20問固定文言
- `data/resultCopy.ts`: 16タイプ固定辞書
- `docs/gas-webapp.gs`: GAS `doPost` 完成版

## 必要な環境変数
- `GAS_WEBAPP_URL`
- `LOG_TOKEN`

## 実装者判断で要件追記
1. `/quiz` の「プロフィール→Q1-20→年代」は単一ページ内でこの順序のセクションとして実装（別画面分割の指定が無かったため）。
2. `member_mode=named` 以外の場合、`oshi_member` は空文字でログ保存。
3. 「全問必須」は回答初期値を3として必ず20件送信される設計で満たす。
4. PR作成ツールの制約（バイナリ非対応）回避のため、OGPは `public/og/*.png` ではなく動的OGルートで実装。

## 手動テスト手順（3ケース）
1. **左側設問のみ5、右側のみ1 → 左寄りコード**
   - Q1,2,3,6,7,11,12,16,17=5
   - Q4,5,8,9,10,13,14,15,18,19,20=1
   - 期待: code = `LSON`（左判定）
2. **左側のみ1、右側のみ5 → 右寄りコード**
   - 上記の逆
   - 期待: code = `KGET`（右判定）
3. **全部5 → 境界確認（50%以上で左）**
   - Q1〜Q20すべて5
   - 期待: `Lpct/Spct/Opct/Npct` は各50、code=`LSON`

## Vercelデプロイ時の注意（Next.js未検出エラー対策）
- Vercel Project Settings の **Root Directory** をリポジトリ直下（`.`）にしてください。
- このリポジトリは Next.js を `dependencies.next` で管理しています。
- `vercel.json` で framework を `nextjs` に固定しています。
- エラー `No Next.js version detected` が出る場合は、ほぼ Root Directory の設定不一致です。

## 運用メモ（mainブランチ更新）
- ブランチを切らず、常に `main` を最新化して直接更新する運用に統一します。
- 変更前に `git pull origin main` を実行してから作業してください。
- 競合が起きた場合は `main` 上で解消して push します。
