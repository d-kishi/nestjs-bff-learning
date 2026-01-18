# DTOバリデーション詳解

class-validator を使ったDTOバリデーションの詳細を解説します。

> **前提知識**: ValidationPipeの基本は [nestjs-validation-pipe.md](./nestjs-validation-pipe.md) を参照してください。

## 目次

1. [デコレータの共通オプション](#1-デコレータの共通オプション)
2. [基本デコレータ詳細](#2-基本デコレータ詳細)
3. [型変換（class-transformer）](#3-型変換class-transformer)
4. [条件付きバリデーション](#4-条件付きバリデーション)
5. [ネストオブジェクトのバリデーション](#5-ネストオブジェクトのバリデーション)
6. [カスタムバリデータ](#6-カスタムバリデータ)
7. [クラスレベルバリデーション](#7-クラスレベルバリデーション)
8. [バリデーショングループ](#8-バリデーショングループ)
9. [実プロジェクトでの実装例](#9-実プロジェクトでの実装例)

---

## 1. デコレータの共通オプション

ほぼ全てのバリデーションデコレータは、最後の引数に`ValidationOptions`オブジェクトを受け取ります。

### ValidationOptions

```typescript
interface ValidationOptions {
  // エラーメッセージ（文字列または関数）
  message?: string | ((args: ValidationArguments) => string);

  // バリデーショングループ（後述）
  groups?: string[];

  // 配列の各要素に適用するか
  each?: boolean;

  // 他バリデータより先に実行するか
  always?: boolean;

  // 追加情報を保持
  context?: any;
}
```

### messageオプションの詳細

```typescript
// 静的メッセージ
@IsNotEmpty({ message: 'タイトルは必須です' })
title: string;

// 動的メッセージ（ValidationArguments使用）
@MaxLength(100, {
  message: (args: ValidationArguments) => {
    return `${args.property}は${args.constraints[0]}文字以内で入力してください（現在: ${args.value?.length}文字）`;
  },
})
description: string;
```

### ValidationArguments

動的メッセージで利用できる情報:

| プロパティ | 内容 | 例 |
|-----------|------|-----|
| `value` | 検証対象の値 | `"長すぎる文字列..."` |
| `property` | プロパティ名 | `"description"` |
| `targetName` | クラス名 | `"CreateTaskDto"` |
| `constraints` | デコレータの引数 | `[100]`（MaxLength(100)の場合） |
| `object` | DTOインスタンス全体 | `{ title: "...", description: "..." }` |

### eachオプション

配列の各要素に対してバリデーションを実行:

```typescript
// 配列内の各数値が正の整数かチェック
@IsNumber({}, { each: true, message: '各tagIdは数値である必要があります' })
@IsPositive({ each: true, message: '各tagIdは正の数である必要があります' })
tagIds: number[];
```

---

## 2. 基本デコレータ詳細

### 2.1 文字列系

| デコレータ | 用途 | オプション |
|-----------|------|-----------|
| `@IsString()` | 文字列型チェック | - |
| `@IsNotEmpty()` | 空文字・null・undefined拒否 | - |
| `@MinLength(n)` | 最小文字数 | `n: number` |
| `@MaxLength(n)` | 最大文字数 | `n: number` |
| `@Length(min, max)` | 文字数範囲 | `min, max: number` |
| `@Matches(pattern)` | 正規表現マッチ | `pattern: RegExp` |
| `@Contains(seed)` | 部分文字列含む | `seed: string` |
| `@NotContains(seed)` | 部分文字列含まない | `seed: string` |
| `@IsAlpha()` | 英字のみ | - |
| `@IsAlphanumeric()` | 英数字のみ | - |
| `@IsAscii()` | ASCII文字のみ | - |

#### @Matchesの実践例

```typescript
// パスワード: 英字と数字を含む8文字以上
@Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
  message: 'パスワードは英字と数字を含める必要があります',
})
password: string;

// 日本語電話番号（ハイフンあり/なし両対応）
@Matches(/^0\d{1,4}-?\d{1,4}-?\d{4}$/, {
  message: '有効な電話番号を入力してください',
})
phoneNumber: string;
```

### 2.2 数値系

| デコレータ | 用途 | オプション |
|-----------|------|-----------|
| `@IsNumber(options)` | 数値型チェック | `allowNaN`, `allowInfinity`, `maxDecimalPlaces` |
| `@IsInt()` | 整数チェック | - |
| `@IsPositive()` | 正の数 | - |
| `@IsNegative()` | 負の数 | - |
| `@Min(n)` | 最小値 | `n: number` |
| `@Max(n)` | 最大値 | `n: number` |
| `@IsDivisibleBy(n)` | 割り切れる | `n: number` |

#### @IsNumberのオプション

```typescript
@IsNumber(
  {
    allowNaN: false,           // NaN許可（デフォルト: false）
    allowInfinity: false,      // Infinity許可（デフォルト: false）
    maxDecimalPlaces: 2,       // 小数点以下桁数制限
  },
  { message: '価格は小数点以下2桁までです' },
)
price: number;
```

### 2.3 日付系

| デコレータ | 用途 | 備考 |
|-----------|------|------|
| `@IsDate()` | Dateオブジェクトチェック | `@Type(() => Date)`と併用 |
| `@IsISO8601()` | ISO8601形式文字列 | `2025-12-31T23:59:59Z` |
| `@IsDateString()` | 日付文字列（広義） | より緩い形式も許可 |
| `@MinDate(date)` | 指定日以降 | - |
| `@MaxDate(date)` | 指定日以前 | - |

```typescript
// ISO8601形式の文字列として受け取る（シンプルな検証のみ）
@IsISO8601({}, { message: '日付はISO8601形式で入力してください' })
dueDate?: string;

// Dateオブジェクトとして受け取る（型変換が必要）
@Type(() => Date)
@IsDate({ message: '有効な日付を入力してください' })
@MinDate(new Date(), { message: '過去の日付は指定できません' })
scheduledAt: Date;
```

#### 【応用】日付範囲チェックとタイムゾーンの扱い

`@IsISO8601()`と`@MinDate()`/`@MaxDate()`を組み合わせる場合、**自動変換されない**点に注意が必要です。

```typescript
// NG: @IsISO8601()は文字列を検証するだけで、変換しない
@IsISO8601()
@MinDate(new Date('2025-01-01'))  // ← 文字列に対しては正しく動作しない
dueDate: string;

// OK: @Type(() => Date)でDateオブジェクトに変換してから検証
@Type(() => Date)
@IsDate({ message: '有効な日付形式で入力してください' })
@MinDate(new Date('2025-01-01T00:00:00Z'), { message: '2025年以降の日付を指定してください' })
@MaxDate(new Date('2030-12-31T23:59:59Z'), { message: '2030年までの日付を指定してください' })
dueDate: Date;
```

**タイムゾーンの変換**:

ISO8601形式でタイムゾーンオフセット付きの文字列（例: `+09:00`）を送信した場合、
`@Type(() => Date)`によりJavaScriptの`Date`オブジェクトに変換される際、**自動的にUTCに変換**されます。

```typescript
// リクエスト: "2025-06-15T09:00:00+09:00" (JST 9:00)
// 変換後: Dateオブジェクト（内部的にUTC: 2025-06-15T00:00:00.000Z）
```

**閾値指定の注意点**:

```typescript
// 注意: サーバー起動時の時刻で固定される
@MinDate(new Date())

// 推奨: UTCで明示的に指定
@MinDate(new Date('2025-01-01T00:00:00Z'))
```

「現在時刻以降」のような動的な検証が必要な場合は、カスタムバリデータを使用します（6章参照）。

```typescript
// カスタムデコレータ例: 実行時に現在時刻と比較
export function IsAfterNow(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAfterNow',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date) {
          return value instanceof Date && value.getTime() > Date.now();
        },
        defaultMessage() {
          return '未来の日付を指定してください';
        },
      },
    });
  };
}

// 使用例
@Type(() => Date)
@IsDate()
@IsAfterNow({ message: '過去の日付は指定できません' })
reservationDate: Date;
```

### 2.4 列挙型・配列

| デコレータ | 用途 | 備考 |
|-----------|------|------|
| `@IsEnum(entity)` | Enum値チェック | TypeScript Enum |
| `@IsArray()` | 配列チェック | - |
| `@ArrayMinSize(n)` | 配列最小要素数 | - |
| `@ArrayMaxSize(n)` | 配列最大要素数 | - |
| `@ArrayUnique()` | 配列要素の重複禁止 | - |
| `@ArrayNotEmpty()` | 空配列禁止 | - |

```typescript
// Enumバリデーション
@IsEnum(TaskStatus, {
  message: `statusは ${Object.values(TaskStatus).join(', ')} のいずれかです`,
})
status: TaskStatus;

// 配列バリデーション
@IsArray({ message: 'tagIdsは配列で指定してください' })
@ArrayMinSize(1, { message: '1つ以上のタグを指定してください' })
@ArrayMaxSize(10, { message: 'タグは10個までです' })
@ArrayUnique({ message: '重複するタグは指定できません' })
@IsInt({ each: true, message: '各タグIDは整数で指定してください' })
tagIds: number[];
```

### 2.5 その他よく使うデコレータ

| デコレータ | 用途 |
|-----------|------|
| `@IsEmail()` | メールアドレス形式 |
| `@IsUrl()` | URL形式 |
| `@IsUUID(version?)` | UUID形式 |
| `@IsBoolean()` | 真偽値 |
| `@IsOptional()` | undefined許可（nullは許可しない） |
| `@IsEmpty()` | null/undefined/空文字のみ許可 |
| `@IsDefined()` | undefined以外（nullは許可） |
| `@Equals(value)` | 特定値のみ許可 |
| `@NotEquals(value)` | 特定値以外許可 |
| `@IsIn(values)` | 配列内の値のみ許可 |
| `@IsNotIn(values)` | 配列内の値以外許可 |

---

## 3. 型変換（class-transformer）

### 3.1 @Type() デコレータ

クエリパラメータは全て文字列として受信されるため、数値型への変換が必要です。

```typescript
// クエリパラメータ: ?page=1&limit=20
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)    // 文字列 "1" → 数値 1 に変換
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

### 3.2 暗黙的型変換

`enableImplicitConversion: true` 設定時は、DTOの型定義に基づいて自動変換されます。

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,  // ← これ
    },
  }),
);
```

**注意**: 暗黙的変換に頼りすぎると、予期しない変換が起きる可能性があります。
明示的に`@Type()`を指定する方が安全です。

### 3.3 カスタム変換

```typescript
import { Transform } from 'class-transformer';

export class SearchDto {
  // 前後の空白を除去
  @Transform(({ value }) => value?.trim())
  @IsString()
  keyword: string;

  // カンマ区切りを配列に変換: "1,2,3" → [1, 2, 3]
  @Transform(({ value }) => value?.split(',').map(Number))
  @IsArray()
  @IsInt({ each: true })
  ids: number[];

  // 小文字に統一
  @Transform(({ value }) => value?.toLowerCase())
  @IsEmail()
  email: string;
}
```

---

## 4. 条件付きバリデーション

### 4.1 @ValidateIf()

特定条件下でのみバリデーションを実行:

```typescript
export class PaymentDto {
  @IsEnum(['credit', 'bank', 'cash'])
  paymentMethod: string;

  // クレジットカード払いの場合のみカード番号を検証
  @ValidateIf((o) => o.paymentMethod === 'credit')
  @IsCreditCard({ message: '有効なカード番号を入力してください' })
  cardNumber?: string;

  // 銀行振込の場合のみ口座番号を検証
  @ValidateIf((o) => o.paymentMethod === 'bank')
  @IsString()
  @Length(7, 7, { message: '口座番号は7桁で入力してください' })
  bankAccount?: string;
}
```

### 4.2 複数条件の組み合わせ

```typescript
export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  // ステータスが'DONE'の場合、完了日は必須
  @ValidateIf((o) => o.status === TaskStatus.DONE)
  @IsNotEmpty({ message: 'ステータスがDONEの場合、完了日は必須です' })
  @IsISO8601()
  completedAt?: string;

  // ステータスが'IN_PROGRESS'または'DONE'の場合、担当者は必須
  @ValidateIf((o) => [TaskStatus.IN_PROGRESS, TaskStatus.DONE].includes(o.status))
  @IsNotEmpty({ message: '進行中または完了のタスクには担当者が必要です' })
  @IsInt()
  assigneeId?: number;
}
```

---

## 5. ネストオブジェクトのバリデーション

### 5.1 @ValidateNested() + @Type()

ネストしたオブジェクトを検証するには両方のデコレータが必要です。

```typescript
import { ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

// ネストされるDTO
class AddressDto {
  @IsNotEmpty()
  @IsString()
  prefecture: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  building?: string;
}

// 親DTO
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateNested()           // ネストオブジェクトのバリデーション有効化
  @Type(() => AddressDto)     // class-transformerによる型変換
  address: AddressDto;
}
```

### 5.2 ネスト配列のバリデーション

```typescript
class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: '注文には1つ以上の商品が必要です' })
  @ValidateNested({ each: true })  // each: trueで配列の各要素を検証
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### 5.3 ネストの深さ制限

デフォルトでは無制限ですが、パフォーマンスやセキュリティのため制限可能:

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    validationError: {
      target: false,      // エラーレスポンスにDTOオブジェクトを含めない
      value: false,       // エラーレスポンスに入力値を含めない
    },
  }),
);
```

---

## 6. カスタムバリデータ

### 6.1 registerDecorator() を使う方法（推奨）

```typescript
// validators/is-unique-email.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          // ここでDBチェック等の非同期処理が可能
          // 実際のプロジェクトではRepositoryを注入して使用
          return !await checkEmailExists(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}は既に使用されています`;
        },
      },
    });
  };
}

// 使用例
export class RegisterDto {
  @IsEmail()
  @IsUniqueEmail({ message: 'このメールアドレスは既に登録されています' })
  email: string;
}
```

### 6.2 @ValidatorConstraint を使う方法

クラスベースのバリデータ。DIコンテナとの統合が可能:

```typescript
// validators/password-match.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return confirmPassword === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property}は${relatedPropertyName}と一致する必要があります`;
  }
}

// デコレータとして使いやすくラップ
import { Validate } from 'class-validator';

export function MatchesProperty(property: string, validationOptions?: ValidationOptions) {
  return Validate(PasswordMatchConstraint, [property], validationOptions);
}

// 使用例
export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;

  @MatchesProperty('password', { message: 'パスワードが一致しません' })
  confirmPassword: string;
}
```

### 6.3 NestJSのDIと統合

カスタムバリデータでRepositoryなどを使う場合:

```typescript
// validators/is-user-exist.validator.ts
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserRepository } from '../user/user.repository';

