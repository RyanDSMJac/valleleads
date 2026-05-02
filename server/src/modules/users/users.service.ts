import { UsersRepository } from "./users.repository.js";
import type { CreateUserDTO, UpdateUserDTO, QueryUserDTO } from "./users.dto.js";
import bcrypt from "bcrypt";

export class UsersService {
  private repo = new UsersRepository();

  async findAll(filters: QueryUserDTO) {
    const { page = 1, per_page = 10 } = filters;

    const [data, total] = await Promise.all([
      this.repo.findAll(filters),
      this.repo.countAll(filters),
    ]);

    return {
      data,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async create(data: CreateUserDTO) {
    const userExists = await this.repo.findByEmail(data.email);

    if (userExists) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.repo.create({
      name: data.name,
      email: data.email,
      password_hash: hashedPassword,
      role: data.role,
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    // Se veio nova senha, hasheia antes de salvar
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const { password, ...rest } = data;
      return this.repo.update(id, { ...rest, password_hash: hashedPassword });
    }

    return this.repo.update(id, data);
  }

  async softDelete(id: string) {
    return this.repo.softDelete(id);
  }
}
