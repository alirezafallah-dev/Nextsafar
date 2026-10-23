import { WordpressSyncService } from './wordpress-sync.service';
import { WpWebhookDto } from './dto/wp-webhook.dto';
import { ConfigService } from '@nestjs/config';
export declare class WordpressSyncController {
    private readonly syncService;
    private configService;
    constructor(syncService: WordpressSyncService, configService: ConfigService);
    handleWebhook(dto: WpWebhookDto, secret: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
