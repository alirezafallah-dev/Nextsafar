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
var AuditProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
let AuditProcessor = AuditProcessor_1 = class AuditProcessor extends bullmq_1.WorkerHost {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`🔄 Processing audit log job ${job.id}`);
        const data = job.data;
        await this.prisma.adminActivityLog.create({ data });
    }
};
exports.AuditProcessor = AuditProcessor;
exports.AuditProcessor = AuditProcessor = AuditProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('audit'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditProcessor);
//# sourceMappingURL=audit.processor.js.map