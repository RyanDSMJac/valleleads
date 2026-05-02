import { Request, Response, NextFunction } from "express";
import { CustomersService } from "./customer.service.js";
import {
  QueryCustomerSchema,
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from "./customer.dtos.js";

// CUSTOMERS CONTROLLER

type ParamsWithId = { id: string };

export const CustomersController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = QueryCustomerSchema.parse(req.query);
      const customers = await CustomersService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomersService.findById(id);

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateCustomerSchema.parse(req.body);
      const customer = await CustomersService.create(data);

      return res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = UpdateCustomerSchema.parse(req.body);
      const customer = await CustomersService.update(id, data);

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  async softDelete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CustomersService.softDelete(id);

      return res.status(200).json({
        success: true,
        message: "Cliente desativado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};
