import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ordersController.d.ts.map