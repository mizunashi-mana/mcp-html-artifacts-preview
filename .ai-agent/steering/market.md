# 市場分析

## 市場概要

MCP（Model Context Protocol）エコシステムにおける、AI アシスタント向けのリッチコンテンツプレビューツール市場。
AI コーディングアシスタント（Claude Code など）が生成した HTML コンテンツを即座にブラウザでプレビューするニーズが高まっている。

2025年12月、Anthropic が MCP を Linux Foundation 傘下の Agentic AI Foundation（AAIF）に寄贈し、
オープンガバナンスのもとで仕様策定が進められている。

## ターゲットセグメント

- **AI コーディングアシスタントのユーザー**: Claude Code や他の MCP 対応 AI ツールを日常的に使用する開発者
- **ユースケース**:
  - AI が生成した HTML/CSS/JS のレンダリング結果を即座に確認
  - ディスカッションや技術調査の結果を HTML で可視化（図表、比較表、フローチャートなど）
  - Mermaid.js や Chart.js などの CDN ライブラリを活用した動的コンテンツのプレビュー

## 競合分析

| プロダクト | 特徴 | 制約 |
|-----------|------|------|
| mcp-html-sync-server | MCP ネイティブの汎用 HTML プレビュー。npm・Docker 対応。ページ有効期限・保持上限あり。Bun ベース | ツールは create/update/destroy の 3 種のみ。ページ一覧取得・個別取得ツールなし。ポートは固定設定 |
| claude-mermaid | Mermaid 図プレビュー特化。ライブリロード、SVG/PNG/PDF エクスポート、テーマ対応 | Mermaid 以外の HTML に非対応 |
| seanivore/html-preview | Puppeteer でスクリーンショット撮影・コンテンツ解析 | ライブプレビューではなく静的キャプチャ方式 |
| 各種 Mermaid MCP サーバー | hustcc/mcp-mermaid、peng-shawn/mermaid-mcp-server 等、多数乱立 | Mermaid 限定、差別化が薄い |
| 汎用ローカルサーバー（live-server 等） | ファイルベースの HTML プレビュー | MCP 統合なし、AI ワークフローとの連携が手動 |
| ブラウザ内プレビュー（CodePen 等） | オンラインでの HTML プレビュー | ローカル開発環境との統合なし |
| Claude Desktop アーティファクト | アーティファクト履歴・自動表示・自動切り替えなどシームレスな UX | Claude Desktop 専用、MCP 非依存、カスタマイズ不可 |

## 差別化ポイント

- **MCP ネイティブ**: MCP プロトコルに準拠し、AI アシスタントから直接 HTML コンテンツを送信・プレビュー可能
- **汎用 HTML 対応**: Mermaid に限定されず、任意の HTML/CSS/JS をプレビュー
- **動的ポート割り当て**: 複数セッションの同時利用をサポート
- **独立パッケージ**: npm パッケージとして公開し、`npx` で即座に起動可能
- **シームレスな UX（計画中）**: ブラウザ自動オープン・アーティファクト自動切り替えにより、Claude Desktop のアーティファクト体験に近い操作感を CLI 環境で実現

## 市場動向

- MCP エコシステムの急速な拡大（2025〜2026年）
- MCP が Linux Foundation（AAIF）のもとでオープンガバナンス化（2025年12月）
- MCP 仕様 2025-11-25 で Streamable HTTP transport が HTTP+SSE transport を置換
- MCP SDK v2 が 2026 Q1 にリリース予定（v1.x は引き続きサポート）
- WebMCP（W3C 標準）が Google/Microsoft 主導で策定、Chrome で 2026年2月にプレビュー開始
- AI コーディングアシスタントの普及に伴い、リッチなアウトプット表示のニーズが増加
- Claude Code のスキルシステムとの統合により、構造化されたワークフローでの HTML 可視化が定着しつつある
- MCP Registry（公式サーバーメタデータレジストリ）の稼働開始により、サーバーの発見性が向上
