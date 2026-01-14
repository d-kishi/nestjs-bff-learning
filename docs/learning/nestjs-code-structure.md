# NestJSコード構造と起動フロー解説

NestJSアプリケーションの構造を理解するための学習資料です。
本プロジェクトの`task-service`を例に解説します。

## 目次

1. [エントリポイント（main.ts）](#1-エントリポイントmaints)
2. [モジュールシステム](#2-モジュールシステム)
3. [リクエスト処理の流れ](#3-リクエスト処理の流れ)
4. [DIコンテナの仕組み](#4-diコンテナの仕組み)
5. [全体フロー](#5-全体フロー)

---

## 1. エントリポイント（main.ts）

### ファイル構成

```
services/task-service/src/
├── main.ts          ← エントリポイント（ここから起動）
├── app.module.ts    ← ルートモジュール
└── ...
```

### 起動フロー

```mermaid
sequenceDiagram
    participant CLI as npm run start:task
    participant Main as main.ts
    participant Factory as NestFactory
    participant App as NestApplication

    CLI->>Main: 実行開始
    Main->>Factory: create(AppModule)
    Factory->>Factory: モジュール解析
    Factory->>Factory: DIコンテナ構築
    Factory-->>Main: app インスタンス
    Main->>App: useGlobalPipes(ValidationPipe)
    Main->>App: useGlobalFilters(HttpExceptionFilter)
    Main->>App: useGlobalInterceptors(ResponseInterceptor)
    Main->>App: listen(3001)
    App-->>Main: HTTPサーバ起動完了
```

### コード解説

```typescript
// services/task-service/src/main.ts
async function bootstrap() {
  // ステップ1: アプリケーションインスタンス作成
  const app = await NestFactory.create(AppModule);

  // ステップ2: グローバル設定
  app.useGlobalPipes(new ValidationPipe({...}));    // 入力検証
  app.useGlobalFilters(new HttpExceptionFilter());  // エラー処理
  app.useGlobalInterceptors(new ResponseInterceptor()); // レスポンス加工

  // ステップ3: HTTPサーバ起動
  await app.listen(3001);
}
bootstrap();
```

| ステップ | 処理 | 目的 |
|---------|------|------|
| 1 | `NestFactory.create()` | DIコンテナを構築し、アプリインスタンスを作成 |
| 2 | `useGlobal*()` | 全リクエストに適用するミドルウェアを設定 |
| 3 | `listen()` | 指定ポートでHTTPリクエスト待機を開始 |

---

## 2. モジュールシステム

### @Module デコレータの構造

```typescript
@Module({
  imports: [...],      // 他のモジュールをインポート
  controllers: [...],  // HTTPリクエストを処理するコントローラ
  providers: [...],    // サービス、リポジトリなどのDI対象
  exports: [...],      // 他のモジュールに公開するプロバイダ
})
export class SomeModule {}
```

### モジュール構成図

```mermaid
graph TB
    subgraph AppModule["AppModule（ルートモジュール）"]
        ConfigModule["ConfigModule<br/>環境変数管理"]
        TypeOrmModule["TypeOrmModule<br/>DB接続"]
    end

    subgraph DomainModules["ドメインモジュール"]
        ProjectModule["ProjectModule"]
        TaskModule["TaskModule"]
        CommentModule["CommentModule"]
        TagModule["TagModule"]
    end

    AppModule --> ConfigModule
    AppModule --> TypeOrmModule
    AppModule --> ProjectModule
    AppModule --> TaskModule
    AppModule --> CommentModule
    AppModule --> TagModule
```

### ドメインモジュールの内部構造

```mermaid
graph LR
    subgraph ProjectModule
        PC["ProjectController"]
        PS["ProjectService"]
        PR["ProjectRepository"]
        PE["Project Entity"]
    end

    PC --> PS
    PS --> PR
    PR --> PE
```

### コード例（ProjectModule）

```typescript
// services/task-service/src/project/project.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Project])],  // エンティティ登録
  controllers: [ProjectController],                 // HTTPハンドラ
  providers: [ProjectService, ProjectRepository],   // ビジネスロジック・DB操作
  exports: [ProjectService, ProjectRepository],     // 他モジュールへ公開
})
export class ProjectModule {}
```

---

## 3. リクエスト処理の流れ

### 3層アーキテクチャ

```mermaid
graph TB
    subgraph Client["クライアント"]
        HTTP["HTTP Request<br/>POST /projects"]
    end

    subgraph NestJS["NestJSアプリケーション"]
        Router["ルーター<br/>@Controller + @Post マッチング"]
        Pipe["ValidationPipe<br/>入力検証・型変換"]
        Controller["Controller<br/>HTTP処理（薄く）"]
        Service["Service<br/>ビジネスロジック"]
        Repository["Repository<br/>DB操作"]
        Interceptor["ResponseInterceptor<br/>レスポンス加工"]
    end

    subgraph DB["Oracle Database"]
        Table["PROJECT テーブル"]
    end

    HTTP --> Router
    Router --> Pipe
    Pipe --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Table
    Table --> Repository
    Repository --> Service
    Service --> Controller
    Controller --> Interceptor
    Interceptor --> HTTP
```

### 処理フロー詳細

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant P as ValidationPipe
    participant Ctrl as ProjectController
    participant Svc as ProjectService
    participant Repo as ProjectRepository
    participant DB as Oracle DB
    participant I as ResponseInterceptor

    C->>R: POST /projects {name: "My Project"}
    R->>R: @Controller('projects') + @Post() にマッチ
    R->>P: リクエストボディ
    P->>P: CreateProjectDto に変換・検証
    P->>Ctrl: 検証済みDTO
    Ctrl->>Svc: create(dto, userId)
    Svc->>Repo: create(dto, ownerId)
    Repo->>DB: INSERT INTO PROJECT
    DB-->>Repo: 作成されたレコード
    Repo-->>Svc: Project エンティティ
    Svc-->>Ctrl: Project エンティティ
    Ctrl-->>I: Project エンティティ
    I->>I: {data: {...}, meta: {timestamp}} 形式に変換
    I-->>C: 統一レスポンス
```

### 各層の責務

| 層 | クラス | 責務 |
|---|--------|------|
| Controller | `ProjectController` | HTTPリクエスト/レスポンス処理（薄く保つ） |
| Service | `ProjectService` | ビジネスロジック（存在確認、権限チェック等） |
| Repository | `ProjectRepository` | データアクセス（TypeORM操作） |

### コード例

```typescript
// Controller: HTTPリクエストの受付
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.projectService.create(dto, userId);
  }
}

// Service: ビジネスロジック
@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async update(id: number, dto: UpdateProjectDto, userId: number): Promise<Project> {
    // 存在確認
    const project = await this.projectRepository.findById(id);
    if (!project) throw new ProjectNotFoundException(id);

    // 権限チェック
    if (project.ownerId !== userId) {
      throw new ProjectForbiddenException('Only the owner can update');
    }

    return this.projectRepository.update(id, dto);
  }
}

// Repository: DB操作
@Injectable()
export class ProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
  ) {}

  async findById(id: number): Promise<Project | null> {
    return this.repository.findOne({ where: { id } });
  }
}
```

---

## 4. DIコンテナの仕組み

### DI（Dependency Injection）とは

クラスが必要とする依存オブジェクトを、**外部から注入**する仕組みです。

### DIなし vs DIあり

```mermaid
graph TB
    subgraph Without["DIなし（密結合）"]
        W_Ctrl["Controller"]
        W_Svc["new Service()"]
        W_Repo["new Repository()"]
        W_Ctrl --> W_Svc
        W_Svc --> W_Repo
    end

    subgraph With["DIあり（疎結合）"]
        D_Container["DIコンテナ"]
        D_Ctrl["Controller"]
        D_Svc["Service"]
        D_Repo["Repository"]
        D_Container -.->|注入| D_Ctrl
        D_Container -.->|注入| D_Svc
        D_Container -.->|注入| D_Repo
        D_Ctrl --> D_Svc
        D_Svc --> D_Repo
    end
