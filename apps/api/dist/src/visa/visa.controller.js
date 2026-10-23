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
exports.VisaController = void 0;
const common_1 = require("@nestjs/common");
const visa_service_1 = require("./services/visa.service");
const documents_service_1 = require("../documents/services/documents.service");
const visa_dto_1 = require("./dto/visa.dto");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let VisaController = class VisaController {
    constructor(visaService, documentsService) {
        this.visaService = visaService;
        this.documentsService = documentsService;
    }
    getCountries() {
        return this.visaService.getCountries();
    }
    getVisaTypes() {
        return this.visaService.getVisaTypes();
    }
    createCase(user, dto) {
        return this.visaService.createCase(user.userId, dto);
    }
    getUserCases(user, page = '1', limit = '20') {
        return this.visaService.getUserCases(user.userId, parseInt(page), parseInt(limit));
    }
    getCaseById(user, id) {
        return this.visaService.getCaseById(user.userId, id);
    }
    createAppointment(id, dto) {
        return this.visaService.createAppointment(id, dto);
    }
    async getDocumentUrl(user, caseId, docId) {
        return this.documentsService.getSignedUrl(caseId, docId, user.userId);
    }
};
exports.VisaController = VisaController;
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisaController.prototype, "getCountries", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisaController.prototype, "getVisaTypes", null);
__decorate([
    (0, common_1.Post)('cases'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(visa_dto_1.createVisaCaseSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VisaController.prototype, "createCase", null);
__decorate([
    (0, common_1.Get)('cases'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], VisaController.prototype, "getUserCases", null);
__decorate([
    (0, common_1.Get)('cases/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisaController.prototype, "getCaseById", null);
__decorate([
    (0, common_1.Post)('cases/:id/appointments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(visa_dto_1.createAppointmentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VisaController.prototype, "createAppointment", null);
__decorate([
    (0, common_1.Get)('cases/:id/documents/:docId/url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('docId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VisaController.prototype, "getDocumentUrl", null);
exports.VisaController = VisaController = __decorate([
    (0, common_1.Controller)('visa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [visa_service_1.VisaService,
        documents_service_1.DocumentsService])
], VisaController);
//# sourceMappingURL=visa.controller.js.map