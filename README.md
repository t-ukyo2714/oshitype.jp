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
- `DATABASE_URL`（PostgreSQL, Prisma用）
- `ADMIN_PASSWORD`（未設定時は `admin`）

## Vercelデプロイで `404: NOT_FOUND` が出るときの確認手順

Vercelの白い画面で `404: NOT_FOUND`（`Code: NOT_FOUND`）が出る場合、**アプリ内部の404ではなく「そのURLにデプロイが割り当たっていない」ケース**がほとんどです。  
このリポジトリではNext.jsのルート (`app/page.tsx`) があるため、正しくデプロイされていれば `/` でトップページが表示されます。

1. **URLが正しいか確認**
   - `https://<project-name>.vercel.app`（Production URL）を開く
   - Preview URLや削除済みDeployment URLを開くと `NOT_FOUND` になります

2. **Project Settings → General → Root Directory**
   - このリポジトリのルート（`package.json` がある階層）を指定する
   - Monorepo設定で別ディレクトリを向いていると、デプロイ自体は成功してもサイトが存在せず `NOT_FOUND` になります

3. **Build & Output Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: **空欄**（Next.js標準）

4. **Production Branchに最新コミットをデプロイ**
   - Vercel Dashboard → Deployments で `main`（または運用ブランチ）の最新成功デプロイを `Promote to Production`

5. **Environment Variablesを設定**
   - 少なくとも `DATABASE_URL`, `GAS_WEBAPP_URL`, `LOG_TOKEN` を Production/Preview それぞれに設定
   - 未設定だとAPI系は失敗します（この場合は通常 500 で、Vercelの `NOT_FOUND` とは別症状）

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
