# publish メタデータ追加 & バージョン 0.2.0

## 目的・ゴール

npm publish 時に README.md や LICENSE ファイルがパッケージに含まれるようにする。
また、repository / homepage / publishConfig などのメタデータを追加し、バージョンを 0.2.0 に上げる。

## 参考

- https://github.com/mizunashi-mana/cc-voice-reporter/blob/main/packages/cc-voice-reporter/package.json

## 実装方針

1. `packages/mcp-html-artifacts-preview/package.json` に以下を追加:
   - `prepack` スクリプト: ルートから README.md, LICENSE, LICENSE-APACHE, LICENSE-MPL をコピー
   - `files` 配列にライセンスファイルを追加
   - `repository`, `homepage`, `publishConfig` フィールドを追加
   - バージョンを `0.2.0` に更新
2. ビルド・テスト・リントで問題がないことを確認

## 完了条件

- [x] `prepack` スクリプトが追加されている
- [x] `files` にライセンスファイルが含まれている
- [x] `repository`, `homepage`, `publishConfig` が設定されている
- [x] バージョンが `0.2.0` になっている
- [x] `npm run build` が成功する
- [x] `npm run test` が成功する
- [x] `npm run lint` が成功する

## 作業ログ

- package.json に `prepack`, `files`, `repository`, `homepage`, `publishConfig` を追加
- バージョンを 0.2.0 に更新
- `packages/mcp-html-artifacts-preview/.gitignore` を追加（prepack でコピーされるファイルを除外）
- ビルド・テスト・リント全て成功
