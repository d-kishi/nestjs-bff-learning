# angular-app

Angular 17+ によるフロントエンドアプリケーションです。

## 技術スタック

- Angular 17+
- Standalone Component（推奨）
- HttpClient

## ディレクトリ構成（予定）

```
angular-app/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── api.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   └── tasks/
│   │   ├── shared/
│   │   │   └── components/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── main.ts
├── angular.json
└── package.json
```

## 主な機能（予定）

### 認証
- ログイン/ログアウト
- JWTトークン管理
- AuthGuardによるルート保護

### タスク管理
- ダッシュボード表示
- タスク一覧
- タスク作成/編集

## API通信

すべてのAPI通信は **api-gateway（BFF）** を経由します。

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

## 作成方法

```bash
cd frontend
ng new angular-app --standalone --routing --style=scss
```

## 備考

- このプロジェクトの主役はNestJS側であり、フロントエンドは動作確認用
- 複雑なUI/UXは実装しない
- テストはスコープ外
