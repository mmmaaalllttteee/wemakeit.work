import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