@ValidatorConstraint({ name: 'isUserExist', async: true })
@Injectable()  // NestJS DI対応
export class IsUserExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(userId: number) {
    const user = await this.userRepository.findOne(userId);
    return !!user;
  }

  defaultMessage() {
    return '指定されたユーザーは存在しません';
  }
}

// app.module.ts で useContainer 設定が必要
import { useContainer } from 'class-validator';

export class AppModule {
  constructor() {
    // class-validatorでNestJSのDIコンテナを使用
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
  }
}
```

---

## 7. クラスレベルバリデーション

複数フィールドの整合性をチェックする場合:

```typescript
// validators/date-range.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'dateRange', async: false })
export class DateRangeConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    if (!obj.startDate || !obj.endDate) return true;
    return new Date(obj.startDate) <= new Date(obj.endDate);
  }

  defaultMessage() {
    return '終了日は開始日以降である必要があります';
  }
}

// 使用例: クラスレベルで適用
@Validate(DateRangeConstraint)
export class SearchTasksDto {
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
```

**注意**: クラスレベルバリデーションは`@Validate()`をクラスに直接適用します。

---

## 8. バリデーショングループ

同じDTOを異なるコンテキストで使い分ける:

```typescript
export class UserDto {
  @IsNotEmpty({ groups: ['create'] })          // 作成時のみ必須
  @IsOptional({ groups: ['update'] })          // 更新時は任意
  @IsEmail()
  email: string;

