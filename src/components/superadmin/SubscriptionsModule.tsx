import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SubscriptionPlan, TenantSubscription, Tenant } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  X,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Ban,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const SubscriptionsModule: React.FC = () => {
  const { showToast, refreshData } = useApp();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Plan State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editMonthlyFee, setEditMonthlyFee] = useState(0);
  const [editAnnualFee, setEditAnnualFee] = useState(0);
  const [editMaxStudents, setEditMaxStudents] = useState(0);
  const [editMaxFaculty, setEditMaxFaculty] = useState(0);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // Lifecycle Action State
  const [lifecycleModal, setLifecycleModal] = useState<{
    tenantId: string;
    tenantName: string;
    action: 'activate' | 'suspend' | 'cancel' | 'renew';
    currentStatus: string;
  } | null>(null);
  const [lifecycleRationale, setLifecycleRationale] = useState('');
  const [submittingLifecycle, setSubmittingLifecycle] = useState(false);

  // Change Tenant Plan State
  const [changeTenantPlanModal, setChangeTenantPlanModal] = useState<{
    tenantId: string;
    tenantName: string;
    currentTier: string;
    studentCount: number;
  } | null>(null);
  const [targetTier, setTargetTier] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [planChangeError, setPlanChangeError] = useState('');
  const [submittingTenantPlan, setSubmittingTenantPlan] = useState(false);

  // Limit Simulation State
  const [simTenantId, setSimTenantId] = useState('');
  const [simStudentsToAdd, setSimStudentsToAdd] = useState(500);
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, subsRes, tenantsRes] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getTenantSubscriptions(),
        api.getTenants({ limit: 50 }),
      ]);
      setPlans(plansRes.plans);
      setSubscriptions(subsRes.subscriptions);
      setTenants(tenantsRes.tenants);
      if (tenantsRes.tenants.length > 0 && !simTenantId) {
        setSimTenantId(tenantsRes.tenants[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Edit Plan Modal
  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditMonthlyFee(plan.monthlyFee);
    setEditAnnualFee(plan.annualFee);
    setEditMaxStudents(plan.maxStudents);
    setEditMaxFaculty(plan.maxFaculty);
    setEditFeatures([...plan.features]);
    setNewFeatureText('');
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setSubmittingPlan(true);
      await api.updateSubscriptionPlan(editingPlan.tier, {
        monthlyFee: Number(editMonthlyFee),
        annualFee: Number(editAnnualFee),
        maxStudents: Number(editMaxStudents),
        maxFaculty: Number(editMaxFaculty),
        features: editFeatures,
      });
      showToast(`Tier ${editingPlan.tier} specifications updated successfully!`, 'success');
      setEditingPlan(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update plan specifications', 'error');
    } finally {
      setSubmittingPlan(false);
    }
  };

  // Submit Lifecycle Action
  const handleSubmitLifecycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lifecycleModal) return;

    try {
      setSubmittingLifecycle(true);
      await api.updateSubscriptionLifecycle(
        lifecycleModal.tenantId,
        lifecycleModal.action,
        lifecycleRationale
      );
      showToast(
        `Subscription ${lifecycleModal.action}d for ${lifecycleModal.tenantName}!`,
        'success'
      );
      setLifecycleModal(null);
      setLifecycleRationale('');
      loadData();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to execute lifecycle change', 'error');
    } finally {
      setSubmittingLifecycle(false);
    }
  };

  // Submit Tenant Plan Change
  const handleSubmitTenantPlanChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTenantPlanModal) return;
    setPlanChangeError('');

    try {
      setSubmittingTenantPlan(true);
      await api.changeTenantSubscription(changeTenantPlanModal.tenantId, targetTier);
      showToast(
        `Updated subscription tier to ${targetTier} for ${changeTenantPlanModal.tenantName}`,
        'success'
      );
      setChangeTenantPlanModal(null);
      loadData();
      refreshData();
    } catch (err: any) {
      setPlanChangeError(err.message || 'Failed to assign plan');
    } finally {
      setSubmittingTenantPlan(false);
    }
  };

  // Run Plan Limit Simulator
  const handleRunLimitSimulation = async () => {
    if (!simTenantId) return;
    try {
      setSimulating(true);
      const res = await api.validateSubscriptionLimit(simTenantId, simStudentsToAdd);
      setSimResult(res);
    } catch (err: any) {
      showToast(err.message || 'Limit test failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Subscriptions, Tiers & Institutional Capacity
          </h2>
          <p className="text-xs text-slate-500">
            Configure commercial SaaS tier entitlements, monitor institutional enrollment quotas, and manage subscription lifecycles.
          </p>
        </div>

        {/* Clear Administrative Invoicing Notice */}
        <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-lg text-xs text-amber-800 flex items-center gap-2 self-start sm:self-auto">
          <FileText className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Billing Mode: Administrative Institutional Invoicing</span>
        </div>
      </div>

      {/* Subscription Tier Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">SaaS Plan Specifications</h3>
          <span className="text-xs text-slate-500">Configurable institutional allocations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.tier}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {p.tier}
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-slate-900">
                      ${p.monthlyFee.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>
                </div>

                <h4 className="font-bold text-base text-slate-900">{p.name}</h4>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono">
                  <span>Student Cap: <strong className="text-slate-900">{p.maxStudents.toLocaleString()}</strong></span>
                  <span>Faculty Cap: <strong className="text-slate-900">{p.maxFaculty.toLocaleString()}</strong></span>
                </div>

                {/* Features List */}
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Annual: ${p.annualFee.toLocaleString()}/yr
                </span>
                <button
                  onClick={() => handleOpenEditPlan(p)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-slate-500" />
                  <span>Edit Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institution Subscriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Active Institutional Subscriptions & Quota Consumption</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring of enrolled student volume against commercial contractual thresholds.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{subscriptions.length} University Subscriptions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4 text-center">Plan Tier</th>
                <th className="py-3 px-4 text-center">Billing State</th>
                <th className="py-3 px-4">Capacity Consumption</th>
                <th className="py-3 px-4 text-right">Fee</th>
                <th className="py-3 px-4">Renewal Date</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No subscriptions registered.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const studentCount = sub.currentStudentCount || 0;
                  const capacity = sub.studentCapacity || 1;
                  const percentUsed = Math.min(100, Math.round((studentCount / capacity) * 100));

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{sub.tenantName}</div>
                        <div className="font-mono text-[10px] text-slate-400 font-normal">{sub.tenantId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {sub.planTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800'
                              : sub.status === 'SUSPENDED'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="flex justify-between text-[11px] font-mono mb-1 text-slate-600">
                          <span>{studentCount.toLocaleString()} enrolled</span>
                          <span>{capacity.toLocaleString()} cap ({percentUsed}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentUsed > 90
                                ? 'bg-rose-500'
                                : percentUsed > 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        ${sub.currentPrice?.toLocaleString()}/{sub.billingInterval === 'ANNUAL' ? 'yr' : 'mo'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {new Date(sub.renewalDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setChangeTenantPlanModal({
                                tenantId: sub.tenantId,
                                tenantName: sub.tenantName,
                                currentTier: sub.planTier,
                                studentCount,
                              });
                              setTargetTier(sub.planTier);
                              setPlanChangeError('');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            title="Change Subscription Tier"
                          >
                            Change Plan
                          </button>

                          {sub.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                setLifecycleModal({
                                  tenantId: sub.tenantId,
                                  tenantName: sub.tenantName,
                                  action: 'suspend',
                                  currentStatus: sub.status,
                                });
                                setLifecycleRationale('');
                              }}
                              className="p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-50"
                              title="Suspend Subscription"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setLifecycleModal({
                                  tenantId: sub.tenantId,
                                  tenantName: sub.tenantName,
                                  action: 'activate',
                                  currentStatus: sub.status,
                                });
                                setLifecycleRationale('');
                              }}
                              className="p-1 text-emerald-600 hover:text-emerald-800 rounded hover:bg-emerald-50"
                              title="Reactivate Subscription"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setLifecycleModal({
                                tenantId: sub.tenantId,
                                tenantName: sub.tenantName,
                                action: 'renew',
                                currentStatus: sub.status,
                              });
                              setLifecycleRationale('');
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                            title="Renew Subscription (+1 Year)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setLifecycleModal({
                                tenantId: sub.tenantId,
                                tenantName: sub.tenantName,
                                action: 'cancel',
                                currentStatus: sub.status,
                              });
                              setLifecycleRationale('');
                            }}
                            className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                            title="Cancel Subscription"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend Plan Limit Validation Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Plan Capacity & Student Limit Enforcement Validator</span>
          </h3>
          <p className="text-xs text-slate-500">
            Verify real-time backend capacity enforcement rules before roster ingestion or plan migrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target University Tenant</label>
            <select
              value={simTenantId}
              onChange={(e) => {
                setSimTenantId(e.target.value);
                setSimResult(null);
              }}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subscriptionTier} · {t.studentCount} enrolled)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Projected New Students</label>
            <input
              type="number"
              min="1"
              max="50000"
              value={simStudentsToAdd}
              onChange={(e) => {
                setSimStudentsToAdd(Number(e.target.value));
                setSimResult(null);
              }}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <button
              onClick={handleRunLimitSimulation}
              disabled={simulating}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {simulating ? 'Validating on Backend...' : 'Validate Capacity Quota'}
            </button>
          </div>
        </div>

        {simResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              simResult.allowed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {simResult.allowed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{simResult.message}</div>
              <div className="text-[11px] mt-0.5 opacity-90 font-mono">
                Current: {simResult.currentCount?.toLocaleString()} · Projected: {simResult.projectedCount?.toLocaleString()} · Tier Limit: {simResult.maxAllowed?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Edit Plan Specifications */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit {editingPlan.name}</h3>
                <p className="text-xs text-slate-500">Tier: {editingPlan.tier}</p>
              </div>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editMonthlyFee}
                    onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Annual Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editAnnualFee}
                    onChange={(e) => setEditAnnualFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Students Capacity</label>
                  <input
                    type="number"
                    min="100"
                    value={editMaxStudents}
                    onChange={(e) => setEditMaxStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Faculty Cap</label>
                  <input
                    type="number"
                    min="10"
                    value={editMaxFaculty}
                    onChange={(e) => setEditMaxFaculty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Enabled Feature Entitlements</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-lg">
                  {editFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded text-[11px]">
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => setEditFeatures(editFeatures.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add feature capability..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureText.trim()) {
                        setEditFeatures([...editFeatures, newFeatureText.trim()]);
                        setNewFeatureText('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPlan}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 shadow-xs"
                >
                  {submittingPlan ? 'Saving...' : 'Save Plan Specifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Lifecycle Mutation Confirmation */}
      {lifecycleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 capitalize">
                  {lifecycleModal.action} Subscription
                </h3>
                <p className="text-xs text-slate-500">{lifecycleModal.tenantName}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <p>
                <strong>Current State:</strong> {lifecycleModal.currentStatus}
              </p>
              <p>
                <strong>Consequence:</strong>{' '}
                {lifecycleModal.action === 'suspend'
                  ? 'Suspends active billing and restricts feature access while preserving all institution data.'
                  : lifecycleModal.action === 'cancel'
                  ? 'Cancels subscription and disables auto-renewal at period end.'
                  : lifecycleModal.action === 'renew'
                  ? 'Extends renewal term by 1 additional year.'
                  : 'Reactivates subscription to active billing standing.'}
              </p>
            </div>

            <form onSubmit={handleSubmitLifecycle} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Administrative Rationale (Logged to Audit Ledger)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved under contract amendment #2026-B"
                  value={lifecycleRationale}
                  onChange={(e) => setLifecycleRationale(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLifecycleModal(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLifecycle}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg shadow-xs hover:bg-slate-800 capitalize"
                >
                  {submittingLifecycle ? 'Processing...' : `Confirm ${lifecycleModal.action}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Change Tenant Subscription Plan */}
      {changeTenantPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Assign Subscription Tier</h3>
                <p className="text-xs text-slate-500">{changeTenantPlanModal.tenantName}</p>
              </div>
              <button onClick={() => setChangeTenantPlanModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Current Enrollment:{' '}
              <strong className="font-mono text-slate-900">
                {changeTenantPlanModal.studentCount.toLocaleString()} students
              </strong>
            </div>

            {planChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{planChangeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTenantPlanChange} className="space-y-3 text-xs">
              <div className="space-y-2">
                {plans.map((p) => (
                  <div
                    key={p.tier}
                    onClick={() => setTargetTier(p.tier)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      targetTier === p.tier
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{p.tier} ({p.name})</span>
                      <span className="font-mono">${p.monthlyFee}/mo</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Max Capacity: {p.maxStudents.toLocaleString()} students
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChangeTenantPlanModal(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTenantPlan}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submittingTenantPlan ? 'Validating Quotas...' : 'Confirm Plan Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
