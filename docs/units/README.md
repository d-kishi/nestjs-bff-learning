# docs/units/

作業単位（学習フェーズ）を格納するディレクトリです。

## ファイル命名規則

```
unit[番号]_[フェーズ名].md

例:
unit1_task-service.md
unit2_user-service.md
unit3_bff.md
unit4_angular.md
```

## 学習フェーズ

| Unit | フェーズ | 内容 |
|------|---------|------|
| unit1 | Phase 1 | NestJS基礎 + Jest（task-service） |
| unit2 | Phase 2 | user-service + 認証基盤 |
| unit3 | Phase 3 | BFF実装（api-gateway） |
| unit4 | Phase 4 | Angular統合 |

## テンプレート

```markdown
# Unit [番号]: [フェーズ名]

## 概要
[このフェーズで達成すること]

## 学習目標
- [目標1]
- [目標2]
- [目標3]

## 対象ユーザーストーリー
- US001: [ストーリー名]
- US002: [ストーリー名]

## 実装順序
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]

## 完了条件
- [ ] [条件1]
- [ ] [条件2]
- [ ] [条件3]

## 参考リンク
- [NestJS公式ドキュメント](https://docs.nestjs.com/)
```

## 用途

- 各フェーズの作業計画を明確化
- 関連するユーザーストーリーを紐付け
- 完了条件のチェックリストとして活用
