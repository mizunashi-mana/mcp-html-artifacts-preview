# remove-page-name-field

## 目的・ゴール

Page の `name` フィールドを削除する。`title` があるため `name` は冗長であり、API をシンプルにする。

## 実装方針

`name` フィールドをコードベース全体から削除する。破壊的変更（MCP ツールのパラメータ変更）を含む。

### 変更対象

1. **`page-store.ts`**: `Page`, `Tombstone`, `CreatePageParams`, `UpdatePageParams` から `name` を削除。`create()`, `update()`, `#saveTombstone()` のロジック修正
2. **`tools.ts`**: `create_page`, `update_page` の `name` パラメータ削除。レスポンスから `name` を除去。`update_page` のバリデーション修正（`title` or `html` のみ）
3. **`http-server.ts`**: グローバル SSE イベント、ダッシュボードの `name` 参照を削除。`DASHBOARD_SCRIPT` の `name` ロジック除去
4. **`index.ts`**: 型 re-export の変更は不要（`Page` 等の型が自動的に反映）
5. **テスト**: 3ファイルの `name` 関連テストを削除・修正

## 完了条件

- [x] `name` フィールドがコードベースから完全に削除されている
- [x] `npm run lint` が通る
- [x] `npm run test` が通る（94 tests passed）
- [x] `npm run build` が通る

## 作業ログ

- `page-store.ts`: `Page`, `Tombstone`, `CreatePageParams`, `UpdatePageParams` から `name` を削除。`create()`, `update()`, `#saveTombstone()` を修正
- `tools.ts`: `create_page`, `update_page` の `name` パラメータ・レスポンスを削除。バリデーションメッセージを修正
- `http-server.ts`: グローバル SSE イベントデータ、`DASHBOARD_SCRIPT`、`buildPageOption()` から `name` を削除
- `page-store.test.ts`: `name` 関連テスト 3件を削除、tombstone テストの `name` 参照を除去
- `tools.test.ts`: `name` 関連テスト 2件を削除、バリデーションメッセージを更新
- `http-server.test.ts`: `makePage()` から `name` を削除、ダッシュボードテストを修正
