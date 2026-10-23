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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LedgerService = class LedgerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordTransaction(params) {
        const transaction = await this.prisma.transaction.create({
            data: {
                type: params.type,
                amount: params.amount,
                userId: params.userId,
                orderId: params.orderId,
                paymentId: params.paymentId,
                reason: params.reason,
                reference: params.reference,
            },
        });
        return {
            success: true,
            data: transaction,
        };
    }
    async getUserTransactions(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: true,
                    payment: true,
                },
            }),
            this.prisma.transaction.count({ where: { userId } }),
        ]);
        return {
            success: true,
            data: transactions,
            meta: {
                page,
                per_page: limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getUserBalance(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
        });
        let balance = 0;
        transactions.forEach(tx => {
            if (tx.type === 'CREDIT' || tx.type === 'REFUND') {
                balance += tx.amount;
            }
            else if (tx.type === 'DEBIT') {
                balance -= tx.amount;
            }
        });
        return {
            success: true,
            data: {
                userId,
                balance,
                totalTransactions: transactions.length,
            },
        };
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map