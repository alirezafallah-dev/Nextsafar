"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordpressSyncController = void 0;
const common_1 = require("@nestjs/common");
const wordpress_sync_service_1 = require("./wordpress-sync.service");
const wp_webhook_dto_1 = require("./dto/wp-webhook.dto");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const config_1 = require("@nestjs/config");
let WordpressSyncController = class WordpressSyncController {
    constructor(syncService, configService) {
        this.syncService = syncService;
        this.configService = configService;
    }
    async handleWebhook(dto, secret) {
        const expectedSecret = this.configService.get('WP_WEBHOOK_SECRET');
        if (expectedSecret && secret !== expectedSecret) {
            throw new common_1.UnauthorizedException('Invalid webhook secret');
        }
        return this.syncService.processWebhook(dto);
    }
};
exports.WordpressSyncController = WordpressSyncController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(wp_webhook_dto_1.wpWebhookSchema))),
    __param(1, (0, common_1.Headers)('x-webhook-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WordpressSyncController.prototype, "handleWebhook", null);
exports.WordpressSyncController = WordpressSyncController = __decorate([
    (0, common_1.Controller)('internal/wordpress'),
    __metadata("design:paramtypes", [wordpress_sync_service_1.WordpressSyncService,
        config_1.ConfigService])
], WordpressSyncController);
//# sourceMappingURL=wordpress-sync.controller.js.map