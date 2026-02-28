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
├── CLAUDE.md                     # Claude Code 向けプロジェクト説明（未作成）
├── README.md                     # プロジェクト README（未作成）
├── LICENSE                       # ライセンスファイル（未作成）
├── package.json                  # npm パッケージ定義（未作成）
├── tsconfig.json                 # TypeScript 設定（未作成）
└── src/                          # ソースコード（未作成）
```

## 注記

- `（未作成）` のファイル/ディレクトリは plan.md Phase 1 で作成予定
- ソースコードの詳細な構成は実装開始後に更新する
