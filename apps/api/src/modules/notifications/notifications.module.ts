import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferences } from './entities/notification-preferences.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreferences])],
  controllers: [NotificationPreferencesController],
  providers: [NotificationPreferencesService],
  exports: [NotificationPreferencesService],
})
export class NotificationsModule {}
