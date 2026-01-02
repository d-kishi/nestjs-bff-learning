/**
 * Project モジュール
 *
 * プロジェクト関連のコンポーネントを束ねる。
 * AppModuleにインポートして使用する。
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
