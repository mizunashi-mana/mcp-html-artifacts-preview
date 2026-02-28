# implement-hot-reload

## 目的・ゴール

`update_page` / `add_scripts` / `add_stylesheets` ツール呼び出し時に、ブラウザ側で自動的にページが更新されるホットリロード機能を SSE (Server-Sent Events) で実装する。

## 実装方針

1. **PageStore に変更通知を追加**: EventEmitter パターンで、ページ変更時にイベントを発火
2. **SSE エンドポイント追加**: HTTP サーバーに `/pages/:id/events` エンドポイントを追加し、該当ページの変更を SSE で配信
3. **クライアントスクリプト注入**: `buildHtml()` で配信する HTML に、SSE を購読して `location.reload()` するスクリプトを自動注入
4. **ページ削除時の通知**: `destroy_page` 時にも SSE で通知し、クライアント側で適切に処理

## 完了条件

- [x] PageStore がページ変更時にイベントを発火する
- [x] HTTP サーバーが `/pages/:id/events` で SSE ストリームを配信する
- [x] 配信される HTML に SSE 購読スクリプトが自動注入される
- [x] `update_page` 呼び出し時にブラウザが自動リロードされる
- [x] `add_scripts` / `add_stylesheets` 呼び出し時もリロードされる
- [x] `destroy_page` 時にクライアントに通知される
- [x] 既存テストが通る
- [x] lint / build が通る

## 作業ログ

- PageStore に EventEmitter ベースの変更通知 (`onChange`/`offChange`) を追加
- HTTP サーバーに `/pages/:id/events` SSE エンドポイントを追加
- `buildHtml()` に SSE 購読・自動リロードのクライアントスクリプトを常時注入するように変更
- PageStore のイベント発火テスト 6 件を追加
- buildHtml のテストをホットリロードスクリプト注入に対応するよう更新
- 全テスト (39 件) 通過、lint・build 通過を確認
