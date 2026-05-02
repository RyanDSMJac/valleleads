import type { Request, Response, NextFunction } from "express";
import { UsersService } from "./users.service.js";
import type { QueryUserDTO } from "./users.dto.js";

export class UsersController {
  private usersService = new UsersService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      // req.query já foi validado e transformado pelo validateQuery no router
      const filters = req.query as unknown as QueryUserDTO;
      const result = await this.usersService.findAll(filters);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const user = await this.usersService.findById(id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.usersService.create(req.body);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const user = await this.usersService.update(id, req.body);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await this.usersService.softDelete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
