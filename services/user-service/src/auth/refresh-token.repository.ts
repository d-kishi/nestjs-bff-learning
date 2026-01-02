/**
 * RefreshToken リポジトリ
 *
 * リフレッシュトークンのDB操作を抽象化する。
 * トークンの発行、検証、無効化を管理。
 *
 * Why: TypeORMのRepositoryを直接使わずラップする理由
 * - テスト時のモック化が容易
 * - ビジネスロジックとDB操作の分離
 * - クエリの再利用性向上
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  /**
   * リフレッシュトークンを作成
   *
   * @param userId ユーザーID
   * @param token トークン文字列
   * @param expiresAt 有効期限
   */
  async create(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.repository.create({
      userId,
      token,
      expiresAt,
    });
    return this.repository.save(refreshToken);
  }

  /**
   * トークン文字列でリフレッシュトークンを取得
   *
   * @param token トークン文字列
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { token },
    });
  }

  /**
   * 有効なトークンかどうかを検証
   *
   * 以下の条件を全て満たす場合に有効:
   * - トークンが存在する
   * - 無効化されていない (isRevoked = false)
   * - 有効期限内
   *
   * @param token トークン文字列
   */
  async findValidToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.repository.findOne({
      where: {
        token,
        isRevoked: false,
      },
    });

    if (!refreshToken) {
      return null;
    }

    // 有効期限チェック
    if (refreshToken.expiresAt < new Date()) {
      return null;
    }

    return refreshToken;
  }

  /**
   * 単一のトークンを無効化
   *
   * Refresh Token Rotationで古いトークンを無効化する際に使用。
   *
   * @param id トークンID
   */
  async revoke(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { isRevoked: true });
    return (result.affected ?? 0) > 0;
  }

  /**
   * トークン文字列で無効化
   *
   * ログアウト時に使用。
   *
   * @param token トークン文字列
   */
  async revokeByToken(token: string): Promise<boolean> {
    const result = await this.repository.update({ token }, { isRevoked: true });
    return (result.affected ?? 0) > 0;
  }

  /**
   * ユーザーの全トークンを無効化
   *
   * アカウント無効化時やセキュリティ対応時に使用。
   * 全デバイスからのログアウト効果。
   *
   * @param userId ユーザーID
   */
  async revokeAllByUserId(userId: number): Promise<number> {
    const result = await this.repository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return result.affected ?? 0;
  }

  /**
   * 期限切れトークンを削除
   *
   * 定期的なクリーンアップに使用。
   * 無効化済みトークンも含めて削除。
   */
  async deleteExpired(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }
}
