# mcp-html-artifacts-preview ディレクトリ構成

## 概要

MCP サーバーとして AI が生成した HTML コンテンツをブラウザでプレビューする npm パッケージ。
TypeScript + Node.js で実装。

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
│   └── skills/                   # autodev スキル群
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
│       └── autodev-switch-to-default/  # デフォルトブランチ切り替え
├── CLAUDE.md                     # Claude Code 向けプロジェクト説明
├── README.md                     # プロジェクト README
├── LICENSE                       # ライセンスファイル（MPL-2.0 / Apache-2.0）
├── LICENSE-APACHE                # Apache License 2.0 全文
├── LICENSE-MPL                   # MPL 2.0 全文
├── package.json                  # ルート npm ワークスペース定義
├── eslint.config.js              # ルート ESLint 設定
├── devenv.nix                    # Nix 開発環境設定
├── scripts/                      # 開発ユーティリティスクリプト
│   ├── cc-edit-lint-hook.mjs     # Claude Code edit lint hook
│   └── run-script.mjs            # pre-commit フック用スクリプトランナー
└── packages/                     # npm ワークスペースパッケージ群
    ├── eslint-config/            # 共有 ESLint 設定パッケージ
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsup.config.ts
    │   └── src/                  # ESLint ルール設定モジュール
    └── mcp-html-artifacts-preview/  # メインパッケージ（MCP サーバー）
        ├── package.json
        ├── tsconfig.json
        └── src/
            └── index.ts          # エントリーポイント（MCP サーバー起動）
```
