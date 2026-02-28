# 実装計画

## 現在のフェーズ

v0.2.0 公開済み — 基本機能の実装・テスト・npm 公開が完了

## 完了済み機能

- Phase 1: プロジェクト基盤（autodev 環境、npm ワークスペース、ESLint、MCP サーバー骨格）
- Phase 2: コア機能実装（全 MCP ツール、HTTP サーバー、ホットリロード）
- Phase 3: 品質・配布（ユニットテスト・統合テスト、npm 公開）

## 進行中の作業

なし

## 今後の計画

### Phase 1: プロジェクト基盤（完了）

- [x] autodev 環境初期化
- [x] npm パッケージ初期化（package.json、tsconfig.json、eslint、prettier）
- [x] MCP サーバーの基本骨格実装

### Phase 2: コア機能実装（完了）

- [x] `create_page` / `update_page` / `destroy_page` ツール実装
- [x] `get_pages` / `get_page` ツール実装
- [x] `add_scripts` / `add_stylesheets` ツール実装
- [x] 組み込み HTTP サーバー（動的ポート割り当て）
- [x] ホットリロード機能（WebSocket/SSE）

### Phase 3: 品質・配布（完了）

- [x] ユニットテスト・統合テスト
- [x] npm パッケージとして公開（v0.2.0）
- [ ] dotfiles リポジトリでの mcp-html-sync-server からの移行
