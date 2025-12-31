# database/init/

Oracle XE起動時に実行される初期化SQLを格納するディレクトリです。

## 格納するファイル

```
init/
├── 01_create_users.sql      # スキーマ（ユーザー）作成
├── 02_grant_privileges.sql  # 権限付与
└── 99_seed_data.sql         # 初期データ（開発用）
```

## 実行順序

ファイル名のプレフィックス（01_, 02_, ...）順に実行されます。

## サンプル

### 01_create_users.sql

```sql
-- 開発用スキーマ
CREATE USER TASK_DB IDENTIFIED BY password;
CREATE USER USER_DB IDENTIFIED BY password;

-- テスト用スキーマ
CREATE USER TASK_DB_TEST IDENTIFIED BY password;
CREATE USER USER_DB_TEST IDENTIFIED BY password;
```

### 02_grant_privileges.sql

```sql
-- 開発用
GRANT CONNECT, RESOURCE TO TASK_DB;
GRANT CONNECT, RESOURCE TO USER_DB;
GRANT UNLIMITED TABLESPACE TO TASK_DB;
GRANT UNLIMITED TABLESPACE TO USER_DB;

-- テスト用
GRANT CONNECT, RESOURCE TO TASK_DB_TEST;
GRANT CONNECT, RESOURCE TO USER_DB_TEST;
GRANT UNLIMITED TABLESPACE TO TASK_DB_TEST;
GRANT UNLIMITED TABLESPACE TO USER_DB_TEST;
```

## 注意事項

- Oracle XEの初回起動には数分かかります
- DevContainerのdocker-compose.ymlでこのディレクトリをマウントする設定が必要です
- パスワードは開発用であり、本番環境では使用しないでください
