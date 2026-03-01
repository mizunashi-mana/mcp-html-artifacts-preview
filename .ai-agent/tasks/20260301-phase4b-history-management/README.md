# Phase 4b: 履歴管理

## 目的・ゴール

ページのライフサイクル管理機能を追加し、長時間稼働時のメモリ増大を防ぐ。保持上限・有効期限・削除済み履歴の3機能を実装する。

## 実装方針

### 1. アーティファクト履歴の保持上限設定（件数）

- `PageStore` に `maxPages` オプションを追加
- ページ数が上限を超えた場合、最も古いページ（`createdAt` 基準）を自動削除
- CLI に `--max-pages <n>` オプションを追加
- デフォルトは制限なし（`undefined`）

### 2. ページ有効期限の設定（期限切れの自動クリーンアップ）

- `PageStore` に `ttl`（Time-To-Live、ミリ秒）オプションを追加
- 定期的に期限切れページをクリーンアップ（タイマーベース）
- CLI に `--ttl <seconds>` オプションを追加
- デフォルトは無期限（`undefined`）
- クリーンアップ間隔はTTLの半分程度（最小10秒）

### 3. 削除済みアーティファクトの履歴保持

- `PageStore` に削除済みページの履歴を保持する `tombstones` マップを追加
- `Page` の情報（html以外: id, name, title, createdAt, deletedAt）を保持
- `get_pages` ツールに `include_deleted` オプションを追加して削除済みも一覧可能に
- ダッシュボードに削除済みアーティファクトを薄くグレーアウト表示
- tombstone にも保持上限を適用（`maxPages` と同じか、別途 `maxTombstones`）

## 完了条件

- [x] `--max-pages` で保持上限を設定でき、超過時に古いページが自動削除される
- [x] `--ttl` で有効期限を設定でき、期限切れページが自動クリーンアップされる
- [x] 削除されたページの履歴（tombstone）が保持される
- [x] `get_pages` で `includeDeleted: true` を指定すると削除済みも含む一覧が取得できる
- [x] ダッシュボードに削除済みアーティファクトが表示される
- [x] 既存テストが通る
- [x] 新機能のテストが追加されている
- [x] lint / build が通る

## 作業ログ

- `page-store.ts`: `Tombstone` インターフェース追加、`PageStoreOptions` (maxPages, ttl) 追加、eviction・TTLクリーンアップ・tombstone 保存ロジック実装、`dispose()` メソッド追加
- `tools.ts`: `get_pages` に `includeDeleted` オプション追加（tombstone を含むリスト返却）
- `http-server.ts`: ダッシュボードに削除済みアーティファクトのグレーアウト表示（`<h2>Deleted</h2>` セクション、`tr.deleted` スタイル）
- `cli.ts`: `--max-pages <n>`, `--ttl <seconds>` CLI オプション追加、`cleanup` に `pageStore.dispose()` 追加
- `index.ts`: `Tombstone`, `PageStoreOptions` 型のエクスポート追加
- テスト: 99テスト全通過（+20 新規テスト: eviction×4, tombstone×4, TTL×4, dispose×2, tools×2, dashboard×4）
