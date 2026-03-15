"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = exports.getConfigs = void 0;
const express_1 = require("express");
const db_1 = require("../config/db");
const getConfigs = async (req, res) => {
    try {
        const configs = await db_1.prisma.merchantConfig.findMany();
        res.json(configs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching configs', error });
    }
};
exports.getConfigs = getConfigs;
const updateConfig = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;
        const config = await db_1.prisma.merchantConfig.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description }
        });
        res.json({ message: 'Merchant config updated', config });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating config', error });
    }
};
exports.updateConfig = updateConfig;
//# sourceMappingURL=configController.js.map