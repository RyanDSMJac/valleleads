import { Search, X } from "lucide-react";
import { UserRole } from "../../services/usersService";

interface UserFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: UserRole | "ALL";
  onRoleChange: (value: UserRole | "ALL") => void;
  teamFilter: string;
  onTeamChange: (value: string) => void;
  storeFilter: string;
  onStoreChange: (value: string) => void;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";
  onStatusChange: (value: "ALL" | "ACTIVE" | "INACTIVE") => void;
}

const roleOptions: { value: UserRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos os perfis" },
  { value: "ATTENDANT", label: "Atendente" },
  { value: "MANAGER", label: "Gerente" },
  { value: "GENERAL_MANAGER", label: "Gerente Geral" },
];

const statusOptions: { value: "ALL" | "ACTIVE" | "INACTIVE"; label: string }[] = [
  { value: "ALL", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export default function UserFilterBar({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  teamFilter,
  onTeamChange,
  storeFilter,
  onStoreChange,
  statusFilter,
  onStatusChange,
}: UserFilterBarProps) {
  const hasActiveFilters =
    roleFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    teamFilter !== "" ||
    storeFilter !== "";

  function clearFilters() {
    onRoleChange("ALL");
    onStatusChange("ALL");
    onTeamChange("");
    onStoreChange("");
    onSearchChange("");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
      {/* Busca */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all"
        />
      </div>

      {/* Filtros em linha */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Perfil */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value as UserRole | "ALL")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700 bg-white"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Equipe */}
        <input
          type="text"
          value={teamFilter}
          onChange={(e) => onTeamChange(e.target.value)}
          placeholder="Filtrar por equipe..."
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
        />

        {/* Loja */}
        <input
          type="text"
          value={storeFilter}
          onChange={(e) => onStoreChange(e.target.value)}
          placeholder="Filtrar por loja..."
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
        />

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
          }
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700 bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl transition-all"
          >
            <X size={13} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
