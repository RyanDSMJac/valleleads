import { z } from "zod";

// Enum de roles alinhado com o restante do sistema
const roleEnum = z.enum(["ATTENDANT", "MANAGER", "GENERAL_MANAGER"]);

// Criar usuário
export const createUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: roleEnum,
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
});

// Atualizar usuário (todos opcionais — suporta PATCH parcial)
export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: roleEnum.optional(),
  team_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
});

// Query params para listagem com filtros e paginação
// Os transforms convertem string → tipo correto (query params chegam como string)
export const queryUserSchema = z.object({
  role: roleEnum.optional(),
  team_id: z.string().uuid().optional(),
  store: z.string().optional(),
  is_active: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  page: z
    .string()
    .transform(Number)
    .optional(),
  per_page: z
    .string()
    .transform(Number)
    .optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type QueryUserDTO = z.infer<typeof queryUserSchema>;
