import { prisma } from "../../config/prisma.js";
import type { QueryUserDTO, CreateUserDTO, UpdateUserDTO } from "./users.dto.js";

export class UsersRepository {

  async countAll(filters: QueryUserDTO): Promise<number> {
    const where = this.buildWhere(filters);
    return prisma.users.count({ where });
  }

  async findAll(filters: QueryUserDTO) {
    const { page = 1, per_page = 10 } = filters;
    const where = this.buildWhere(filters);

    return prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        user_teams: {
          include: {
            team: true,
          },
        },
      },
      skip: (page - 1) * per_page,
      take: per_page,
      orderBy: { created_at: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.users.findUnique({
      where: { id },
      include: {
        user_teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
      include: {
        user_teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.users.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.users.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.users.update({
      where: { id },
      data: { is_active: false },
    });
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private buildWhere(filters: QueryUserDTO) {
    const { role, team_id, is_active } = filters;

    return {
      ...(role && { role }),
      ...(is_active !== undefined && { is_active }),
      ...(team_id && {
        user_teams: {
          some: { team_id },
        },
      }),
    };
  }
}
