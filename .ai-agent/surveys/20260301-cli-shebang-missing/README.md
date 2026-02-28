# CLI バイナリに shebang が欠落している問題の調査

## 調査の問い

- `mcp-html-artifacts-preview --help` 実行時に `/Applications: is a directory` エラーが発生する原因は何か

## 背景

Nix (home-manager) 経由でインストールした `mcp-html-artifacts-preview` コマンドを実行すると、以下のエラーが発生する:

```
/etc/profiles/per-user/mizunashi/bin/mcp-html-artifacts-preview: line 1: /Applications: is a directory
```

## 調査方法

1. インストールされたバイナリの内容を直接確認
2. Nix store 内のファイルのシンボリックリンクチェーンを追跡
3. ソースコード (`src/cli.ts`) とビルド成果物 (`dist/cli.js`) の先頭行を確認
4. `package.json` の `bin` フィールドの設定を確認

## 調査結果

### エラーの原因

`dist/cli.js` ファイルに **shebang 行 (`#!/usr/bin/env node`) が存在しない**ことが根本原因。

#### 詳細な流れ

1. `package.json` で `"bin": { "mcp-html-artifacts-preview": "./dist/cli.js" }` と指定
2. npm は `npm install -g` 時に独自のラッパースクリプトを生成し、`node` で `dist/cli.js` を実行するため、shebang がなくても動作する
3. しかし Nix の `buildNpmPackage` は `dist/cli.js` を直接 `bin/` にシンボリックリンクする
4. シェルがファイルを実行する際、shebang がないため **シェルスクリプトとして解釈** される
5. `dist/cli.js` の 1 行目は `/* eslint-disable ... */` でコメント記法だが、シェルにとっては `/Applications` というパスの一部として解釈される（`/*` はグロブパターンとしてルートディレクトリ配下のディレクトリにマッチ）
6. 結果として `/Applications: is a directory` というエラーが発生

### シンボリックリンクチェーン

```
/etc/profiles/per-user/mizunashi/bin/mcp-html-artifacts-preview
  → /nix/store/.../home-manager-path/bin/mcp-html-artifacts-preview
    → /nix/store/.../mcp-html-artifacts-preview-0.2.0/bin/mcp-html-artifacts-preview
```

最終ファイルの内容は `dist/cli.js` そのもので、shebang なし。

### 影響範囲

- npm 経由のグローバルインストール (`npm install -g`): 影響なし（npm がラッパーを生成）
- npx 経由の実行: 影響なし
- Nix / buildNpmPackage 経由のインストール: **影響あり**
- その他のパッケージマネージャで直接シンボリックリンクするもの: **影響あり**

## 結論

### 修正方法

`src/cli.ts` の先頭に shebang 行を追加する:

```typescript
#!/usr/bin/env node
/* eslint-disable no-console, n/no-process-exit -- CLI entry point */
import { createRequire } from 'node:module';
// ...
```

TypeScript コンパイラ (`tsc`) は shebang 行をそのまま出力に保持するため、`dist/cli.js` にも shebang が含まれるようになる。

これは npm パッケージの CLI エントリポイントにおける標準的なプラクティスであり、npm / Nix のどちらの環境でも正しく動作する。

### 注意点

- shebang を追加しても npm 経由のインストールには影響なし（npm のラッパーが優先される）
- Nix 側の修正ではなく、npm パッケージ側で対応すべき問題

## 参考リンク

- [npm docs - package.json bin](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)
- [TypeScript の shebang サポート](https://github.com/microsoft/TypeScript/issues/2749) - tsc は shebang をそのまま保持する
