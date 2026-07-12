"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const io_1 = require("./shared/socket/io");
const pino_1 = require("./shared/logger/pino");
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
exports.server = server;
// Initialize Socket.io
(0, io_1.initSocket)(server);
server.listen(PORT, () => {
    pino_1.logger.info(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map