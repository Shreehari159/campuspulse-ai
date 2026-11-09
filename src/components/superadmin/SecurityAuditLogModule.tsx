import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AuditEvent, Tenant } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Shield,
  Search,
  SlidersHorizontal,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  X,
  FileCode,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  Activity,
} from 'lucide-react';

export const SecurityAuditLogModule: React.FC = () => {
  const { showToast } = useApp();
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);

  // Integrity Verification State
  const [verifyingIntegrity, setVerifyingIntegrity] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [auditRes, tenantsRes] = await Promise.all([
        api.getAuditLogs({
          search,
          tenantId: tenantFilter,
          action: actionFilter,
          outcome: outcomeFilter,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          page,
          limit: 12,
        }),
        api.getTenants({ limit: 50 }),
      ]);
      setLogs(auditRes.logs);
      setTotal(auditRes.total);
      setTotalPages(auditRes.totalPages);
      setTenants(tenantsRes.tenants);
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, tenantFilter, actionFilter, outcomeFilter, startDate, endDate, page]);

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const url = await api.exportAuditLogsUrl();
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campuspulse_audit_log_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Compliance audit logs exported in CSV format.', 'success');
      loadData();
    } catch (err: any) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campuspulse_audit_log_page_${page}_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported visible audit page in JSON format.', 'info');
    } catch (err: any) {
      showToast('JSON export failed', 'error');
    }
  };

  // Verify Ledger Immutability & Integrity
  const handleVerifyIntegrity = async () => {
    try {
      setVerifyingIntegrity(true);
      const res = await api.verifyAuditIntegrity();
      setIntegrityReport(res);
      showToast('Cryptographic audit chain verified without tamper!', 'success');
      loadData();
    } catch (err: any) {
      showToast('Integrity verification failed: ' + err.message, 'error');
    } finally {
      setVerifyingIntegrity(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Security & Compliance Immutable Audit Log</span>
          </h2>
          <p className="text-xs text-slate-500">
            Append-only tamper-evident event stream capturing administrative actions, confidential counseling reads, model promotions, and tenant state changes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleVerifyIntegrity}
            disabled={verifyingIntegrity}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{verifyingIntegrity ? 'Verifying Chain...' : 'Verify Cryptographic Integrity'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-600" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Integrity Verification Result Banner */}
      {integrityReport && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-3 animate-in fade-in text-xs text-emerald-900">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">
                Immutable Ledger Chain Verified ({integrityReport.recordCount} Events Validated)
              </div>
              <div className="text-[11px] font-mono text-emerald-800">
                Algorithm: {integrityReport.algorithm} · Block Hash: {integrityReport.blockHash}
              </div>
              <div className="text-[11px] text-emerald-700">
                Append-only Policy: {integrityReport.appendOnlyPolicy} — Zero mutations or deletions detected.
              </div>
            </div>
          </div>
          <button
            onClick={() => setIntegrityReport(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit events by action, actor, resource, or details..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Tenant Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5" />
            <span>Tenant:</span>
          </div>
          <select
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Action:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Actions</option>
            <option value="TENANT_PROVISIONED">Tenant Provisioned</option>
            <option value="TENANT_SUSPENDED">Tenant Suspended</option>
            <option value="TENANT_ACTIVATED">Tenant Activated</option>
            <option value="SUBSCRIPTION_PLAN_ASSIGNED">Plan Assigned</option>
            <option value="MODEL_PROMOTED_PRODUCTION">Model Promoted</option>
            <option value="MODEL_ROLLBACK_EXECUTED">Model Rollback</option>
            <option value="CONFIDENTIAL_CASE_READ">Confidential Case Read</option>
            <option value="REFERRAL_CREATED">Referral Created</option>
            <option value="AUDIT_INTEGRITY_VERIFIED">Integrity Verified</option>
          </select>

          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <span>Outcome:</span>
          </div>
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="DENIED">DENIED</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              title="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              title="End Date"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-xs text-slate-900">Immutable Event Ledger</span>
            <span className="text-[11px] font-mono text-slate-500">({total} total events captured)</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4 text-center">Outcome</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Tenant</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading immutable audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.actorRole}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.outcome === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800'
                            : log.outcome === 'DENIED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {log.outcome === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{log.outcome || 'SUCCESS'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate" title={log.resource}>
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      {log.tenantName || log.tenantId}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {logs.length} of {total} events
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Full Audit Entry Inspector */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-mono">{selectedLog.action}</h3>
                  <div className="text-xs font-mono text-slate-400">ID: {selectedLog.id}</div>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Timestamp (ISO UTC)</span>
                <span className="font-mono font-semibold text-slate-900">{selectedLog.timestamp}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Outcome</span>
                <span
                  className={`font-mono font-bold ${
                    selectedLog.outcome === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedLog.outcome || 'SUCCESS'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Actor Identity</span>
                <span className="font-semibold text-slate-900">
                  {selectedLog.actorName} ({selectedLog.actorRole})
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Source IP / Request ID</span>
                <span className="font-mono text-slate-700">
                  {selectedLog.ipAddress} · {selectedLog.requestId || 'req-standard'}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Target Resource:</span>
              <span className="font-mono text-slate-700">{selectedLog.resource}</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Full Event Details:</span>
              <p className="text-slate-700 leading-relaxed">{selectedLog.details}</p>
            </div>

            {selectedLog.metadata && (
              <div className="border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Structured Metadata Payload (JSON):</span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
