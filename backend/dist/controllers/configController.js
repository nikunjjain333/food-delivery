"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = exports.getConfigs = void 0;
const db_1 = require("../config/db");
const ApiResponse_1 = require("../utils/ApiResponse");
const getConfigs = async (req, res) => {
    const configs = await db_1.prisma.merchantConfig.findMany();
    return ApiResponse_1.ApiResponse.success(res, configs);
};
exports.getConfigs = getConfigs;
const updateConfig = async (req, res) => {
    const key = req.params.key;
    const { value, description } = req.body;
    const config = await db_1.prisma.merchantConfig.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description }
    });
    return ApiResponse_1.ApiResponse.success(res, config, 'Merchant config updated');
};
exports.updateConfig = updateConfig;
//# sourceMappingURL=configController.js.map