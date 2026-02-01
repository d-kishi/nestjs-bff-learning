# =============================================================================
# NestJS BFF Learning - 開発用コンテナイメージ
# =============================================================================
#
# 【このDockerfileの目的】
# Node.js開発環境に、Oracle Database接続に必要なInstant Clientを追加した
# カスタムイメージを作成する。NestJS + TypeORM + Oracle構成で開発するため。
#
# =============================================================================

# -----------------------------------------------------------------------------
# ベースイメージの指定
# -----------------------------------------------------------------------------
# FROM: 元となるイメージを指定
#
# mcr.microsoft.com/devcontainers/javascript-node:20
#   - Microsoft公式のDevContainer用Node.jsイメージ
#   - Node.js 20 LTS がプリインストール済み
#   - VS Code DevContainer機能に最適化されている
#   - Debian Linux（現在はTrixie）ベース
#   - 開発に便利なツール（git, curl等）が含まれている
# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/devcontainers/javascript-node:20

# -----------------------------------------------------------------------------
# Oracle Instant Client のインストール
# -----------------------------------------------------------------------------
# 【なぜ必要か】
# Node.jsからOracle Databaseに接続するには、node-oracledbパッケージを使用する。
# node-oracledbはOracle Instant Client（Oracleの接続ライブラリ）に依存している。
# コンテナ内にInstant Clientをインストールしないと、DB接続時にエラーになる。
#
# 【RUNコマンドの解説】
# RUN: イメージビルド時にコマンドを実行する
# 複数コマンドを && で連結し、1つのレイヤーにまとめることで
# イメージサイズを削減している（Dockerのベストプラクティス）
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y libaio1t64 wget unzip \
    # CodeRabbit CLI認証用パッケージ
    # xdg-utils: xdg-openコマンド（OAuth認証URL表示に必要）
    # dbus-x11, gnome-keyring, libsecret-1-0: 認証情報の保存
    xdg-utils dbus-x11 gnome-keyring libsecret-1-0 \
    # ┌─────────────────────────────────────────────────────────────────────┐
    # │ apt-get update                                                      │
    # │   パッケージリストを最新化。install前に必ず実行が必要。             │
    # │                                                                     │
    # │ apt-get install -y libaio1t64 wget unzip                           │
    # │   -y: 確認プロンプトに自動でYes（自動化のため必須）                │
    # │   libaio1t64: 非同期I/Oライブラリ。Instant Clientの動作に必須。    │
    # │              ※Debian Trixieではlibaio1からlibaio1t64にリネーム     │
    # │   wget: ファイルダウンロード用コマンド                              │
    # │   unzip: ZIP解凍用コマンド                                          │
    # └─────────────────────────────────────────────────────────────────────┘
    #
    # Instant ClientのZIPファイルをダウンロード
    && wget https://download.oracle.com/otn_software/linux/instantclient/2340000/instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    # ┌─────────────────────────────────────────────────────────────────────┐
    # │ wget [URL]                                                          │
    # │   Oracle公式サイトからInstant Client 23.4をダウンロード             │
    # │   basiclite版: 最小構成（約15MB）。フル版は不要な機能が多い         │
    # │   x64: 64bit Linux用                                                │
    # └─────────────────────────────────────────────────────────────────────┘
    #
    # ZIPを/opt/oracle配下に解凍
    && unzip instantclient-basiclite-linux.x64-23.4.0.24.05.zip -d /opt/oracle \
    # ┌─────────────────────────────────────────────────────────────────────┐
    # │ unzip [ファイル] -d [解凍先ディレクトリ]                            │
    # │   /opt/oracle/instantclient_23_4/ が作成される                      │
    # │   /opt はLinuxで追加ソフトウェアを置く慣習的なディレクトリ          │
    # └─────────────────────────────────────────────────────────────────────┘
    #
    # 不要になったZIPファイルを削除（イメージサイズ削減）
    && rm instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    #
    # 共有ライブラリの検索パスにInstant Clientを追加
    && echo /opt/oracle/instantclient_23_4 > /etc/ld.so.conf.d/oracle-instantclient.conf \
    # ┌─────────────────────────────────────────────────────────────────────┐
    # │ /etc/ld.so.conf.d/ にパス設定ファイルを作成                         │
    # │   Linuxが共有ライブラリ(.so)を探す場所を指定                        │
    # │   これがないとnode-oracledbがInstant Clientを見つけられない         │
    # └─────────────────────────────────────────────────────────────────────┘
    #
    # ライブラリキャッシュを再構築
    && ldconfig \
    # ┌─────────────────────────────────────────────────────────────────────┐
    # │ ldconfig                                                            │
    # │   共有ライブラリのキャッシュを更新                                  │
    # │   上で追加したパス設定を反映させるために必要                        │
    # └─────────────────────────────────────────────────────────────────────┘
    #
    # aptキャッシュをクリーンアップ（イメージサイズ削減）
    && apt-get clean && rm -rf /var/lib/apt/lists/*
    # ┌─────────────────────────────────────────────────────────────────────┐
    # │ apt-get clean                                                       │
    # │   ダウンロードしたパッケージのキャッシュを削除                      │
    # │                                                                     │
    # │ rm -rf /var/lib/apt/lists/*                                         │
    # │   パッケージリストを削除                                            │
    # │   これらはビルド後は不要。Dockerイメージサイズ削減のベストプラクティス│
    # └─────────────────────────────────────────────────────────────────────┘

# -----------------------------------------------------------------------------
# 環境変数の設定
# -----------------------------------------------------------------------------
# ENV: コンテナ内で使用できる環境変数を定義
# コンテナ起動時に自動的に設定される
# -----------------------------------------------------------------------------

# LD_LIBRARY_PATH: 共有ライブラリの検索パス（実行時に参照）
# node-oracledbがInstant Clientのライブラリを見つけるために必要
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_23_4:$LD_LIBRARY_PATH

# PATH: コマンド検索パス
# Instant Client付属のツール（sqlplus等）を使う場合に必要
ENV PATH=/opt/oracle/instantclient_23_4:$PATH

# -----------------------------------------------------------------------------
# Playwright E2Eテスト用の依存パッケージ
# -----------------------------------------------------------------------------
# 【なぜ必要か】
# Playwright（ブラウザ自動化ライブラリ）でE2Eテストを実行するために、
# Chromiumブラウザの動作に必要なOS依存パッケージをインストールする。
# ブラウザ本体はpostCreateCommandでnpx playwright installにより取得。
#
# 【パッケージの説明】
# - fonts-*: 各言語のフォント（日本語、中国語、韓国語、タイ語等）
# - libasound2t64: オーディオ（ALSA）ライブラリ
# - libatk*: アクセシビリティツールキット
# - libcairo2, libpango*: 2Dグラフィックス・テキストレンダリング
# - libdbus-1-3: D-Bus（プロセス間通信）
# - libdrm2, libgbm1: DRM/GBM（GPU関連）
# - libnss3, libnspr4: SSL/TLS・Netscapeランタイム
# - libx*: X11（ディスプレイサーバー）関連
# - xvfb: 仮想フレームバッファ（ヘッドレス実行用）
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    fonts-liberation fonts-noto-color-emoji fonts-unifont \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-tlwg-loma-otf fonts-freefont-ttf \
    libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 \
    libcairo2 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0t64 \
    libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
    libfontconfig1 libfreetype6 xfonts-scalable xvfb \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Bun ランタイムのインストール
# -----------------------------------------------------------------------------
# 【なぜBunを使うか】
# - 高速なJavaScriptランタイム（Node.jsの代替）
# - NestJSサービスの実行に使用
# - bunx でパッケージの一時実行も可能（npx相当）
#
# 【インストール先】
# /usr/local にインストールすることで、全ユーザー（node, root）がアクセス可能
# DevContainerはnodeユーザーで実行されるため、/root/.bunでは権限エラーになる
# -----------------------------------------------------------------------------
ENV BUN_INSTALL="/usr/local"
RUN curl -fsSL https://bun.sh/install | bash

# -----------------------------------------------------------------------------
# pnpm パッケージマネージャのインストール
# -----------------------------------------------------------------------------
# 【なぜpnpmを使うか】
# - ディスク使用量削減（ハードリンク活用）
# - インストール速度向上
# - npm workspacesと互換性あり
# - corepack経由でNode.jsと統合管理
# -----------------------------------------------------------------------------
RUN corepack enable && corepack prepare pnpm@latest --activate

# -----------------------------------------------------------------------------
# NestJS CLI について
# -----------------------------------------------------------------------------
# グローバルインストールは行わず、以下の方法で使用:
# - bunx @nestjs/cli new my-service  (新規プロジェクト作成)
# - pnpm exec nest generate ...       (既存プロジェクト内でのコード生成)
# -----------------------------------------------------------------------------
