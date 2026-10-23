import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@nextsafar/db';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
