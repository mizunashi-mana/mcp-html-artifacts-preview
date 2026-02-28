# CLI エントリポイントに shebang を追加

## 目的・ゴール

`dist/cli.js` に shebang (`#!/usr/bin/env node`) を追加し、Nix 等で直接シンボリックリンクされた場合にも正しく Node.js で実行されるようにする。

## 背景

- 調査: `.ai-agent/surveys/20260301-cli-shebang-missing/README.md`
- `src/cli.ts` に shebang が無いため、ビルド成果物 `dist/cli.js` にも shebang が含まれず、Nix 経由のインストールで実行エラーが発生する

## 実装方針

- `src/cli.ts` の先頭に `#!/usr/bin/env node` を追加
- `tsc` は shebang をそのまま出力に保持するため、追加の設定は不要

## 完了条件

- [x] `src/cli.ts` の先頭に shebang 行がある
- [x] `npm run build` で `dist/cli.js` の先頭に shebang が含まれる
- [x] `npm run lint` がパスする
- [x] `npm run test` がパスする

## 作業ログ

- 2026-03-01: タスク開始
- 2026-03-01: shebang 追加、ESLint entrypointFiles に cli.ts を追加、全チェックパス
