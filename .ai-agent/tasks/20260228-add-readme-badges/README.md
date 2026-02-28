# README に CI バッジと npm バッジを追加

## 目的・ゴール

README のタイトル直下に、プロジェクトのステータスを示すバッジを追加する。

## 実装方針

README.md の `# mcp-html-artifacts-preview` タイトル直後に以下のバッジを追加:

1. **CI Lint バッジ** — `.github/workflows/ci-lint.yml` の実行ステータス
2. **CI Test バッジ** — `.github/workflows/ci-test.yml` の実行ステータス
3. **npm バージョンバッジ** — `@mizunashi_mana/mcp-html-artifacts-preview` の最新バージョン

また、ライセンスセクションをデュアルライセンスであることが分かりやすい表現に改善する。

## 完了条件

- [x] README.md にバッジが追加されている
- [x] バッジのリンク先が正しい
- [x] ライセンス説明が分かりやすくなっている
- [x] lint が通る

## 作業ログ

- バッジ 3 種（CI Lint, CI Test, npm version）を追加
- ライセンスセクションをデュアルライセンスの選択形式に書き換え
- lint 通過確認済み
