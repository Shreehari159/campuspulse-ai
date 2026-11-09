import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Tenant, TenantSubscription } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Settings,
  CreditCard,
  X,
  ExternalLink,
  Users,
  GraduationCap,
  Calendar,
} from 'lucide-react';

export const TenantsModule: React.FC = () => {
  const { showToast, refreshData } = useApp();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modals
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<{
    tenant: Tenant;
    subscription?: TenantSubscription;
    stats?: any;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Settings state
  const [editingSettings, setEditingSettings] = useState<{
    tenantId: string;
    name: string;
    domain: string;
    minAttendanceThreshold: number;
    maxAbsencesBeforeAlert: number;
    contactEmail: string;
    academicCalendar: 'SEMESTER' | 'QUARTER' | 'TRIMESTER';
    timezone: string;
  } | null>(null);

  // Suspend/Reactivate state
  const [statusModalTenant, setStatusModalTenant] = useState<Tenant | null>(null);
  const [statusRationale, setStatusRationale] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Change Tier state
  const [changeTierTenant, setChangeTierTenant] = useState<Tenant | null>(null);
  const [selectedTier, setSelectedTier] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [tierChangeError, setTierChangeError] = useState('');
  const [submittingTier, setSubmittingTier] = useState(false);

  // Provision Form state
  const [provName, setProvName] = useState('');
  const [provDomain, setProvDomain] = useState('');
  const [provSlug, setProvSlug] = useState('');
  const [provTier, setProvTier] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [provMinAttendance, setProvMinAttendance] = useState(75);
  const [provMaxAbsences, setProvMaxAbsences] = useState(3);
  const [provEmail, setProvEmail] = useState('');
  const [provError, setProvError] = useState('');
  const [submittingProv, setSubmittingProv] = useState(false);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const res = await api.getTenants({
        search,
        status: statusFilter,
        tier: tierFilter,
        page,
        limit: 8,
      });
      setTenants(res.tenants);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      showToast(err.message || 'Failed to load institutional tenants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [search, statusFilter, tierFilter, page]);

  // View Tenant Details
  const handleViewDetails = async (tenantId: string) => {
    try {
      setLoadingDetails(true);
      const res = await api.getTenantDetails(tenantId);
      setSelectedTenantDetails(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch tenant details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Edit Settings
  const handleOpenEditSettings = (tenant: Tenant) => {
    setEditingSettings({
      tenantId: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      minAttendanceThreshold: tenant.settings?.minAttendanceThreshold || 75,
      maxAbsencesBeforeAlert: tenant.settings?.maxAbsencesBeforeAlert || 3,
      contactEmail: tenant.settings?.contactEmail || `provost@${tenant.domain}`,
      academicCalendar: tenant.settings?.academicCalendar || 'SEMESTER',
      timezone: tenant.settings?.timezone || 'America/New_York',
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSettings) return;

    try {
      await api.updateTenant(editingSettings.tenantId, {
        name: editingSettings.name,
        domain: editingSettings.domain,
        settings: {
          minAttendanceThreshold: Number(editingSettings.minAttendanceThreshold),
          maxAbsencesBeforeAlert: Number(editingSettings.maxAbsencesBeforeAlert),
          contactEmail: editingSettings.contactEmail,
          academicCalendar: editingSettings.academicCalendar,
          timezone: editingSettings.timezone,
        },
      });
      showToast('Institutional configuration successfully saved!', 'success');
      setEditingSettings(null);
      loadTenants();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  // Submit Status Change (Activate / Suspend)
  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalTenant) return;
    if (statusModalTenant.status === 'ACTIVE' && statusRationale.trim().length < 5) {
      showToast('A documented rationale (min 5 characters) is required to suspend a tenant.', 'info');
      return;
    }

    try {
      setSubmittingStatus(true);
      const nextStatus = statusModalTenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.updateTenantStatus(statusModalTenant.id, nextStatus, statusRationale);
      showToast(
        nextStatus === 'SUSPENDED'
          ? `Tenant ${statusModalTenant.name} has been suspended.`
          : `Tenant ${statusModalTenant.name} has been reactivated.`,
        'success'
      );
      setStatusModalTenant(null);
      setStatusRationale('');
      loadTenants();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to change tenant status', 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Submit Change Plan Tier
  const handleSubmitTierChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTierTenant) return;
    setTierChangeError('');

    try {
      setSubmittingTier(true);
      await api.changeTenantSubscription(changeTierTenant.id, selectedTier);
      showToast(`Subscription plan updated to ${selectedTier} for ${changeTierTenant.name}!`, 'success');
      setChangeTierTenant(null);
      loadTenants();
      refreshData();
    } catch (err: any) {
      setTierChangeError(err.message || 'Failed to change tier');
    } finally {
      setSubmittingTier(false);
    }
  };

  // Provision Tenant
  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvError('');
    if (!provName.trim()) {
      setProvError('University name is required.');
      return;
    }

    try {
      setSubmittingProv(true);
      const derivedSlug = (provSlug || provName.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/^-+|-+$/g, '');
      const derivedDomain = (provDomain || `${derivedSlug}.edu`).toLowerCase().trim();

      const res = await api.createTenant({
        name: provName.trim(),
        slug: derivedSlug,
        domain: derivedDomain,
        subscriptionTier: provTier,
        settings: {
          minAttendanceThreshold: Number(provMinAttendance),
          maxAbsencesBeforeAlert: Number(provMaxAbsences),
          contactEmail: provEmail || `provost@${derivedDomain}`,
          academicCalendar: 'SEMESTER',
          timezone: 'America/New_York',
        },
      });

      showToast(`Higher ed tenant '${res.tenant.name}' provisioned successfully!`, 'success');
      setShowProvisionModal(false);
      setProvName('');
      setProvDomain('');
      setProvSlug('');
      setProvEmail('');
      loadTenants();
      refreshData();
    } catch (err: any) {
      setProvError(err.message || 'Failed to provision tenant.');
    } finally {
      setSubmittingProv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Tenants & Institutional Provisioning
          </h2>
          <p className="text-xs text-slate-500">
            Manage multi-tenant higher education environments, domain routing, institutional configuration, and tenant isolation policies.
          </p>
        </div>

        <button
          onClick={() => {
            setProvError('');
            setShowProvisionModal(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New University Tenant</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by university name, slug, or domain..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <span>Tier:</span>
          </div>
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Tiers</option>
            <option value="STARTER">Starter</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-xs text-slate-900">Provisioned Institutions</span>
            <span className="text-[11px] font-mono text-slate-500">({total} total records)</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Institution Name & ID</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4 text-center">Subscription Tier</th>
                <th className="py-3 px-4 text-right">Students</th>
                <th className="py-3 px-4 text-center">Provisioning</th>
                <th className="py-3 px-4 text-center">Access Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading institutional tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No tenants match your search criteria.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-md text-white font-mono text-[10px] flex items-center justify-center font-bold shrink-0"
                          style={{ backgroundColor: t.accentColor || '#0f172a' }}
                        >
                          {t.logoText || 'U'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <span>{t.domain}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {t.subscriptionTier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">
                      {t.studentCount?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.provisioningStatus === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {t.provisioningStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {t.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>SUSPENDED</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(t.id)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="View Details"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenEditSettings(t)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="Edit Permitted Settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setChangeTierTenant(t);
                            setSelectedTier(t.subscriptionTier);
                            setTierChangeError('');
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="Change Plan Tier"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setStatusModalTenant(t);
                            setStatusRationale('');
                          }}
                          className={`p-1 rounded hover:bg-slate-100 ${
                            t.status === 'ACTIVE' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                          title={t.status === 'ACTIVE' ? 'Suspend Tenant Access' : 'Reactivate Tenant'}
                        >
                          {t.status === 'ACTIVE' ? (
                            <PauseCircle className="w-3.5 h-3.5" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
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
            Showing {tenants.length} of {total} institutions
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

      {/* MODAL 1: Tenant Details Drawer / Modal */}
      {selectedTenantDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-md text-white font-mono text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: selectedTenantDetails.tenant.accentColor || '#0f172a' }}
                >
                  {selectedTenantDetails.tenant.logoText}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedTenantDetails.tenant.name}</h3>
                  <div className="text-xs font-mono text-slate-500">{selectedTenantDetails.tenant.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenantDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Domain Routing:</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTenantDetails.tenant.domain}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Subscription Tier:</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTenantDetails.tenant.subscriptionTier}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Provisioning Status:</span>
                <span className="font-semibold text-emerald-700">{selectedTenantDetails.tenant.provisioningStatus}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block">Tenant Access Status:</span>
                <span
                  className={`font-semibold ${
                    selectedTenantDetails.tenant.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {selectedTenantDetails.tenant.status}
                </span>
              </div>
            </div>

            {/* Institutional Settings */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Configured Institutional Policy Thresholds</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  Min Attendance Threshold:{' '}
                  <strong className="text-slate-900">{selectedTenantDetails.tenant.settings?.minAttendanceThreshold || 75}%</strong>
                </div>
                <div>
                  Max Absences Before Alert:{' '}
                  <strong className="text-slate-900">{selectedTenantDetails.tenant.settings?.maxAbsencesBeforeAlert || 3}</strong>
                </div>
                <div>
                  Academic Calendar:{' '}
                  <strong className="text-slate-900">{selectedTenantDetails.tenant.settings?.academicCalendar || 'SEMESTER'}</strong>
                </div>
                <div>
                  Timezone: <strong className="text-slate-900">{selectedTenantDetails.tenant.settings?.timezone || 'America/New_York'}</strong>
                </div>
                <div className="col-span-2">
                  Contact Email: <strong className="text-slate-900">{selectedTenantDetails.tenant.settings?.contactEmail || 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="border border-slate-200 p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Enrolled Students</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {selectedTenantDetails.tenant.studentCount?.toLocaleString() || 0}
                </span>
              </div>
              <div className="border border-slate-200 p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Faculty Sections</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {selectedTenantDetails.tenant.facultyCount || 0}
                </span>
              </div>
              <div className="border border-slate-200 p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Retention Rate</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  {selectedTenantDetails.tenant.retentionRate}%
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTenantDetails(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Permitted Settings */}
      {editingSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Institutional Settings</h3>
                <p className="text-xs text-slate-500">{editingSettings.name}</p>
              </div>
              <button onClick={() => setEditingSettings(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Institution Display Name</label>
                <input
                  type="text"
                  required
                  value={editingSettings.name}
                  onChange={(e) => setEditingSettings({ ...editingSettings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Institutional Domain</label>
                <input
                  type="text"
                  required
                  value={editingSettings.domain}
                  onChange={(e) => setEditingSettings({ ...editingSettings, domain: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Min Attendance (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={editingSettings.minAttendanceThreshold}
                    onChange={(e) =>
                      setEditingSettings({
                        ...editingSettings,
                        minAttendanceThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Absences Alert</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={editingSettings.maxAbsencesBeforeAlert}
                    onChange={(e) =>
                      setEditingSettings({
                        ...editingSettings,
                        maxAbsencesBeforeAlert: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Provost / Admin Contact Email</label>
                <input
                  type="email"
                  required
                  value={editingSettings.contactEmail}
                  onChange={(e) => setEditingSettings({ ...editingSettings, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Calendar</label>
                  <select
                    value={editingSettings.academicCalendar}
                    onChange={(e: any) =>
                      setEditingSettings({ ...editingSettings, academicCalendar: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="SEMESTER">Semester</option>
                    <option value="QUARTER">Quarter</option>
                    <option value="TRIMESTER">Trimester</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={editingSettings.timezone}
                    onChange={(e) => setEditingSettings({ ...editingSettings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSettings(null)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Suspend / Reactivate Confirmation */}
      {statusModalTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              {statusModalTenant.status === 'ACTIVE' ? (
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {statusModalTenant.status === 'ACTIVE' ? 'Suspend University Tenant' : 'Reactivate University Tenant'}
                </h3>
                <p className="text-xs text-slate-500">{statusModalTenant.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1 border border-slate-200">
              <p className="font-semibold text-slate-800">Tenant Isolation Policy Notice:</p>
              <p>
                {statusModalTenant.status === 'ACTIVE'
                  ? 'Suspension immediately restricts normal student and faculty portal access under this tenant. Institutional and student data will remain preserved and intact.'
                  : 'Reactivation will restore full institutional access according to their active subscription tier.'}
              </p>
            </div>

            <form onSubmit={handleSubmitStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Documented Administrative Rationale <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the reason for this tenant status change (logged to immutable audit ledger)..."
                  value={statusRationale}
                  onChange={(e) => setStatusRationale(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalTenant(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus || (statusModalTenant.status === 'ACTIVE' && statusRationale.trim().length < 5)}
                  className={`px-4 py-2 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50 ${
                    statusModalTenant.status === 'ACTIVE'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {submittingStatus
                    ? 'Processing...'
                    : statusModalTenant.status === 'ACTIVE'
                    ? 'Confirm Suspension'
                    : 'Confirm Reactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Change Subscription Plan Tier */}
      {changeTierTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Assign Subscription Plan</h3>
                <p className="text-xs text-slate-500">{changeTierTenant.name}</p>
              </div>
              <button onClick={() => setChangeTierTenant(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Current Enrollment:{' '}
              <strong className="font-mono text-slate-900">
                {changeTierTenant.studentCount?.toLocaleString() || 0} students
              </strong>
            </div>

            {tierChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tierChangeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTierChange} className="space-y-3 text-xs">
              <div className="space-y-2">
                <label className="block font-medium text-slate-700">Select Plan Tier</label>
                <div
                  onClick={() => setSelectedTier('STARTER')}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTier === 'STARTER' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>STARTER</span>
                    <span className="font-mono">$1,200/mo</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Capacity: 2,500 students · Departmental Edition</div>
                </div>

                <div
                  onClick={() => setSelectedTier('PROFESSIONAL')}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTier === 'PROFESSIONAL' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>PROFESSIONAL</span>
                    <span className="font-mono">$3,400/mo</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Capacity: 10,000 students · College Edition</div>
                </div>

                <div
                  onClick={() => setSelectedTier('ENTERPRISE')}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTier === 'ENTERPRISE' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>ENTERPRISE</span>
                    <span className="font-mono">$7,800/mo</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Capacity: 50,000 students · Multi-Campus Ecosystem</div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChangeTierTenant(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTier}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submittingTier ? 'Enforcing Plan Limits...' : 'Apply Plan Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Provision Tenant Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Provision Higher Ed Institution Tenant</h3>
                <p className="text-xs text-slate-500">Atomic database transaction initializes tenant, settings, and subscription.</p>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {provError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{provError}</span>
              </div>
            )}

            <form onSubmit={handleProvisionTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  University / College Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cascade State University"
                  value={provName}
                  onChange={(e) => {
                    setProvName(e.target.value);
                    if (!provSlug) {
                      setProvSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, ''));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tenant Slug Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. cascade-state"
                    value={provSlug}
                    onChange={(e) => setProvSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Institutional Domain</label>
                  <input
                    type="text"
                    placeholder="e.g. cascadestate.edu"
                    value={provDomain}
                    onChange={(e) => setProvDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Subscription Plan Tier</label>
                <select
                  value={provTier}
                  onChange={(e: any) => setProvTier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="STARTER">STARTER ($1,200/mo · Up to 2,500 students)</option>
                  <option value="PROFESSIONAL">PROFESSIONAL ($3,400/mo · Up to 10,000 students)</option>
                  <option value="ENTERPRISE">ENTERPRISE ($7,800/mo · Up to 50,000 students)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Min Attendance (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={provMinAttendance}
                    onChange={(e) => setProvMinAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Absences Alert</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={provMaxAbsences}
                    onChange={(e) => setProvMaxAbsences(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Provost / Admin Email</label>
                <input
                  type="email"
                  placeholder="provost@institution.edu"
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProv}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submittingProv ? 'Provisioning...' : 'Provision Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
