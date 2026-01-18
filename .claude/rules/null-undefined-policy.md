# null/undefined ポリシー

## 目的

JavaScriptには「値がない」を表す`undefined`と`null`の2種類が存在する。
このプロジェクトでは**一貫性とシンプルさ**のため、以下のポリシーを採用する。

## 基本方針

**`null`は使用しない。`undefined`または有効な値の2択とする。**

```typescript
// OK: undefinedまたは有効な値
description?: string;          // undefined or string

// NG: nullを許可しない
description?: string | null;   // 使用禁止
```

## 理由

1. **シンプルさ**: 「値がない」状態が1種類で済む
2. **一貫性**: `@IsOptional()`の挙動と自然に一致
3. **混乱の防止**: undefined/nullの使い分けルールが不要

## DTOでの適用

### 任意フィールド

```typescript
// OK
@IsOptional()
@IsString()
description?: string;

// NG
@IsOptional()
@IsString()
description?: string | null;
```

### 必須フィールド

```typescript
// OK
@IsNotEmpty()
@IsString()
title: string;
```

## 「クリア」操作が必要な場合

nullで「値をクリア」する代わりに、以下のいずれかを採用:

1. **空文字を許可**: 文字列フィールドは空文字`""`でクリアを表現
2. **専用エンドポイント**: `DELETE /users/:id/avatar`のようにクリア専用APIを用意
3. **明示的なフラグ**: `{ clearDescription: true }`のようなフラグで制御

## 例外

外部API連携など、nullが必要な場合は例外としてコメントで理由を明記する。

```typescript
/**
 * 外部API（XXXサービス）がnullを要求するため、例外的にnullを許可
 */
@IsOptional()
@ValidateIf((_, v) => v !== null)
externalField?: string | null;
```

## 関連

- `@IsOptional()`: undefinedを許可（nullは許可しない）
- `@IsDefined()`: undefined以外を許可（nullは許可）
- 詳細は `docs/learning/dto-validation.md` を参照
