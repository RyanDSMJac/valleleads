import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { useApi } from "../services/api";
import {
  User,
  UserRole,
  listUsers,
  toggleUserActive,
} from "../services/usersService";
import UserTable from "../components/users/UserTable";
import UserFilterBar from "../components/users/UserFilterBar";
import UserFormModal from "../components/users/UserFormModal";

const PER_PAGE = 10;

export default function Users() {
  const { user: authUser } = useAuth();
  const { apiFetch } = useApi();
  const navigate = useNavigate();

  // Proteção de rota — apenas GENERAL_MANAGER
  useEffect(() => {
    if (authUser && authUser.role !== "GENERAL_MANAGER") {
      navigate("/");
    }
  }, [authUser, navigate]);

  // Filtros
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [teamFilter, setTeamFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [search, setSearch] = useState("");

  // Dados
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Feedback de toggle
  const [toggleFeedback, setToggleFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Parameters<typeof listUsers>[1] = {
        page,
        per_page: PER_PAGE,
      };
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (teamFilter) params.team_id = teamFilter;
      if (storeFilter) params.store = storeFilter;
      if (statusFilter === "ACTIVE") params.is_active = true;
      if (statusFilter === "INACTIVE") params.is_active = false;

      const result = await listUsers(apiFetch, params);
      setUsers(result.data);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao buscar usuários. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, roleFilter, teamFilter, storeFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reseta página ao mudar filtros
  useEffect(() => {
    setPage(1);
  }, [roleFilter, teamFilter, storeFilter, statusFilter, search]);

  async function handleToggleActive(user: User) {
    setToggleFeedback(null);
    try {
      await toggleUserActive(apiFetch, user.id, !user.is_active);
      setToggleFeedback({
        type: "success",
        msg: `Usuário ${user.name} ${!user.is_active ? "ativado" : "desativado"} com sucesso!`,
      });
      setTimeout(() => setToggleFeedback(null), 3000);
      fetchUsers();
    } catch {
      setToggleFeedback({
        type: "error",
        msg: "Erro ao alterar status do usuário.",
      });
      setTimeout(() => setToggleFeedback(null), 3000);
    }
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setShowModal(true);
  }

  function handleModalClose() {
    setShowModal(false);
    setEditingUser(null);
  }

  function handleModalSuccess() {
    fetchUsers();
  }

  function getPages() {
    const pages: number[] = [];
    const delta = 2;
    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        (p >= page - delta && p <= page + delta)
      ) {
        pages.push(p);
      }
    }
    return pages;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os membros e permissões da equipe
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-200"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Novo Usuário</span>
        </button>
      </div>

      {/* Filtros */}
      <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        teamFilter={teamFilter}
        onTeamChange={setTeamFilter}
        storeFilter={storeFilter}
        onStoreChange={setStoreFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Feedback de toggle */}
      {toggleFeedback && (
        <div
          className={`flex items-center gap-2 p-4 mb-4 rounded-xl text-sm border ${
            toggleFeedback.type === "success"
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-red-50 border-red-100 text-red-600"
          }`}
        >
          {toggleFeedback.type === "error" && (
            <AlertCircle size={15} className="flex-shrink-0" />
          )}
          {toggleFeedback.msg}
        </div>
      )}

      {/* Erro geral */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
          <button
            onClick={fetchUsers}
            className="ml-auto text-xs font-semibold underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Contagem */}
      {!loading && !error && (
        <p className="text-xs text-gray-400 mb-4">
          {total} usuário{total !== 1 ? "s" : ""} encontrado
          {total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Tabela */}
      <UserTable
        users={users}
        apiFetch={apiFetch}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        loading={loading}
      />

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
            </button>

            {getPages().map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const gap = prev && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-1">
                  {gap && (
                    <span className="text-xs px-1 text-gray-400">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium border transition-all ${
                      p === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          apiFetch={apiFetch}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
