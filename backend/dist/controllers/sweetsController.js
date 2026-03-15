"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSweet = exports.updateSweet = exports.createSweet = exports.getSweets = void 0;
const db_1 = require("../config/db");
const ApiResponse_1 = require("../utils/ApiResponse");
const getSweets = async (req, res) => {
    const { all } = req.query;
    const condition = all === 'true' ? {} : { isAvailable: true };
    const sweets = await db_1.prisma.sweet.findMany({ where: condition });
    return ApiResponse_1.ApiResponse.success(res, sweets);
};
exports.getSweets = getSweets;
const createSweet = async (req, res) => {
    const { name, description, price, imageUrl, stock, isAvailable } = req.body;
    const sweet = await db_1.prisma.sweet.create({
        data: { name, description, price, imageUrl, stock, isAvailable }
    });
    return ApiResponse_1.ApiResponse.success(res, sweet, 'Sweet added to inventory', 201);
};
exports.createSweet = createSweet;
const updateSweet = async (req, res) => {
    const id = req.params.id;
    const { name, description, price, imageUrl, stock, isAvailable } = req.body;
    const sweet = await db_1.prisma.sweet.update({
        where: { id },
        data: { name, description, price, imageUrl, stock, isAvailable }
    });
    return ApiResponse_1.ApiResponse.success(res, sweet, 'Sweet updated');
};
exports.updateSweet = updateSweet;
const deleteSweet = async (req, res) => {
    const id = req.params.id;
    await db_1.prisma.sweet.delete({ where: { id } });
    return ApiResponse_1.ApiResponse.success(res, null, 'Sweet removed from inventory');
};
exports.deleteSweet = deleteSweet;
//# sourceMappingURL=sweetsController.js.map