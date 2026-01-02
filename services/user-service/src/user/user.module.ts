/**
 * User モジュール
 *
 * ユーザー管理機能を提供する。
 * プロフィール更新、パスワード変更、ロール割り当てなど。
 */
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { RoleModule } from '../role/role.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    RoleModule,
    // AuthModuleへの循環参照を解決
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