```

### DIコンテナの動作原理

```mermaid
sequenceDiagram
    participant M as @Module()
    participant C as DIコンテナ
    participant PR as ProjectRepository
    participant PS as ProjectService
    participant PC as ProjectController

    M->>C: providers: [ProjectService, ProjectRepository]
    M->>C: controllers: [ProjectController]
    C->>C: constructorの依存を解析
    Note over C: Repository → 依存なし<br/>Service → Repository必要<br/>Controller → Service必要
    C->>PR: インスタンス作成（依存なし）
    C->>PS: インスタンス作成（Repositoryを注入）
    C->>PC: インスタンス作成（Serviceを注入）
    Note over C: 全インスタンスをシングルトンとしてキャッシュ
```

### 依存グラフ

```mermaid
graph BT
    subgraph DIContainer["DIコンテナ"]
        PR["ProjectRepository<br/>（依存なし）"]
        PS["ProjectService<br/>（Repository必要）"]
        PC["ProjectController<br/>（Service必要）"]
    end

    PR --> PS
    PS --> PC

    style PR fill:#90EE90
    style PS fill:#87CEEB
    style PC fill:#DDA0DD
```

### @Injectable() の意味

```typescript
@Injectable()  // このクラスはDIコンテナで管理される
export class ProjectService {
  // constructorの引数はDIコンテナが自動的に解決・注入
  constructor(private readonly projectRepository: ProjectRepository) {}
}
```

---

## 5. 全体フロー

### サーバ起動からリクエスト処理まで

```mermaid
flowchart TB
    subgraph Startup["起動フェーズ"]
        A[npm run start:task] --> B[main.ts 実行]
        B --> C[NestFactory.create]
        C --> D[AppModule 解析]
        D --> E[DIコンテナ構築]
        E --> F[グローバル設定適用]
        F --> G[app.listen 3001]
    end

    subgraph Runtime["リクエスト処理フェーズ"]
        H[HTTP Request] --> I[ルーティング]
        I --> J[ValidationPipe]
        J --> K[Controller]
        K --> L[Service]
        L --> M[Repository]
        M --> N[(Oracle DB)]
        N --> M
        M --> L
        L --> K
        K --> O[ResponseInterceptor]
        O --> P[HTTP Response]
    end

    G --> H

    style A fill:#f9f,stroke:#333
    style P fill:#9f9,stroke:#333
```

### ファイル参照ガイド

| 概念 | ファイル | 行番号 |
|-----|---------|--------|
| エントリポイント | `services/task-service/src/main.ts` | 13-45 |
| ルートモジュール | `services/task-service/src/app.module.ts` | 18-57 |
| ドメインモジュール | `services/task-service/src/project/project.module.ts` | 14-20 |
| Controller | `services/task-service/src/project/project.controller.ts` | 33-127 |
| Service | `services/task-service/src/project/project.service.ts` | 22-129 |
| Repository | `services/task-service/src/project/project.repository.ts` | 36-127 |

---

## 学習のポイント

1. **main.ts から読み始める** - 全ての起点はここ
2. **@Module() の imports を追う** - モジュール間の依存関係がわかる
3. **Constructor を見る** - そのクラスが何に依存しているかがわかる
4. **F12（定義へ移動）を活用** - コードを追跡して理解を深める

## 関連ドキュメント

- [docs/design/task-service-api.md](../design/task-service-api.md) - task-service API設計
- [docs/design/task-service-entities.md](../design/task-service-entities.md) - エンティティ設計
