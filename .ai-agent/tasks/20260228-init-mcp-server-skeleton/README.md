# MCP サーバー基本骨格の初期化

## 目的・ゴール

Phase 1 の残りタスクとして、メインパッケージ `packages/mcp-html-artifacts-preview` の初期化と MCP サーバーの基本骨格を実装する。

## 実装方針

1. `packages/mcp-html-artifacts-preview/package.json` を作成
2. `packages/mcp-html-artifacts-preview/tsconfig.json` を作成
3. MCP サーバーのエントリーポイント `src/index.ts` を実装（stdio トランスポート）
4. ビルド・lint・テストがすべて通る状態にする

## 完了条件

- [x] `packages/mcp-html-artifacts-preview/package.json` が存在し、必要な依存関係が定義されている
- [x] `packages/mcp-html-artifacts-preview/tsconfig.json` が存在する
- [x] `src/index.ts` に MCP サーバーの基本骨格が実装されている（起動してツール一覧が空で返る状態）
- [x] `npm run build` が成功する
- [x] `npm run lint` がエラーなし
- [x] `npm run typecheck` がエラーなし
- [x] PR を作成済み

## 作業ログ

- package.json 作成: @mizunashi_mana/mcp-html-artifacts-preview、依存に @modelcontextprotocol/sdk + zod
- tsconfig.json 作成: tsc ビルド、dist/ 出力、ES2022 + Node16 モジュール
- src/index.ts 作成: McpServer + StdioServerTransport による最小構成
- build / typecheck / lint すべてパス確認済み
- PR #1 作成: https://github.com/mizunashi-mana/mcp-html-artifacts-preview/pull/1
