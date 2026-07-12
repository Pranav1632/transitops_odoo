"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./shared/middleware/rateLimiter");
const compression_1 = require("./shared/middleware/compression");
const errorHandler_1 = require("./shared/middleware/errorHandler");
const routes_1 = __importDefault(require("./modules/fleet-identity/routes"));
const routes_2 = __importDefault(require("./modules/trip-ops/routes"));
const routes_3 = __importDefault(require("./modules/maintenance-finance/routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(compression_1.compressionMiddleware);
app.use(rateLimiter_1.rateLimiter);
// Mount routers
app.use('/api/v1/fleet', routes_1.default);
app.use('/api/v1/trips', routes_2.default);
app.use('/api/v1/finance', routes_3.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map