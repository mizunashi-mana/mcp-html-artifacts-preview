# ESLint スナップショットテストの追加

## 目的・ゴール

`packages/eslint-config` の `buildConfig()` が生成する ESLint 設定をスナップショットテストで検証する。ルール変更が意図的かどうかを差分で確認できるようにする。

## 参考

- https://github.com/mizunashi-mana/cc-voice-reporter の `packages/eslint-config/tests/build-config.test.ts`

## 実装方針

1. `packages/eslint-config/vitest.config.ts` を作成
2. `packages/eslint-config/tests/build-config.test.ts` を作成
   - `extractSnapshotData()` ヘルパーで非シリアライズ可能なオブジェクト（plugin、parser）を除外
   - `buildConfig()` の各 ruleSet 組み合わせ（common のみ、node のみ、common + node）をスナップショットで検証
3. スナップショットを生成して動作確認

## 完了条件

- [x] `vitest.config.ts` が作成されている
- [x] `tests/build-config.test.ts` が作成されている
- [x] `npm run test` が eslint-config パッケージで成功する
- [x] スナップショットファイルが生成されている（3524行）
- [x] `npm run lint` がエラーなし
- [x] `npm run build` が成功

## 作業ログ

- 参考リポジトリ (cc-voice-reporter) の ESLint スナップショットテスト実装を調査
- `vitest.config.ts` と `tests/build-config.test.ts` を作成
- 3パターン (common, node, common+node) のスナップショットテストを実装
- 全品質チェック (test, lint, build) パス
