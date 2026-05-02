import { useState } from "react";
import { Pencil, Power } from "lucide-react";
import { User, UserRole, toggleUserActive } from "../../services/usersService";

const roleBadgeConfig: Record<
  UserRole,
  { label: string; bg: string; text: string; dot: string }
> = {
  ATTENDANT: {
    label: "Atendente",
    bg: "#EFF6FF",
    text: "#1D4ED8",
    dot: "#3B82F6",
  },
  MANAGER: {
    label: "Gerente",
    bg: "#FFF7ED",
    text: "#C2410C",
    dot: "#F97316",
  },
  GENERAL_MANAGER: {
    label: "Gerente Geral",
    bg: "#F5F3FF",
    text: "#6D28D9",
    dot: "#8B5CF6",
  },
};

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = roleBadgeConfig[role];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

function UserAvatar({ name, role }: { name: string; role: UserRole }) {
  const cfg = roleBadgeConfig[role];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {initials}
    </div>
  );
}

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

interface UserTableProps {
  users: User[];
  apiFetch: ApiFetch;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  loading?: boolean;
}

export default function UserTable({
  users,
  apiFetch,
  onEdit,
  onToggleActive,
  loading = false,
}: UserTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(user: User) {
    setTogglingId(user.id);
    try {
      await toggleUserActive(apiFetch, user.id, !user.is_active);
      onToggleActive(user);
    } catch {
      // erro tratado pelo pai via onToggleActive
    } finally {
      setTogglingId(null);
    }
  }

  if (!loading && users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-2xl">
          👥
        </div>
        <p className="font-semibold text-gray-700">Nenhum usuário encontrado</p>
        <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0 animate-pulse"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-40" />
              <div className="h-2.5 bg-gray-50 rounded w-56" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-6 w-16 bg-gray-100 rounded-full hidden md:block" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Usuário
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Perfil
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                Equipe
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar name={user.name} role={user.role} />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          user.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <RoleBadge role={user.role} />
                </td>

                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-sm text-gray-600">
                    {user.team ?? "—"}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {user.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(user)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-600 transition-all"
                      title="Editar usuário"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => handleToggle(user)}
                      disabled={togglingId === user.id}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.is_active
                          ? "hover:bg-red-50 text-red-500"
                          : "hover:bg-green-50 text-green-600"
                      }`}
                      title={user.is_active ? "Desativar usuário" : "Ativar usuário"}
                    >
                      {togglingId === user.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Power size={14} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
