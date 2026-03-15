"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getCustomerOrders = exports.createOrder = void 0;
const db_1 = require("../config/db");
const ApiResponse_1 = require("../utils/ApiResponse");
const createOrder = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return ApiResponse_1.ApiResponse.error(res, 'Unauthorized', 401);
    }
    const { items, paymentMethod } = req.body;
    if (!items || items.length === 0) {
        return ApiResponse_1.ApiResponse.error(res, 'Cart is empty', 400);
    }
    // Server-side calculation of total to avoid tampering
    let calculatedTotalAmount = 0;
    const orderItemsData = [];
    for (const item of items) {
        const sweet = await db_1.prisma.sweet.findUnique({ where: { id: item.id } });
        if (!sweet)
            return ApiResponse_1.ApiResponse.error(res, `Sweet ${item.id} not found`, 400);
        const itemTotal = sweet.price * item.quantity;
        calculatedTotalAmount += itemTotal;
        orderItemsData.push({
            sweetId: sweet.id,
            quantity: item.quantity,
            price: sweet.price,
        });
    }
    // Add Delivery fee logic
    calculatedTotalAmount += 50;
    const order = await db_1.prisma.order.create({
        data: {
            userId,
            totalAmount: calculatedTotalAmount,
            paymentMethod,
            items: {
                create: orderItemsData
            }
        },
        include: { items: true }
    });
    return ApiResponse_1.ApiResponse.success(res, order, 'Order placed successfully', 201);
};
exports.createOrder = createOrder;
const getCustomerOrders = async (req, res) => {
    const userId = req.user?.userId;
    const orders = await db_1.prisma.order.findMany({
        where: { userId },
        include: { items: { include: { sweet: true } } },
        orderBy: { createdAt: 'desc' }
    });
    return ApiResponse_1.ApiResponse.success(res, orders);
};
exports.getCustomerOrders = getCustomerOrders;
// Merchant specific endpoints
const getAllOrders = async (req, res) => {
    const orders = await db_1.prisma.order.findMany({
        include: {
            user: { select: { name: true, email: true } },
            items: { include: { sweet: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return ApiResponse_1.ApiResponse.success(res, orders);
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const order = await db_1.prisma.order.update({
        where: { id },
        data: { status }
    });
    return ApiResponse_1.ApiResponse.success(res, order, 'Order status updated');
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=ordersController.js.map