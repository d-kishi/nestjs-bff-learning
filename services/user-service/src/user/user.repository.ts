/**
 * User リポジトリ
 *
 * ユーザーのDB操作を抽象化する。
 * User, UserProfile, Roleの関連を適切に処理。
 *
 * Why: TypeORMのRepositoryを直接使わずラップする理由
 * - テスト時のモック化が容易
 * - ビジネスロジックとDB操作の分離
 * - クエリの再利用性向上
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Role } from '../role/entities/role.entity';
import { calculatePagination } from '../common/dto';

/**
 * ユーザー作成データ
 */
export interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName: string;
}

/**
 * ユーザー検索条件
 */
export interface UserFindOptions {
  email?: string;
  isActive?: boolean;
  roleId?: number;
  page?: number;
  limit?: number;
}

/**
 * ユーザー検索結果
 */
export interface UserFindResult {
  data: User[];
  total: number;
}

/**
 * プロフィール更新データ
 */
export interface UpdateProfileData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  /**
   * ユーザーを作成（User + UserProfile同時作成）
   *
   * トランザクション内でUserとUserProfileを同時作成。
   * cascade: true設定により、Userの保存時にProfileも保存される。
   *
   * @param data 作成データ
   * @param memberRole デフォルトで付与するMEMBERロール
   */
  async create(data: CreateUserData, memberRole: Role): Promise<User> {
    // UserProfileを先に作成（Userに紐付けるため）
    const profile = this.profileRepository.create({
      displayName: data.displayName,
    });

    // Userを作成（profileをカスケードで保存）
    // Note: isActiveを明示的にtrueに設定。EntityのdefaultはDB側のデフォルト値であり、
    // TypeORMのcreate()はメモリ上でインスタンスを作成するだけなので、
    // 明示的に指定しないとundefinedになる可能性がある。
    const user = this.userRepository.create({
      email: data.email,
      password: data.passwordHash,
      isActive: true,
      profile,
      roles: [memberRole],
    });

    return this.userRepository.save(user);
  }

  /**
   * ユーザー一覧を取得
   *
   * @param options 検索条件
   */
  async findAll(options: UserFindOptions = {}): Promise<UserFindResult> {
    const { email, isActive, roleId, page = 1, limit = 20 } = options;
    const { skip, take } = calculatePagination(page, limit);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'role');

    // メールアドレス部分一致検索
    if (email !== undefined) {
      queryBuilder.andWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${email}%`,
      });
    }

    // アクティブ状態フィルタ
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // ロールIDフィルタ
    if (roleId !== undefined) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }

    // ソート: 作成日時の降順
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // ページネーション
    queryBuilder.skip(skip).take(take);

    // 実行
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * IDでユーザーを取得（profile, roles含む）
   *
   * @param id ユーザーID
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'roles'],
    });
  }

  /**
   * メールアドレスでユーザーを取得（ログイン用）
   *
   * パスワードを含むユーザー情報を取得。
   * ログイン認証に使用。
   *
   * @param email メールアドレス
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'roles'],
    });
  }

  /**
   * メールアドレスの存在チェック
   *
   * @param email メールアドレス
   * @param excludeUserId 除外するユーザーID（更新時の重複チェック用）
   */
  async existsByEmail(email: string, excludeUserId?: number): Promise<boolean> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeUserId !== undefined) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * ユーザー基本情報を更新
   *
   * @param id ユーザーID
   * @param email 新しいメールアドレス
   */
  async update(id: number, email: string): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    user.email = email;
    return this.userRepository.save(user);
  }

  /**
   * プロフィールを更新
   *
   * @param userId ユーザーID
   * @param data 更新データ
   */
  async updateProfile(
    userId: number,
    data: UpdateProfileData,
  ): Promise<UserProfile | null> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      return null;
    }

    // 更新対象のフィールドのみ適用
    if (data.displayName !== undefined) {
      profile.displayName = data.displayName;
    }
    if (data.firstName !== undefined) {
      profile.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      profile.lastName = data.lastName;
    }
    if (data.avatarUrl !== undefined) {
      profile.avatarUrl = data.avatarUrl;
    }
    if (data.bio !== undefined) {
      profile.bio = data.bio;
    }

    return this.profileRepository.save(profile);
  }

  /**
   * パスワードを更新
   *
   * @param id ユーザーID
   * @param passwordHash 新しいハッシュ化パスワード
   */
  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      password: passwordHash,
    });
    return (result.affected ?? 0) > 0;
  }

  /**
   * ロールを更新（置換方式）
   *
   * 既存のロールを全て削除し、新しいロールで置き換える。
   *
   * @param id ユーザーID
   * @param roles 新しいロール配列
   */
  async updateRoles(id: number, roles: Role[]): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      return null;
    }

    user.roles = roles;
    return this.userRepository.save(user);
  }

  /**
   * アカウント状態を更新
   *
   * @param id ユーザーID
   * @param isActive 新しいアクティブ状態
   */
  async updateStatus(id: number, isActive: boolean): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  /**
   * ユーザーを削除（物理削除）
   *
   * UserProfile, user_rolesは外部キー制約/カスケードで削除される。
   *
   * @param id ユーザーID
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
