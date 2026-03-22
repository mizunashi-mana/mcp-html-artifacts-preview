# migrate-eslint-config-refined

## 目的・ゴール

ローカルの `packages/eslint-config/` パッケージを外部パッケージ `@mizunashi_mana/eslint-config-refined` に置き換える。

## 実装方針

1. ESLint を v9 → v10 にアップグレード（`@mizunashi_mana/eslint-config-refined` の peer dep 要件）
2. `@mizunashi_mana/eslint-config-refined` をインストール
3. `eslint.config.js` のインポート元を変更
4. `packages/eslint-config/` ディレクトリを削除
5. ワークスペース構成・ビルドスクリプトを更新
6. lint / test / build が通ることを確認

## 完了条件

- [x] `packages/eslint-config/` が削除されている
- [x] `@mizunashi_mana/eslint-config-refined` が devDependency として追加されている
- [x] ESLint v10 にアップグレードされている
- [x] `eslint.config.js` が新パッケージの `buildConfig` を使用している
- [x] `npm run lint` が通る
- [x] `npm run test` が通る
- [x] `npm run build` が通る

## 作業ログ

- `packages/eslint-config/` を削除し、root `package.json` のビルドスクリプトから eslint-config ビルドステップを除去
- ESLint を v9 → v10 にアップグレード、`@mizunashi_mana/eslint-config-refined` ^0.2.0 をインストール
- `eslint.config.js` のインポート元を変更
- 新しい lint ルールへの対応:
  - `require-unicode-regexp`: 正規表現に `v` フラグを追加
  - `prefer-named-capture-group`: キャプチャグループを名前付きに変更
  - `@typescript-eslint/strict-void-return`: `onChange` コールバックのアロー関数をブロック構文に変更
  - `@stylistic/max-statements-per-line`: コールバック本体を複数行に分割
- TypeScript target を `ES2022` → `ES2024` に変更（`v` フラグのサポートに必要）
