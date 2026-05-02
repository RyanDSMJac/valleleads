import { useEffect, useState } from "react";
import { X, Phone, Mail, CreditCard, User, Tag, AlertCircle } from "lucide-react";
import { Customer, CustomerLead, getCustomerLeads } from "../../services/customersService";

const stageConfig: Record<string, { bg: string; text: string }> = {
  Novo:              { bg: "#EFF6FF", text: "#2563EB" },
  "Contato Inicial": { bg: "#F5F3FF", text: "#7C3AED" },
  Qualificação:      { bg: "#FFFBEB", text: "#D97706" },
  Proposta:          { bg: "#FFF7ED", text: "#EA580C" },
  Negociação:        { bg: "#FEF2F2", text: "#DC2626" },
  Fechamento:        { bg: "#ECFDF5", text: "#059669" },
};

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatCurrency(value?: number) {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function LeadItem({ lead }: { lead: CustomerLead }) {
  const cfg = stageConfig[lead.stage] ?? { bg: "#F1F5F9", text: "#6B7280" };
  const date = new Date(lead.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ backgroundColor: cfg.bg, color: cfg.text }}
        >
          {lead.stage}
        </span>
        <div>
          {lead.vehicle && (
            <p className="text-sm font-medium text-gray-800">{lead.vehicle}</p>
          )}
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          {formatCurrency(lead.value)}
        </p>
        {lead.attendant && (
          <p className="text-xs text-gray-400">{lead.attendant}</p>
        )}
      </div>
    </div>
  );
}

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

interface CustomerDetailModalProps {
  customer: Customer;
  apiFetch: ApiFetch;
  onClose: () => void;
}

export default function CustomerDetailModal({
  customer,
  apiFetch,
  onClose,
}: CustomerDetailModalProps) {
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const fetchLeads = () => {
    setLeadsLoading(true);
    setLeadsError("");
    getCustomerLeads(apiFetch, customer.id)
      .then(setLeads)
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Erro ao carregar leads. Tente novamente.";
        setLeadsError(msg);
      })
      .finally(() => setLeadsLoading(false));
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
              {customer.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {customer.name}
              </h2>
              <p className="text-xs text-gray-400">Detalhes do cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Dados cadastrais */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Dados Cadastrais
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<User size={14} />} label="Nome completo" value={customer.name} />
              <InfoRow icon={<CreditCard size={14} />} label="CPF" value={formatCPF(customer.cpf)} />
              <InfoRow icon={<Phone size={14} />} label="Telefone" value={customer.phone} />
              <InfoRow icon={<Mail size={14} />} label="E-mail" value={customer.email} />
            </div>
          </div>

          {/* Leads associados */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Leads Associados
              </h3>
              {!leadsLoading && !leadsError && (
                <span className="text-xs text-gray-400">
                  {leads.length} lead{leads.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {leadsLoading && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!leadsLoading && leadsError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                <AlertCircle size={14} className="flex-shrink-0" />
                {leadsError}
                <button
                  onClick={fetchLeads}
                  className="ml-auto font-semibold underline hover:no-underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!leadsLoading && !leadsError && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Tag size={20} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  Nenhum lead encontrado
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Este cliente ainda não gerou nenhum interesse.
                </p>
              </div>
            )}

            {!leadsLoading && !leadsError && leads.length > 0 && (
              <div className="space-y-2">
                {leads.map((lead) => (
                  <LeadItem key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
