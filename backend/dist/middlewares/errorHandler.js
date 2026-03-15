"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    const errors = err.errors || null;
    return ApiResponse_1.ApiResponse.error(res, message, statusCode, errors);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map