import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { WordpressSyncModule } from './wordpress-sync/wordpress-sync.module';
import { ToursModule } from './tours/tours.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { VisaModule } from './visa/visa.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    HotelsModule,
    WordpressSyncModule,
    ToursModule,
    OrdersModule,
    PaymentsModule,
    VisaModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
