# ADR-0005: Docker Desktop採用

## ステータス

承認

## コンテキスト

Windows 11 + WSL2環境での開発において、Dockerの実行方法を決定する必要がある。
選択肢として「Docker Desktop（WSL2バックエンド）」と「WSL2内にDocker Engineを直接インストール」がある。

## 決定

Docker Desktop（WSL2バックエンド）を採用する。

## 理由

- 個人学習プロジェクトのためライセンス費用は発生しない
- GUIによる管理が容易で、Docker自体の設定に時間をかけずNestJS学習に集中できる
- VS Code Dev Containers拡張との統合がシームレス
- WSL2 + Docker Engineも検討したが、本プロジェクトの主目的はNestJS/BFF学習であり、Linux環境の深い理解は副次的

## 影響

- Docker Desktopのインストールが必要
- WSL2との統合設定を有効化する
- DevContainerはDocker Desktop経由で動作
