# US013: BFF認証

## ストーリー

Angularアプリケーションのユーザーとして、
BFF（api-gateway）を経由して認証操作を行いたい。
それにより、JWTを取得してタスク管理機能にアクセスできる。

## 受け入れ基準

- BFFを経由してユーザー登録、ログイン、トークンリフレッシュ、ログアウトができる
- BFFはJWTを検証し、下流サービスにユーザー情報を伝播する
- 認証済みユーザーは自分の情報を取得できる（GET /api/auth/me）
- 無効なJWTでアクセスした場合、401エラーが返る
- 公開エンドポイント（register, login, refresh）はJWT不要でアクセス可能

## アンチパターン（これは仕様に含まない）

- BFFはJWTの発行を行わない（user-serviceが担当）
- BFFはRefresh TokenをDBに保存しない（user-serviceが担当）
- Access Tokenのブラックリスト管理は行わない（有効期限切れまで有効）

## テストシナリオ

### 正常系

#### シナリオ1: BFF経由でユーザー登録

- **Given（前提）**: 未登録の状態
- **When（操作）**: POST /api/auth/register に `{"email": "test@example.com", "password": "Password123", "displayName": "テストユーザー"}` を送信
- **Then（結果）**:
  - HTTPステータス 201 が返る
  - レスポンスに `user.id`, `user.email`, `accessToken`, `refreshToken` が含まれる
  - `user.roles` に `MEMBER` が含まれる

#### シナリオ2: BFF経由でログイン

- **Given（前提）**: `test@example.com` / `Password123` で登録済み
- **When（操作）**: POST /api/auth/login に `{"email": "test@example.com", "password": "Password123"}` を送信
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - レスポンスに `user`, `accessToken`, `refreshToken` が含まれる

#### シナリオ3: BFF経由でトークンリフレッシュ

- **Given（前提）**: 有効なRefresh Tokenを保持
- **When（操作）**: POST /api/auth/refresh に `{"refreshToken": "<valid_refresh_token>"}` を送信
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - 新しい `accessToken` と `refreshToken` が返る
  - 古いRefresh Tokenは無効化される（Refresh Token Rotation）

#### シナリオ4: 認証済みユーザー情報取得

- **Given（前提）**: 有効なAccess Tokenを保持
- **When（操作）**: GET /api/auth/me に `Authorization: Bearer <access_token>` ヘッダ付きでリクエスト
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - レスポンスに `id`, `email`, `profile`, `roles` が含まれる

#### シナリオ5: BFF経由でログアウト

- **Given（前提）**: ログイン済みでRefresh Tokenを保持
- **When（操作）**: POST /api/auth/logout に `Authorization: Bearer <access_token>` と `{"refreshToken": "<refresh_token>"}` を送信
- **Then（結果）**:
  - HTTPステータス 200 が返る
  - `{"message": "Logged out successfully"}` が返る
  - 以後、同じRefresh Tokenは使用不可

### 異常系

#### シナリオ6: JWT未提供で認証必須エンドポイントにアクセス

- **Given（前提）**: Authorizationヘッダなし
- **When（操作）**: GET /api/auth/me にリクエスト
- **Then（結果）**:
  - HTTPステータス 401 が返る
  - エラーコード `BFF_UNAUTHORIZED` が返る

#### シナリオ7: 無効なJWTでアクセス

- **Given（前提）**: 改ざんまたは期限切れのJWT
- **When（操作）**: GET /api/auth/me に `Authorization: Bearer <invalid_token>` でリクエスト
- **Then（結果）**:
  - HTTPステータス 401 が返る
  - エラーコード `BFF_UNAUTHORIZED` が返る

#### シナリオ8: 無効なRefresh Tokenでリフレッシュ

- **Given（前提）**: 無効化済みまたは不正なRefresh Token
- **When（操作）**: POST /api/auth/refresh に `{"refreshToken": "<invalid_token>"}` を送信
- **Then（結果）**:
  - HTTPステータス 401 が返る
  - エラーコード `USER_AUTH_INVALID_REFRESH_TOKEN` が返る

