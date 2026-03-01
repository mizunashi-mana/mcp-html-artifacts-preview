# fix-http-server-premature-close

## 目的・ゴール

MCP サーバ起動後に HTTP サーバにブラウザからアクセスできない問題を修正する。

## 原因

`cli.ts` で `await server.connect(transport)` の直後に `await cleanup()` を呼んでいるが、
MCP SDK v1.27 の `McpServer.connect()` は transport の接続完了直後に即座に resolve する
（接続が閉じるまで待たない）。このため HTTP サーバが即座に閉じられてしまう。

## 実装方針

- `server.connect()` 後、MCP 接続が閉じるまで待機する
- `server.server.onclose` コールバックで接続終了を検知
- `StdioServerTransport` は stdin の close を検知しないため、
  `process.stdin` の `close` イベントで `server.close()` をトリガーする

## 完了条件

- [x] HTTP サーバが MCP 接続中ずっと動作し続ける
- [x] MCP クライアント切断時に正常にクリーンアップされる
- [x] SIGINT/SIGTERM 時に正常に終了する
- [x] 既存テストが通る
- [x] lint/build が通る

## 作業ログ

- 2026-03-01: MCP SDK v1.27.1 のソースを調査し、`connect()` が即座に resolve する動作を確認。
- 2026-03-01: `cli.ts` を修正。`server.server.onclose` で接続終了を待機、`stdin` の `close` イベントで切断検知。build/lint/test すべてパス。
