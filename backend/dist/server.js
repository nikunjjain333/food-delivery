"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sweetsRoutes_1 = __importDefault(require("./routes/sweetsRoutes"));
const ordersRoutes_1 = __importDefault(require("./routes/ordersRoutes"));
const configRoutes_1 = __importDefault(require("./routes/configRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/sweets", sweetsRoutes_1.default);
app.use("/api/orders", ordersRoutes_1.default);
app.use("/api/merchant-configs", configRoutes_1.default);
// Root health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "Rohit Sweets Backend" });
});
// Error Handling Middleware
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`🚀 Backend running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map