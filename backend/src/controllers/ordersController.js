"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getCustomerOrders = exports.createOrder = void 0;
const express_1 = require("express");
const db_1 = require("../config/db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { items, paymentMethod } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        // Server-side calculation of total to avoid tampering
        let calculatedTotalAmount = 0;
        const orderItemsData = [];
        for (const item of items) {
            const sweet = await db_1.prisma.sweet.findUnique({ where: { id: item.id } });
            if (!sweet)
                return res.status(400).json({ message: `Sweet ${item.id} not found` });
            const itemTotal = sweet.price * item.quantity;
            calculatedTotalAmount += itemTotal;
            orderItemsData.push({
                sweetId: sweet.id,
                quantity: item.quantity,
                price: sweet.price,
            });
        }
        // Add Delivery fee logic if needed (hardcoded to 50 for now)
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
        res.status(201).json({ message: 'Order placed successfully', order });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};
exports.createOrder = createOrder;
const getCustomerOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const orders = await db_1.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { sweet: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};
exports.getCustomerOrders = getCustomerOrders;
// Merchant specific endpoints
const getAllOrders = async (req, res) => {
    try {
        const orders = await db_1.prisma.order.findMany({
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { sweet: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching all orders', error });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await db_1.prisma.order.update({
            where: { id },
            data: { status }
        });
        res.json({ message: 'Order status updated', order });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=ordersController.js.map