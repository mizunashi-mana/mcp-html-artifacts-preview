# setup-dependabot

## 目的・ゴール

GitHub Dependabot を設定し、依存関係の自動更新 PR を受け取れるようにする。

## 実装方針

[cc-voice-reporter](https://github.com/mizunashi-mana/cc-voice-reporter) の dependabot 設定を参考に、`.github/dependabot.yml` を作成する。

対象パッケージエコシステム:

- **github-actions**: GitHub Actions の更新チェック
- **npm**: npm パッケージの更新チェック

スケジュールは月次（monthly）とする。

## 完了条件

- [x] `.github/dependabot.yml` が作成されている
- [x] github-actions と npm の 2 つのエコシステムが設定されている
- [x] CI が通る（ローカル lint/test/build 全パス）
- [ ] PR が作成されている

## 作業ログ

- `.github/dependabot.yml` を作成（github-actions + npm、月次スケジュール）
- lint / test / build すべてパス
