import { Router } from "express";
import { CustomersController } from "./customer.controller.js";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  QueryCustomerSchema,
} from "./customer.dtos.js";
import {
  validateBody,
  validateQuery,
} from "../../middlewares/validation/validate.middleware.js";

// CUSTOMER ROUTES

const customersRoutes = Router();

// Listagem com filtros opcionais via query params
customersRoutes.get(
  "/",
  validateQuery(QueryCustomerSchema),
  CustomersController.findAll
);

customersRoutes.get("/:id", CustomersController.findById);

// validateBody garante que o body está válido antes de chegar no controller
customersRoutes.post(
  "/",
  validateBody(CreateCustomerSchema),
  CustomersController.create
);

// PUT — atualização completa
customersRoutes.put(
  "/:id",
  validateBody(UpdateCustomerSchema),
  CustomersController.update
);

// PATCH — atualização parcial
customersRoutes.patch(
  "/:id",
  validateBody(UpdateCustomerSchema),
  CustomersController.update
);

// DELETE — soft delete
customersRoutes.delete("/:id", CustomersController.softDelete);

export default customersRoutes;
