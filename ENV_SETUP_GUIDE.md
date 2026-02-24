# 環境変数の設定ガイド

診断結果をスプレッドシートに保存するために必要な `GAS_WEBAPP_URL` と `LOG_TOKEN` の設定方法です。

## 1. ローカル開発環境での設定
プロジェクトのルートディレクトリにある `.env` ファイルに以下の内容を追記してください。
（ファイルがない場合は、ルート直下に `.env` という名前の新しいファイルを作成してください）

```env
# GASデプロイ後に発行されるURL
GAS_WEBAPP_URL=https://script.google.com/macros/s/XXXXX/exec

# GAS側のコード（const LOG_TOKEN = "..."）に設定したのと同じ文字列
LOG_TOKEN=your-random-secret-string
```

> [!TIP]
> ファイル保存後、`npm run dev` を実行しているターミナルで `Ctrl + C` を押して一度停止し、再度 `npm run dev` を実行すると設定が反映されます。

## 2. 本番環境（Vercel）での設定
本番でも記録を行いたい場合は、Vercelの管理画面で設定が必要です。

1. [Vercel Dashboard](https://vercel.com/dashboard) からプロジェクトを選択
2. **Settings** タブ > **Environment Variables** を選択
3. 以下の Key/Value を追加して **Save** 
   - `GAS_WEBAPP_URL`: (GASのURL)
   - `LOG_TOKEN`: (設定した合言葉)
4. 次回のデプロイから反映されます（手動で Redeploy してもOKです）。

---

### 注意点：トークンの同期
`GAS_SCRIPT.md` の冒頭にある `const LOG_TOKEN = "...";` と、環境変数の `LOG_TOKEN` は必ず同じ文字列にしてください。
これが一致しないと、セキュリティチェックで書き込みが拒否されます。
