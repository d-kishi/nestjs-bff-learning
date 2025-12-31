# .devcontainer/

VS Code Dev Containers の設定を格納するディレクトリです。

## 格納するファイル

```
.devcontainer/
├── devcontainer.json    # Dev Container設定
├── docker-compose.yml   # コンテナ構成
└── Dockerfile           # アプリコンテナのイメージ定義
```

## 構成（予定）

### コンテナ構成

| コンテナ | 役割 |
|---------|------|
| app | Node.js + Oracle Instant Client |
| oracle | Oracle Database XE 21c |

### devcontainer.json

```json
{
  "name": "NestJS BFF Learning",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    }
  },
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "Orta.vscode-jest"
      ]
    }
  }
}
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ..:/workspace:cached
    command: sleep infinity
    depends_on:
      - oracle

  oracle:
    image: container-registry.oracle.com/database/express:21.3.0-xe
    environment:
      ORACLE_PWD: password
    ports:
      - "1521:1521"
    volumes:
      - oracle-data:/opt/oracle/oradata
      - ../database/init:/opt/oracle/scripts/startup

volumes:
  oracle-data:
```

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Oracle Instant Client
RUN apt-get update && apt-get install -y libaio1 wget unzip \
    && wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip \
    && unzip instantclient-basiclite-linuxx64.zip -d /opt/oracle \
    && rm instantclient-basiclite-linuxx64.zip \
    && echo /opt/oracle/instantclient* > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

# CodeRabbit CLI（オプション）
RUN curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

## 注意事項

- Oracle XEの初回起動には数分かかります
- node-oracledbとInstant Clientのバージョン互換性に注意
- 開発マシン: Intel/AMD (x86_64) を想定

## 使用方法

1. VS Codeでプロジェクトを開く
2. コマンドパレット → 「Reopen in Container」
3. 初回はイメージビルドに時間がかかります
