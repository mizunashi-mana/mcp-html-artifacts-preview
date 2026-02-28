# 技術アーキテクチャ

## 技術スタック

- **言語**: TypeScript 5.x
- **ランタイム**: Node.js 22 LTS
- **パッケージマネージャ**: npm
- **MCP SDK**: @modelcontextprotocol/sdk
- **ビルド**: tsc（TypeScript Compiler）
- **テスト**: vitest
- **リンター/フォーマッター**: eslint, prettier
- **CI**: GitHub Actions

## アーキテクチャ概要

### コンポーネント構成

```
┌──────────────────┐     MCP (stdio)     ┌──────────────────┐
│  AI アシスタント   │ ←──────────────────→ │   MCP サーバー    │
│ (Claude Code等)  │                      │  (本パッケージ)   │
└──────────────────┘                      └───────┬──────────┘
                                                  │
                                                  │ HTTP
                                                  ▼
                                          ┌──────────────────┐
                                          │  HTTP サーバー     │
                                          │ (動的ポート割当)   │
                                          └───────┬──────────┘
                                                  │
                                          ┌───────┴──────────┐
                                          │    ブラウザ        │
                                          │ (HTML プレビュー)  │
                                          └──────────────────┘
```

### データフロー

1. AI アシスタントが MCP ツール（`create_page` 等）を呼び出し
2. MCP サーバーが HTML コンテンツをメモリに保持
3. 組み込み HTTP サーバーが動的ポートでリッスン
4. ブラウザが HTTP サーバーからページを取得・表示
5. `update_page` 時は WebSocket/SSE でホットリロード通知

### MCP ツール

| ツール | 説明 |
|--------|------|
| `create_page` | HTML ページを作成し URL を返却 |
| `update_page` | ページの HTML を更新 |
| `destroy_page` | ページを削除 |
| `get_pages` | 作成済みページ一覧を取得 |
| `get_page` | 特定ページの HTML を取得 |
| `add_scripts` | CDN スクリプトを追加 |
| `add_stylesheets` | 外部スタイルシートを追加 |

## 開発環境

### セットアップ

```bash
npm install
npm run build
```

### 開発コマンド

```bash
npm run dev       # 開発モード（watch）
npm run build     # ビルド
npm run test      # テスト実行
npm run lint      # リント
npm run format    # フォーマット
```

## テスト戦略

- **ユニットテスト**: vitest によるコアロジック（ページ管理、ポート割り当て）のテスト
- **統合テスト**: MCP プロトコル経由でのツール呼び出しテスト

## パッケージ配布

- npm パッケージとして公開
- `npx mcp-html-artifacts-preview` で即座に起動可能
- MCP 設定例を README に記載
