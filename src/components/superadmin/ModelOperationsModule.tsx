import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIModelInfo } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Brain,
  Sparkles,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  RotateCcw,
  Play,
  TrendingUp,
  Cpu,
  Layers,
  FileCheck,
  X,
  Gauge,
  Sliders,
} from 'lucide-react';

export const ModelOperationsModule: React.FC = () => {
  const { showToast } = useApp();
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [activeModel, setActiveModel] = useState<AIModelInfo | null>(null);
  const [healthTelemetry, setHealthTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Promote / Rollback Modal State
  const [actionModal, setActionModal] = useState<{
    type: 'PROMOTE' | 'ROLLBACK';
    model: AIModelInfo;
  } | null>(null);
  const [actionRationale, setActionRationale] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Model Details Drawer
  const [inspectModel, setInspectModel] = useState<AIModelInfo | null>(null);

  // Smoke Test / Live Inference State
  const [smokeTestResult, setSmokeTestResult] = useState<any>(null);
  const [runningSmokeTest, setRunningSmokeTest] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modelsRes, healthRes] = await Promise.all([
        api.getModels(),
        api.getModelHealth(),
      ]);
      setModels(modelsRes.models);
      setActiveModel(modelsRes.activeModel);
      setHealthTelemetry(healthRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load model registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Promote or Rollback
  const handleConfirmDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;
    if (actionRationale.trim().length < 5) {
      showToast('A documented governance rationale (min 5 characters) is required.', 'info');
      return;
    }

    try {
      setSubmittingAction(true);
      if (actionModal.type === 'PROMOTE') {
        const res = await api.promoteModel(actionModal.model.version, actionRationale);
        showToast(
          `Model ${actionModal.model.code} (${actionModal.model.version}) successfully promoted to PRODUCTION!`,
          'success'
        );
        setActiveModel(res.activeModel);
        setModels(res.models);
      } else {
        const res = await api.rollbackModel(actionModal.model.version, actionRationale);
        showToast(
          `Production model safely rolled back to ${actionModal.model.version}.`,
          'success'
        );
        setActiveModel(res.activeModel);
        setModels(res.models);
      }
      setActionModal(null);
      setActionRationale('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to execute deployment action', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Run Smoke Test
  const handleRunSmokeTest = async () => {
    try {
      setRunningSmokeTest(true);
      const res = await api.testModelInference();
      setSmokeTestResult(res);
      showToast('Live test inference completed in ' + res.inferenceLatencyMs + 'ms', 'success');
    } catch (err: any) {
      showToast(err.message || 'Smoke test failed', 'error');
    } finally {
      setRunningSmokeTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Model Operations (MLOps) & Safe Serving Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Model version registry, production serving health, feature attribution attestation, and governance-controlled safe rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            Serving: {activeModel?.code || 'CP-RETENTION-XGB-v2.4'}
          </span>
        </div>
      </div>

      {/* Real-Time Telemetry & Drift Monitoring Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Inference Status</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {healthTelemetry?.service || 'ONLINE'}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {healthTelemetry?.uptime || '99.98%'} Availability SLA
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>P95 Serving Latency</span>
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {healthTelemetry?.latencyP95 || '48ms'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Single-tenant partitioned edge</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Population Stability (PSI)</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {healthTelemetry?.driftIndexPsi || 0.042}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            {healthTelemetry?.driftStatus === 'NOMINAL_NO_DRIFT' ? 'Nominal · No Drift (< 0.2)' : 'Drift Alert'}
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Last Batch Scoring</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {healthTelemetry?.lastBatchScoringJob?.recordsScored?.toLocaleString() || '14,250'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {healthTelemetry?.lastBatchScoringJob?.latencyMs || 3120}ms · Status: SUCCESS
          </div>
        </div>
      </div>

      {/* Model Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-600" />
              <span>Registered Machine Learning Models & Checkpoints</span>
            </h3>
            <p className="text-xs text-slate-500">
              Validated statistical architectures with demographic parity ratio and AUC-ROC evaluation metrics.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{models.length} Registered Checkpoints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Model & Architecture</th>
                <th className="py-3 px-4 text-center">Version</th>
                <th className="py-3 px-4 text-center">Pipeline State</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">AUC-ROC</th>
                <th className="py-3 px-4 text-right">F1 Score</th>
                <th className="py-3 px-4 text-right">Fairness Parity</th>
                <th className="py-3 px-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading registered models...
                  </td>
                </tr>
              ) : (
                models.map((m) => (
                  <tr key={m.version} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{m.name}</div>
                      <div className="font-mono text-[10px] text-slate-400 font-normal">{m.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {m.version}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'PRODUCTION'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : m.status === 'STAGING'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status === 'PRODUCTION' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800">
                      {(m.accuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {m.aucRoc.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {m.f1Score ? m.f1Score.toFixed(3) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      {m.fairnessRatio.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectModel(m)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded"
                          title="Inspect Model Card"
                        >
                          Model Card
                        </button>

                        {m.status === 'STAGING' && (
                          <button
                            onClick={() => {
                              setActionModal({ type: 'PROMOTE', model: m });
                              setActionRationale('');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs"
                            title="Promote to Production"
                          >
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                            <span>Promote</span>
                          </button>
                        )}

                        {m.status === 'DEPRECATED' && (
                          <button
                            onClick={() => {
                              setActionModal({ type: 'ROLLBACK', model: m });
                              setActionRationale('');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                            title="Rollback to this version"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-600" />
                            <span>Rollback</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Inference & Smoke Prediction Console */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Active Inference Engine Smoke Test & SHAP Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Execute a synthetic test payload against the active production model to inspect calibrated probability and SHAP attribution vectors.
            </p>
          </div>

          <button
            onClick={handleRunSmokeTest}
            disabled={runningSmokeTest}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shadow-xs transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>{runningSmokeTest ? 'Executing Inference...' : 'Run Test Prediction'}</span>
          </button>
        </div>

        {smokeTestResult && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Model Serving</span>
                <span className="font-mono font-bold text-slate-900">{smokeTestResult.modelCode}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Execution Latency</span>
                <span className="font-mono font-bold text-emerald-600">{smokeTestResult.inferenceLatencyMs} ms</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Calibrated Probability</span>
                <span className="font-mono font-bold text-slate-900">
                  {(smokeTestResult.calibratedProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Assigned Risk & Vitality</span>
                <span className="font-bold text-amber-700">
                  {smokeTestResult.assignedRiskTier} · {smokeTestResult.assignedVitality}
                </span>
              </div>
            </div>

            {/* Attribution Breakdown */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Feature Attributions (SHAP Directional Weights):</div>
              <div className="space-y-2">
                {smokeTestResult.attributionWeights?.map((attr: any, i: number) => {
                  const isAccelerator = attr.direction === 'RISK_ACCELERATOR';
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{attr.factor}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                            isAccelerator ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {attr.weight > 0 ? `+${attr.weight}` : attr.weight}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isAccelerator ? 'Risk Accelerator' : 'Supportive Buffer'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Promote or Rollback Confirmation with Mandatory Governance Rationale */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  actionModal.type === 'PROMOTE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {actionModal.type === 'PROMOTE' ? <ArrowUpRight className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {actionModal.type === 'PROMOTE'
                    ? `Promote Model ${actionModal.model.version} to Production`
                    : `Roll Back Production Model to ${actionModal.model.version}`}
                </h3>
                <p className="text-xs text-slate-500">{actionModal.model.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">AI Governance Compliance Directive:</p>
              <p>
                Changing the production inference model affects all tenant early warning predictions and advising triage scoring. A documented rationale is logged immutably to the Platform Security Audit Ledger.
              </p>
            </div>

            <form onSubmit={handleConfirmDeployment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Governance Rationale & Validation Sign-off <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain benchmark validation results, fairness evaluation, and justification for this production model state change..."
                  value={actionRationale}
                  onChange={(e) => setActionRationale(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || actionRationale.trim().length < 5}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 shadow-xs disabled:opacity-50"
                >
                  {submittingAction
                    ? 'Updating Registry...'
                    : actionModal.type === 'PROMOTE'
                    ? 'Confirm Production Promotion'
                    : 'Confirm Rollback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Model Card Inspector */}
      {inspectModel && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{inspectModel.name}</h3>
                <div className="text-xs font-mono text-slate-500">{inspectModel.code} · Version {inspectModel.version}</div>
              </div>
              <button onClick={() => setInspectModel(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Trained Validation Cohort:</span>
                <span className="text-slate-600">{inspectModel.trainedOnCohort}</span>
              </div>

              <div className="border border-slate-200 p-3 rounded-lg space-y-1">
                <span className="font-bold text-slate-800 block">Intended Purpose & Guidance:</span>
                <span className="text-slate-600">{inspectModel.intendedUse}</span>
              </div>

              <div className="border border-rose-200 bg-rose-50/50 p-3 rounded-lg space-y-1 text-rose-900">
                <span className="font-bold block">Explicitly Prohibited Uses:</span>
                <span>{inspectModel.prohibitedUse}</span>
              </div>

              <div className="border border-slate-200 p-3 rounded-lg space-y-1">
                <span className="font-bold text-slate-800 block">Known Limitations & Fallback Behavior:</span>
                <span className="text-slate-600">{inspectModel.knownLimitations}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-400">Accuracy</div>
                  <div className="font-mono font-bold text-slate-900">{(inspectModel.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-400">AUC-ROC</div>
                  <div className="font-mono font-bold text-slate-900">{inspectModel.aucRoc.toFixed(3)}</div>
                </div>
                <div className="border border-slate-200 p-2 rounded text-center">
                  <div className="text-[10px] text-slate-400">Fairness Ratio</div>
                  <div className="font-mono font-bold text-emerald-600">{inspectModel.fairnessRatio.toFixed(3)}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectModel(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Model Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
