"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const express_1 = require("express");
const pino_1 = require("../logger/pino");
function errorHandler(err, req, res, next) {
    pino_1.logger.error({ err, path: req.path, method: req.method }, 'Unhandled request error');
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
}
//# sourceMappingURL=errorHandler.js.map