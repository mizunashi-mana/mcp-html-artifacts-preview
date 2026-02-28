# version 更新・パッケージ公開スキルの追加

## 目的・ゴール

`cc-voice-reporter` リポジトリに倣い、Claude Code のスキルとして以下を追加する:

- **bump-version**: `packages/mcp-html-artifacts-preview/package.json` のバージョンを更新し PR を作成するスキル
- **run-publish-workflow**: publish ワークフローを実行して npm パッケージを公開するスキル

## 実装方針

- `cc-voice-reporter` の既存スキルをベースに、本プロジェクトのパス・構造に合わせて適応
- パッケージパス: `packages/mcp-html-artifacts-preview/package.json`
- ワークフロー: `.github/workflows/publish.yml`（既に存在）

## 完了条件

- [ ] `.claude/skills/bump-version/SKILL.md` が作成されている
- [ ] `.claude/skills/run-publish-workflow/SKILL.md` が作成されている
- [ ] 各スキルの手順がこのプロジェクトのパス・構成に正しく対応している
- [ ] PR が作成されている

## 作業ログ

- cc-voice-reporter のスキルを調査し、本プロジェクト向けに適応して作成完了
