# 実装計画

## 現在のフェーズ

新規開発 - v1.0 初回リリースに向けた基本機能の実装

## 完了済み機能

- Phase 1: プロジェクト基盤（autodev 環境、npm ワークスペース、ESLint、MCP サーバー骨格）

## 進行中の作業

- Phase 3: 品質・配布 — ユニットテスト・統合テスト追加（完了、PR 待ち）

## 今後の計画

### Phase 1: プロジェクト基盤（完了）

- [x] autodev 環境初期化
- [x] npm パッケージ初期化（package.json、tsconfig.json、eslint、prettier）
- [x] MCP サーバーの基本骨格実装

### Phase 2: コア機能実装

- [ ] `create_page` / `update_page` / `destroy_page` ツール実装
- [ ] `get_pages` / `get_page` ツール実装
- [ ] `add_scripts` / `add_stylesheets` ツール実装
- [ ] 組み込み HTTP サーバー（動的ポート割り当て）
- [ ] ホットリロード機能（WebSocket/SSE）

### Phase 3: 品質・配布

- [ ] ユニットテスト・統合テスト
- [ ] npm パッケージとして公開
- [ ] dotfiles リポジトリでの mcp-html-sync-server からの移行
