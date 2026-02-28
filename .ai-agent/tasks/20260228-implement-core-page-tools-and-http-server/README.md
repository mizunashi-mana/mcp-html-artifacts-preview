# ページ管理ツールと HTTP サーバーの実装

## 目的・ゴール

Phase 2（コア機能実装）の第一歩として、MCP サーバーにページ管理の CRUD ツールと組み込み HTTP サーバーを実装する。
AI アシスタントが `create_page` で HTML を作成し、返却された URL でブラウザプレビューできる状態にする。

## 実装方針

### ページストア

- インメモリでページを管理する `PageStore` クラス
- ページ ID は `crypto.randomUUID()` で自動生成
- 各ページは `{ id, title, html, createdAt, updatedAt }` を保持

### HTTP サーバー

- Node.js 標準の `node:http` モジュールを使用
- 動的ポート割り当て（ポート 0 でリッスンして OS に割り当てさせる）
- ルーティング: `GET /pages/:id` でページの HTML を返却
- MCP サーバー起動時に HTTP サーバーも起動

### MCP ツール

| ツール | 機能 |
|--------|------|
| `create_page` | HTML ページを作成し、プレビュー URL を返却 |
| `update_page` | 既存ページの HTML を更新 |
| `get_pages` | 作成済みページ一覧を取得 |
| `get_page` | 特定ページの HTML コンテンツを取得 |

※ `destroy_page` はスコープ外（別タスクで対応）

## 完了条件

- [x] PageStore がページの CRUD 操作を正しく行える
- [x] HTTP サーバーが動的ポートで起動し、ページの HTML を返却できる
- [x] 4つの MCP ツールが正しく動作する
- [x] PageStore のユニットテスト（13テスト）が通る
- [x] `npm run lint` がパスする
- [x] `npm run test` がパスする
- [x] `npm run build` がパスする

## 作業ログ

- Zod v3/v4 の重複インストールにより TS2589 エラーが発生。zod を `^4.0.0` に更新して解消
- `server.tool()` が deprecated のため `server.registerTool()` に変更
- `import-x/order` の false positive は eslint-disable で対応
