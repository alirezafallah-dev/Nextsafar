import { Controller, Post, Body, Headers, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { WordpressSyncService } from './wordpress-sync.service';
import { WpWebhookDto, wpWebhookSchema } from './dto/wp-webhook.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ConfigService } from '@nestjs/config';

@Controller('internal/wordpress')
export class WordpressSyncController {
  constructor(
    private readonly syncService: WordpressSyncService,
    private configService: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body(new ZodValidationPipe(wpWebhookSchema)) dto: WpWebhookDto,
    @Headers('x-webhook-secret') secret: string,
  ) {
    const expectedSecret = this.configService.get<string>('WP_WEBHOOK_SECRET');
    if (expectedSecret && secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return this.syncService.processWebhook(dto);
  }
}
