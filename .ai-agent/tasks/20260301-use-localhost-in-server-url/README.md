# use-localhost-in-server-url

## 目的・ゴール

サーバ起動時に表示される URL を IP アドレスベース（`http://127.0.0.1:<port>`）からホスト名ベース（`http://localhost:<port>`）に変更する。

## 実装方針

`http-server.ts` の `startHttpServer` 関数でデフォルト hostname を `'127.0.0.1'` → `'localhost'` に変更する。

### 変更対象

- `packages/mcp-html-artifacts-preview/src/http-server.ts` — デフォルト hostname の変更
- `packages/mcp-html-artifacts-preview/src/http-server.test.ts` — テストのアサーション更新

## 完了条件

- [x] サーバ起動時の URL が `http://localhost:<port>` 形式で表示される
- [x] テストが全て通る
- [x] lint / build が成功する

## 作業ログ

- デフォルト hostname を `'127.0.0.1'` → `'localhost'` に変更
- テストアサーションを更新
- test / lint / build 全て成功確認
