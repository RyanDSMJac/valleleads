import { Router } from "express";
import { UsersController } from "./users.controller.js";
import {
  validateBody,
  validateQuery,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  queryUserSchema,
} from "./users.dto.js";

const router = Router();
const usersController = new UsersController();

// GET /users — listagem com filtros e paginação
router.get(
  "/",
  validateQuery(queryUserSchema),
  usersController.findAll.bind(usersController)
);

// GET /users/:id
router.get("/:id", usersController.findById.bind(usersController));

// POST /users — criação com validação de body
router.post(
  "/",
  validateBody(createUserSchema),
  usersController.create.bind(usersController)
);

// PUT /users/:id — atualização completa
router.put(
  "/:id",
  validateBody(updateUserSchema),
  usersController.update.bind(usersController)
);

// PATCH /users/:id — atualização parcial (ex: toggle is_active)
router.patch(
  "/:id",
  validateBody(updateUserSchema),
  usersController.update.bind(usersController)
);

// DELETE /users/:id — soft delete
router.delete("/:id", usersController.softDelete.bind(usersController));

export default router;