#### シナリオ9: 無効な認証情報でログイン

- **Given（前提）**: 存在しないまたは不正なメール/パスワード
- **When（操作）**: POST /api/auth/login に `{"email": "wrong@example.com", "password": "wrongpassword"}` を送信
- **Then（結果）**:
  - HTTPステータス 401 が返る
  - エラーコード `USER_AUTH_INVALID_CREDENTIALS` が返る

#### シナリオ10: 停止アカウントでログイン

- **Given（前提）**: isActive=false のユーザー
- **When（操作）**: POST /api/auth/login に該当ユーザーの認証情報を送信
- **Then（結果）**:
  - HTTPステータス 403 が返る
  - エラーコード `USER_AUTH_ACCOUNT_DISABLED` が返る

#### シナリオ11: user-service障害時の登録リクエスト

- **Given（前提）**: user-serviceがダウンしている
- **When（操作）**: POST /api/auth/register にリクエスト
- **Then（結果）**:
  - HTTPステータス 503 が返る
  - エラーコード `BFF_SERVICE_UNAVAILABLE` が返る

## BFF認証フロー図

```
┌─────────┐         ┌─────────┐         ┌──────────────┐
│ Angular │────────▶│   BFF   │────────▶│ user-service │
└─────────┘         └─────────┘         └──────────────┘

1. ログイン
   [Angular] POST /api/auth/login { email, password }
        │
        ▼
   [BFF] バリデーション（DTO検証）
        │
        ▼
   [BFF] POST /auth/login { email, password } → user-service
        │
        ▼
   [user-service] email/password検証 → JWT発行
        │
        ▼
   [BFF] ← { user, accessToken, refreshToken }
        │
        ▼
   [Angular] ← { user, accessToken, refreshToken }

2. 認証済みリクエスト（GET /api/auth/me）
   [Angular] GET /api/auth/me (Authorization: Bearer <JWT>)
        │
        ▼
   [BFF] Passport JWT Strategy でトークン検証
        │ 検証成功: { sub: 1, email: "...", roles: ["MEMBER"] }
        ▼
   [BFF] GET /auth/me (X-User-Id: 1, X-User-Roles: MEMBER) → user-service
        │
        ▼
   [user-service] X-User-Id からユーザー情報取得
        │
        ▼
   [BFF] ← { user }
        │
        ▼
   [Angular] ← { user }
```

## 実装ポイント

### JWT検証（BFF層）

```typescript
// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret-key'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserFromJwt> {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
```

### 公開エンドポイント設定

```typescript
// decorators/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// auth.controller.ts
@Controller('api/auth')
export class AuthController {
  @Public()  // JWT不要
  @Post('register')
  register(@Body() dto: RegisterDto) { ... }

  @Public()  // JWT不要
  @Post('login')
  login(@Body() dto: LoginDto) { ... }

  @Public()  // JWT不要
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) { ... }

  // @Public() なし = JWT必須
  @Post('logout')
  logout(@CurrentUser() user: UserFromJwt, @Body() dto: LogoutDto) { ... }

  // @Public() なし = JWT必須
  @Get('me')
  me(@CurrentUser() user: UserFromJwt) { ... }
}
```

### ヘッダ伝播

```typescript
// auth.service.ts
async me(user: UserFromJwt) {
  // user-serviceにX-User-* ヘッダを伝播
  return this.userServiceClient.getMe(user.id, user.roles);
}

// clients/user-service.client.ts
async getMe(userId: number, roles: string[]) {
  const response = await firstValueFrom(
    this.httpService.get(`${this.baseUrl}/auth/me`, {
      headers: {
        'X-User-Id': String(userId),
        'X-User-Roles': roles.join(','),
      },
    })
  );
  return response.data;
}
```

## 関連

- US008: ユーザー登録（user-service側の実装）
- US009: ログイン（user-service側の実装）
- US014: BFFデータ集約（認証済みリクエストの応用）
