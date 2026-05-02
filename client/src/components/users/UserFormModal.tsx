import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import {
  User,
  UserRole,
  CreateUserPayload,
  UpdateUserPayload,
  createUser,
  updateUser,
} from "../../services/usersService";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "ATTENDANT", label: "Atendente" },
  { value: "MANAGER", label: "Gerente" },
  { value: "GENERAL_MANAGER", label: "Gerente Geral" },
];

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

interface UserFormModalProps {
  user?: User | null;
  apiFetch: ApiFetch;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  team_id: string;
}

export default function UserFormModal({
  user,
  apiFetch,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const isEditing = !!user;

  const [form, setForm] = useState<FormState>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "ATTENDANT",
    team_id: user?.team_id ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        team_id: user.team_id ?? "",
      });
    }
  }, [user]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Nome e e-mail são obrigatórios.");
      return;
    }
    if (!isEditing && !form.password.trim()) {
      setError("Senha é obrigatória para novos usuários.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let saved: User;
      if (isEditing && user) {
        const payload: UpdateUserPayload = {
          name: form.name,
          email: form.email,
          role: form.role,
          team_id: form.team_id || undefined,
        };
        saved = await updateUser(apiFetch, user.id, payload);
      } else {
        const payload: CreateUserPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          team_id: form.team_id || undefined,
        };
        saved = await createUser(apiFetch, payload);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess(saved);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? "Editar Usuário" : "Novo Usuário"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? "Atualize os dados do usuário"
                : "Preencha os dados para criar um novo acesso"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="joao@empresa.com"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Perfil
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 appearance-none cursor-pointer text-gray-700"
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                ID da Equipe
              </label>
              <input
                type="text"
                name="team_id"
                value={form.team_id}
                onChange={handleChange}
                placeholder="Ex: team-001"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              {isEditing
                ? "Usuário atualizado com sucesso!"
                : "Usuário criado com sucesso!"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Salvando..."
              : success
              ? "Salvo!"
              : isEditing
              ? "Salvar alterações"
              : "Criar usuário"}
          </button>
        </div>
      </div>
    </div>
  );
}
