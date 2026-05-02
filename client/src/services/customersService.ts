export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  is_active?: boolean;
  team_id?: string;
  created_at?: string;
}

export interface CustomerLead {
  id: string;
  stage: string;
  value?: number;
  created_at: string;
  attendant?: string;
  vehicle?: string;
}

export interface ListCustomersParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

// A API pode retornar array puro ou { success, data: [...] }
// Normalizamos para PaginatedCustomers.
function normalizeResponse(raw: any, params: ListCustomersParams): PaginatedCustomers {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 20;

  if (Array.isArray(raw)) {
    return {
      data: raw,
      total: raw.length,
      page,
      per_page,
      total_pages: Math.ceil(raw.length / per_page) || 1,
    };
  }

  const arr: Customer[] = raw.data ?? raw;
  const total = raw.total ?? arr.length;
  const total_pages = raw.total_pages ?? Math.ceil(total / per_page) || 1;

  return {
    data: arr,
    total,
    page: raw.page ?? page,
    per_page: raw.per_page ?? per_page,
    total_pages,
  };
}

// A API de leads retorna { success, data: [...] } com o campo `status`
// (ex: "CLOSED_WON") e `vehicle_interest` — mapeamos para o shape
// que o CustomerDetailModal espera.
function normalizeLead(raw: any): CustomerLead {
  return {
    id: raw.id,
    stage: raw.status ?? raw.stage ?? "—",
    value: raw.value ?? undefined,
    created_at: raw.created_at,
    attendant: raw.attendant?.name ?? undefined,
    vehicle: raw.vehicle_interest ?? raw.vehicle ?? undefined,
  };
}

export async function listCustomers(
  apiFetch: ApiFetch,
  params: ListCustomersParams = {}
): Promise<PaginatedCustomers> {
  const query = new URLSearchParams();
  // A API de customers aceita `name` para busca textual, não `search`
  if (params.search) query.set("name", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));

  const res = await apiFetch(`/api/customers?${query.toString()}`);
  const raw = await res.json();
  return normalizeResponse(raw, params);
}

export async function getCustomer(
  apiFetch: ApiFetch,
  id: string
): Promise<Customer> {
  const res = await apiFetch(`/api/customers/${id}`);
  const raw = await res.json();
  return raw.data ?? raw;
}

export async function getCustomerLeads(
  apiFetch: ApiFetch,
  customerId: string
): Promise<CustomerLead[]> {
  const res = await apiFetch(`/api/leads?customer_id=${customerId}`);
  const raw = await res.json();
  // Pode vir { success, data: [...] } ou array puro
  const arr = Array.isArray(raw) ? raw : (raw.data ?? []);
  return arr.map(normalizeLead);
}
