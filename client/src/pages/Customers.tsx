import { useState, useEffect, useCallback } from "react";
import { Search, Users, AlertCircle } from "lucide-react";
import { useApi } from "../services/api";
import { Customer, listCustomers } from "../services/customersService";
import CustomerDetailModal from "../components/customers/CustomerDetailModal";

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "#2563EB", "#8B5CF6", "#F97316", "#10B981", "#EF4444", "#F59E0B", "#06B6D4",
];

export default function Customers() {
  const { apiFetch } = useApi();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listCustomers(apiFetch, { search: debouncedSearch });
      setCustomers(result.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao buscar clientes. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cadastro central de clientes e seus históricos
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md mb-6">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
          <button
            onClick={fetchCustomers}
            className="ml-auto text-xs font-semibold underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0 animate-pulse"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-40" />
                <div className="h-2.5 bg-gray-50 rounded w-56" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-32 hidden md:block" />
              <div className="h-3 bg-gray-100 rounded w-28 hidden lg:block" />
            </div>
          ))}
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && customers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700">Nenhum cliente encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? "Tente uma busca diferente" : "Ainda não há clientes cadastrados"}
          </p>
        </div>
      )}

      {/* Tabela */}
      {!loading && !error && customers.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {customers.length} cliente{customers.length !== 1 ? "s" : ""} encontrado
            {customers.length !== 1 ? "s" : ""}
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      CPF
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      Telefone
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer, i) => {
                    const color = avatarColors[i % avatarColors.length];
                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {getInitials(customer.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {customer.name}
                              </p>
                              <p className="text-xs text-gray-400">{customer.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm font-mono text-gray-600">
                            {formatCPF(customer.cpf)}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{customer.phone}</span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(customer);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg hover:bg-blue-50"
                          >
                            Ver detalhes →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalhes */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          apiFetch={apiFetch}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
