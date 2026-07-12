"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Placeholder route
router.get('/health', (req, res) => {
    res.json({ status: 'ok', module: 'trip-ops' });
});
exports.default = router;
//# sourceMappingURL=routes.js.map