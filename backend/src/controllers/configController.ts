import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiResponse } from '../utils/ApiResponse';

export const getConfigs = async (req: Request, res: Response) => {
  const configs = await prisma.merchantConfig.findMany();
  return ApiResponse.success(res, configs);
};

export const updateConfig = async (req: Request, res: Response) => {
  const key = req.params.key as string;
  const { value, description } = req.body;

  const config = await prisma.merchantConfig.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description }
  });

  return ApiResponse.success(res, config, 'Merchant config updated');
};
