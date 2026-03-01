# mcp-html-artifacts-preview ディレクトリ構成

## 概要

MCP サーバーとして AI が生成した HTML コンテンツをブラウザでプレビューする npm パッケージ。
TypeScript + Node.js で実装。npm ワークスペースによるモノレポ構成。

## ディレクトリツリー

```
mcp-html-artifacts-preview/
├── .ai-agent/                    # AI エージェント向けドキュメント
│   ├── steering/                 # 戦略的ガイドドキュメント
│   │   ├── product.md            # プロダクトビジョン・機能一覧
│   │   ├── tech.md               # 技術スタック・アーキテクチャ
│   │   ├── market.md             # 市場分析・競合調査
│   │   ├── plan.md               # 実装計画・ロードマップ
│   │   └── work.md               # 開発ワークフロー・規約
│   ├── structure.md              # 本ファイル（ディレクトリ構成の説明）
│   ├── projects/                 # 長期プロジェクト
│   ├── tasks/                    # 個別タスク
│   └── surveys/                  # 技術調査
├── .claude/                      # Claude Code 設定
│   ├── settings.json             # パーミッション・フック設定
│   ├── settings.local.json       # ローカル設定（gitignore 対象）
│   └── skills/                   # スキル群
│       ├── autodev-create-issue/     # GitHub Issue 作成
│       ├── autodev-create-pr/        # PR 作成
│       ├── autodev-discussion/       # 対話的アイデア整理
│       ├── autodev-import-review-suggestions/  # レビューコメント取り込み
│       ├── autodev-replan/           # ロードマップ再策定
│       ├── autodev-review-pr/        # PR レビュー（チーム化）
│       ├── autodev-start-new-project/  # 長期プロジェクト開始
│       ├── autodev-start-new-survey/   # 技術調査開始
│       ├── autodev-start-new-task/     # 個別タスク開始
│       ├── autodev-steering/         # Steering ドキュメント更新
│       ├── autodev-switch-to-default/  # デフォルトブランチ切り替え
│       ├── bump-version/             # バージョンバンプ
│       └── run-publish-workflow/     # npm publish ワークフロー実行
├── .github/                      # GitHub 設定
│   ├── actions/                  # 再利用可能アクション
│   │   ├── setup-devenv/         # devenv セットアップアクション
│   │   └── setup-node/           # Node.js セットアップアクション
│   ├── dependabot.yml            # Dependabot 自動アップデート設定
│   └── workflows/                # CI/CD ワークフロー
│       ├── ci-lint.yml           # lint チェック
│       ├── ci-test.yml           # テスト実行
│       └── publish.yml           # npm パッケージ公開
├── CLAUDE.md                     # Claude Code 向けプロジェクト説明
├── README.md                     # プロジェクト README（英語）
├── LICENSE                       # ライセンスファイル（Apache-2.0 OR MPL-2.0）
├── LICENSE-APACHE                # Apache License 2.0 全文
├── LICENSE-MPL                   # MPL 2.0 全文
├── package.json                  # ルート npm ワークスペース定義
├── eslint.config.js              # ルート ESLint 設定
├── devenv.nix                    # Nix 開発環境設定
├── devenv.yaml                   # devenv 設定
├── devenv.lock                   # devenv ロックファイル
├── scripts/                      # 開発ユーティリティスクリプト
│   ├── cc-edit-lint-hook.mjs     # Claude Code edit lint hook
│   └── run-script.mjs            # pre-commit フック用スクリプトランナー
└── packages/                     # npm ワークスペースパッケージ群
    ├── eslint-config/            # 共有 ESLint 設定パッケージ
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsup.config.ts        # バンドル設定
    │   ├── vitest.config.ts      # テスト設定
    │   ├── src/                  # ESLint ルール設定モジュール
    │   └── tests/                # スナップショットテスト
    └── mcp-html-artifacts-preview/  # メインパッケージ（MCP サーバー）
        ├── package.json
        ├── tsconfig.json
        ├── tsconfig.build.json   # ビルド用 TypeScript 設定
        └── src/
            ├── index.ts          # ライブラリエントリーポイント（re-export）
            ├── cli.ts            # CLI エントリーポイント（MCP サーバー起動）
            ├── http-server.ts    # 組み込み HTTP サーバー（動的ポート・ホットリロード）
            ├── page-store.ts     # ページ管理（メモリ内ストア）
            ├── tools.ts          # MCP ツール定義
            ├── http-server.test.ts  # HTTP サーバーのテスト
            ├── page-store.test.ts   # ページ管理のテスト
            └── tools.test.ts        # MCP ツールのテスト
```
