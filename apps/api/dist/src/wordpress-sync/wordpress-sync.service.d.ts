import { PrismaService } from '../prisma/prisma.service';
import { WpWebhookDto } from './dto/wp-webhook.dto';
export declare class WordpressSyncService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processWebhook(dto: WpWebhookDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private handleCreateOrUpdate;
    private syncHotel;
    private syncVisaType;
    private handleDeleteOrTrash;
    private logSync;
}
