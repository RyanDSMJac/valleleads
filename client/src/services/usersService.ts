export type UserRole = "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  // Extraído de user_teams[0].team.name pela função normalizeUser
  team?: string;
  team_id?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  team_id?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  team_id?: string;
  is_active?: boolean;
}

export interface ListUsersParams {
  role?: UserRole;
  team_id?: string;
  store?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

// A API retorna user_teams[].team.name — normalizamos para o campo `team`
// que a tabela do frontend exibe diretamente.
function normalizeUser(raw: any): User {
  const firstTeam = raw.user_teams?.[0];
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    is_active: raw.is_active,
    created_at: raw.created_at,
    team: firstTeam?.team?.name ?? undefined,
    team_id: firstTeam?.team_id ?? undefined,
  };
}

// A API pode retornar:
//   • Array puro:                          User[]
//   • Paginado:  { data: User[], total, page, per_page, total_pages }
//   • Com wrapper success: { success, data: User[] }
// Normalizamos tudo para PaginatedUsers.
function normalizeResponse(raw: any, params: ListUsersParams): PaginatedUsers {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 10;

  // Array puro
  if (Array.isArray(raw)) {
    const users = raw.map(normalizeUser);
    return {
      data: users,
      total: users.length,
      page,
      per_page,
      total_pages: Math.ceil(users.length / per_page) || 1,
    };
  }

  // { success, data: [...] }  ou  { data: [...], total, ... }
  const arr = raw.data ?? raw;
  if (Array.isArray(arr)) {
    const users = arr.map(normalizeUser);
    const total = raw.total ?? users.length;
    const total_pages = raw.total_pages ?? (Math.ceil(total / per_page) || 1);
    return {
      data: users,
      total,
      page: raw.page ?? page,
      per_page: raw.per_page ?? per_page,
      total_pages,
    };
  }

  // fallback
  return { data: [], total: 0, page, per_page, total_pages: 1 };
}

export async function listUsers(
  apiFetch: ApiFetch,
  params: ListUsersParams = {}
): Promise<PaginatedUsers> {
  const query = new URLSearchParams();
  if (params.role !== undefined) query.set("role", params.role);
  if (params.team_id !== undefined) query.set("team_id", params.team_id);
  if (params.store !== undefined) query.set("store", params.store);
  if (params.is_active !== undefined) query.set("is_active", String(params.is_active));
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.per_page !== undefined) query.set("per_page", String(params.per_page));

  const res = await apiFetch(`/api/users?${query.toString()}`);
  const raw = await res.json();
  return normalizeResponse(raw, params);
}

export async function createUser(
  apiFetch: ApiFetch,
  payload: CreateUserPayload
): Promise<User> {
  const res = await apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const raw = await res.json();
  // Pode vir com wrapper { success, data } ou direto
  return normalizeUser(raw.data ?? raw);
}

export async function updateUser(
  apiFetch: ApiFetch,
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  const res = await apiFetch(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const raw = await res.json();
  return normalizeUser(raw.data ?? raw);
}

export async function toggleUserActive(
  apiFetch: ApiFetch,
  id: string,
  is_active: boolean
): Promise<User> {
  return updateUser(apiFetch, id, { is_active });
}
