import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Global means we don't need to import PrismaModule in every other module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
