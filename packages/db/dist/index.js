"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationChannel = exports.VisaCaseStatus = exports.ReconciliationStatus = exports.TransactionType = exports.PaymentStatus = exports.OrderStatus = exports.TourStatus = exports.HotelPublishStatus = void 0;
// Export all Prisma Client types
__exportStar(require("@prisma/client"), exports);
// Export specific enums for use in other packages
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "HotelPublishStatus", { enumerable: true, get: function () { return client_1.HotelPublishStatus; } });
Object.defineProperty(exports, "TourStatus", { enumerable: true, get: function () { return client_1.TourStatus; } });
Object.defineProperty(exports, "OrderStatus", { enumerable: true, get: function () { return client_1.OrderStatus; } });
Object.defineProperty(exports, "PaymentStatus", { enumerable: true, get: function () { return client_1.PaymentStatus; } });
Object.defineProperty(exports, "TransactionType", { enumerable: true, get: function () { return client_1.TransactionType; } });
Object.defineProperty(exports, "ReconciliationStatus", { enumerable: true, get: function () { return client_1.ReconciliationStatus; } });
Object.defineProperty(exports, "VisaCaseStatus", { enumerable: true, get: function () { return client_1.VisaCaseStatus; } });
Object.defineProperty(exports, "NotificationChannel", { enumerable: true, get: function () { return client_1.NotificationChannel; } });
Object.defineProperty(exports, "NotificationStatus", { enumerable: true, get: function () { return client_1.NotificationStatus; } });
//# sourceMappingURL=index.js.map