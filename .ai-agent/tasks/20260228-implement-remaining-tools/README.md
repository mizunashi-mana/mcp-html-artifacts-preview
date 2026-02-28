# 残りツール一括実装（destroy_page, add_scripts, add_stylesheets）

## 目的・ゴール

Phase 2 のツールセットを完成させる。`destroy_page`、`add_scripts`、`add_stylesheets` の 3 ツールを実装する。

## 実装方針

### 1. `destroy_page` ツール

- `PageStore` に `delete(id)` メソッドを追加
- `tools.ts` に `destroy_page` ツールを登録
- ページが見つからない場合はエラーを返す

### 2. `add_scripts` / `add_stylesheets` ツール

- `Page` インターフェースに `scripts: string[]` と `stylesheets: string[]` を追加
- `PageStore` に `addScripts(id, urls)` / `addStylesheets(id, urls)` メソッドを追加
- HTTP サーバーでページ配信時にスクリプト/スタイルシートタグを注入
- `tools.ts` に両ツールを登録

### 3. テスト

- `PageStore` の新メソッドに対するユニットテスト追加

## 完了条件

- [x] `destroy_page` ツールが動作する
- [x] `add_scripts` ツールが動作する
- [x] `add_stylesheets` ツールが動作する
- [x] テストが全て通る（30 tests passed）
- [x] lint / build が通る

## 作業ログ

- PageStore に `delete` / `addScripts` / `addStylesheets` メソッドを追加
- Page インターフェースに `scripts: string[]` / `stylesheets: string[]` フィールドを追加
- HTTP サーバーに `buildHtml` 関数を追加（スクリプト/スタイルシートタグの注入）
- tools.ts に `destroy_page` / `add_scripts` / `add_stylesheets` ツールを登録
- PageStore テスト（delete / addScripts / addStylesheets）と buildHtml テストを追加
- lint / test / build 全て通過
