"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSweet = exports.updateSweet = exports.createSweet = exports.getSweets = void 0;
const express_1 = require("express");
const db_1 = require("../config/db");
const getSweets = async (req, res) => {
    try {
        // Only return available sweets for customers, but merchant can fetch all via query param if needed
        const { all } = req.query;
        const condition = all === 'true' ? {} : { isAvailable: true };
        const sweets = await db_1.prisma.sweet.findMany({ where: condition });
        res.json(sweets);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching sweets', error });
    }
};
exports.getSweets = getSweets;
const createSweet = async (req, res) => {
    try {
        const { name, description, price, imageUrl, stock, isAvailable } = req.body;
        const sweet = await db_1.prisma.sweet.create({
            data: { name, description, price, imageUrl, stock, isAvailable }
        });
        res.status(201).json({ message: 'Sweet added to inventory', sweet });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating sweet', error });
    }
};
exports.createSweet = createSweet;
const updateSweet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, imageUrl, stock, isAvailable } = req.body;
        const sweet = await db_1.prisma.sweet.update({
            where: { id },
            data: { name, description, price, imageUrl, stock, isAvailable }
        });
        res.json({ message: 'Sweet updated', sweet });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating sweet', error });
    }
};
exports.updateSweet = updateSweet;
const deleteSweet = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.sweet.delete({ where: { id } });
        res.json({ message: 'Sweet removed from inventory' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting sweet', error });
    }
};
exports.deleteSweet = deleteSweet;
//# sourceMappingURL=sweetsController.js.map