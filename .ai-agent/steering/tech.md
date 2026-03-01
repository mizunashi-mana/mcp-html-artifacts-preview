# 技術アーキテクチャ

## 技術スタック

- **言語**: TypeScript 5.x
- **ランタイム**: Node.js 22 LTS
- **パッケージマネージャ**: npm
- **MCP SDK**: @modelcontextprotocol/sdk
- **バリデーション**: zod
- **ビルド**: tsc（TypeScript Compiler）
- **テスト**: vitest
- **リンター/フォーマッター**: eslint
- **CI/CD**: GitHub Actions（CI lint/test、publish ワークフロー）

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
5. `update_page` 時は SSE でホットリロード通知
6. ダッシュボード（`/`）がグローバル SSE（`/events`）で create/update/delete イベントを受信
7. 初回 `create_page` 時にブラウザを自動オープン（`--no-open` で無効化）
8. ダッシュボードは新規ページ作成時に自動的にそのページへ遷移

### MCP ツール

| ツール | 説明 |
|--------|------|
| `create_page` | HTML ページを作成し URL を返却 |
| `update_page` | ページの HTML・タイトルを更新 |
| `destroy_page` | ページを削除（削除済み履歴として保持） |
| `get_pages` | 作成済みページ一覧を取得（`includeDeleted` で削除済みも表示） |
| `get_page` | 特定ページの HTML を取得 |
| `add_scripts` | CDN スクリプトを追加 |
| `add_stylesheets` | 外部スタイルシートを追加 |

### CLI オプション

| オプション | 説明 |
|-----------|------|
| `--no-open` | ブラウザ自動オープンを無効化 |
| `--max-pages <N>` | ページ保持上限（超過時は古いページを自動削除） |
| `--ttl <seconds>` | ページ有効期限（秒）。期限切れページを自動クリーンアップ |

## 開発環境

### セットアップ

```bash
npm install
npm run build
```

### 開発コマンド

```bash
npm run dev       # ビルド＋MCP サーバー起動
npm run build     # ビルド
npm run test      # テスト実行
npm run lint      # リント
npm run typecheck # 型チェック
```

## テスト戦略

- **ユニットテスト**: vitest によるコアロジック（ページ管理、ポート割り当て）のテスト
- **統合テスト**: MCP プロトコル経由でのツール呼び出しテスト

## パッケージ配布

- `@mizunashi_mana/mcp-html-artifacts-preview` として npm に公開済み
- `npx @mizunashi_mana/mcp-html-artifacts-preview` で即座に起動可能
- GitHub Actions の `publish.yml` ワークフローで npm provenance 付き公開・タグ・リリース作成を自動化