  @IsNotEmpty({ groups: ['create', 'update'] }) // 両方で必須
  @IsString()
  name: string;

  @IsNotEmpty({ groups: ['create'] })           // 作成時のみ必須
  @MinLength(8, { groups: ['create'] })
  password: string;
}

// Controller
@Post()
create(
  @Body(new ValidationPipe({ groups: ['create'] }))
  dto: UserDto,
) { ... }

@Patch(':id')
update(
  @Body(new ValidationPipe({ groups: ['update'] }))
  dto: UserDto,
) { ... }
```

**推奨**: グループを使うより、Create用とUpdate用で別のDTOを作成する方が明確です。

---

## 9. 実プロジェクトでの実装例

### 9.1 認証DTO（RegisterDto）

**ファイル**: `services/user-service/src/auth/dto/register.dto.ts`

```typescript
export class RegisterDto {
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'パスワードは8文字以上で入力してください' })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'パスワードは英字と数字を含める必要があります',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
```

**設計ポイント**:
- メールアドレス: `@IsEmail()`で形式チェック
- パスワード: 長さ + 正規表現で複合チェック
- 表示名: `@IsOptional()`で任意フィールド化

### 9.2 タスク作成DTO（CreateTaskDto）

**ファイル**: `services/task-service/src/task/dto/create-task.dto.ts`

```typescript
export class CreateTaskDto {
  @IsNotEmpty({ message: 'title is required' })
  @IsString({ message: 'title must be a string' })
  @MaxLength(200, { message: 'title must not exceed 200 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(2000, { message: 'description must not exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsISO8601({}, { message: 'dueDate must be a valid ISO8601 date string' })
  dueDate?: string;

  @IsNotEmpty({ message: 'projectId is required' })
  @IsNumber({}, { message: 'projectId must be a number' })
  projectId: number;

  @IsOptional()
  @IsArray({ message: 'tagIds must be an array' })
  @IsNumber({}, { each: true, message: 'each tagId must be a number' })
  tagIds?: number[];
}
```

**設計ポイント**:
- Enum: `@IsEnum()`でステータス・優先度を制限
- 日付: ISO8601形式の文字列として受け取り
- 配列: `@IsArray()` + `each: true`で各要素も検証

### 9.3 クエリDTO（TaskQueryDto）

**ファイル**: `services/task-service/src/task/dto/task-query.dto.ts`

```typescript
export class TaskQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)    // クエリパラメータの型変換
  @IsInt({ message: 'projectId must be an integer' })
  @Min(1, { message: 'projectId must be at least 1' })
  projectId?: number;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: TaskStatus;
}
```

**設計ポイント**:
- 継承: `PaginationQueryDto`を拡張してページネーションを共通化
- 型変換: `@Type(() => Number)`でクエリパラメータを数値に変換
- 全て任意: クエリパラメータは基本的に`@IsOptional()`

### 9.4 パスワード変更DTO（ChangePasswordDto）

**ファイル**: `services/user-service/src/user/dto/change-password.dto.ts`

```typescript
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: '新しいパスワードは8文字以上で入力してください' })
  @MaxLength(100)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: '新しいパスワードは英字と数字を含める必要があります',
  })
  newPassword: string;
}
```

**設計ポイント**:
- 現在のパスワード: 基本的な型チェックのみ（正しさはService層で検証）
- 新しいパスワード: RegisterDtoと同じルールを適用

---

## ファイル参照ガイド

| 概念 | ファイル |
|-----|---------|
| 認証DTO（登録） | `services/user-service/src/auth/dto/register.dto.ts` |
| 認証DTO（ログイン） | `services/user-service/src/auth/dto/login.dto.ts` |
| タスク作成DTO | `services/task-service/src/task/dto/create-task.dto.ts` |
| タスククエリDTO | `services/task-service/src/task/dto/task-query.dto.ts` |
| ページネーションDTO | `services/task-service/src/common/dto/pagination.dto.ts` |
| パスワード変更DTO | `services/user-service/src/user/dto/change-password.dto.ts` |

---

## 関連ドキュメント

- [nestjs-validation-pipe.md](./nestjs-validation-pipe.md) - ValidationPipeの基本と動作フロー
- [nestjs-controller.md](./nestjs-controller.md) - Controllerでの@Bodyデコレータ使用
- [docs/design/task-service-api.md](../design/task-service-api.md) - API設計（リクエスト/レスポンス仕様）
