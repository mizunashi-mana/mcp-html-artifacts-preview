# add-integration-tests

## 目的・ゴール

Phase 3「品質・配布」の一環として、MCP プロトコル経由のツール呼び出しテストおよび HTTP サーバー統合テストを追加する。

## 実装方針

### 1. MCP ツール統合テスト (`tools.test.ts`)

- `registerTools` で登録されたツールを呼び出し、レスポンスを検証
- 全 7 ツール（create_page, update_page, get_pages, get_page, destroy_page, add_scripts, add_stylesheets）のテスト
- エラーケース（存在しない ID、バリデーション不正）のテスト

### 2. HTTP サーバー統合テスト (`http-server.test.ts` の拡充)

- 実際に HTTP サーバーを起動し、リクエスト/レスポンスを検証
- ページ表示、404 応答、405 応答などの HTTP レスポンステスト
- SSE エンドポイントの基本動作テスト

## 完了条件

- [x] MCP ツール統合テスト（全 7 ツール + エラーケース）
- [x] HTTP サーバー統合テスト（ページ配信、エラー応答、SSE）
- [x] 既存テストが壊れていない
- [x] lint / build が通る

## 作業ログ

- `tools.test.ts` を新規作成: MCP SDK の InMemoryTransport + Client を使った統合テスト 16 件
  - 全 7 ツール（create_page, get_page, get_pages, update_page, destroy_page, add_scripts, add_stylesheets）の正常系テスト
  - エラーケース（存在しない ID、バリデーション不正 URL、必須パラメータ不足）のテスト
  - listTools で 7 ツール全てが登録されていることの確認テスト
- `http-server.test.ts` を拡充: 実 HTTP サーバー起動による統合テスト 10 件追加
  - ページ配信（HTML + 注入スクリプト/スタイルシート）
  - 404 / 405 エラー応答
  - SSE エンドポイント（接続、update イベント、delete イベント）
  - 動的ポート割り当ての検証
- テスト合計: 30 (PageStore) + 16 (MCP tools) + 19 (HTTP server) = 65 件、全て通過
- lint / build 通過確認
