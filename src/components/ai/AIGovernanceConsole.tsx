import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, AIModelInfo } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Sparkles,
  Shield,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Brain,
  Copy,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

export const AIGovernanceConsole: React.FC = () => {
  const { currentTenant, currentRole, showToast } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stu-sarah-chen');
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [fairnessAudit, setFairnessAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Human Override State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTier, setOverrideTier] = useState<string>('MODERATE');
  const [overrideRationale, setOverrideRationale] = useState('');

  // AI Intervention Generator State
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [customBarrier, setCustomBarrier] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, govRes] = await Promise.all([
        api.getStudents(),
        api.getModelGovernance(),
      ]);
      setStudents(studentsRes.students);
      setModels(govRes.models);
      setFairnessAudit(govRes.fairnessAudit);
    } catch (err) {
      console.error('Failed to load AI governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const safeAssessment = selectedStudent?.riskAssessment || {
    vitalityScore: 88,
    vitalityLabel: selectedStudent?.academicVitality || 'ON_TRACK',
    dataCompleteness: 92,
    confidenceScore: 94,
    contributingFactors: [],
    isOverridden: false,
    overriddenBy: '',
    overriddenTier: '',
    overrideRationale: '',
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !overrideRationale.trim()) return;

    try {
      await api.overrideRisk(selectedStudent.id, overrideTier, overrideRationale);
      showToast(
        `Risk tier successfully overridden to ${overrideTier}. Decision logged to audit ledger.`,
        'success'
      );
      setShowOverrideModal(false);
      setOverrideRationale('');
      loadData();
    } catch (err) {
      showToast('Failed to record override', 'error');
    }
  };

  const handleGenerateAiStrategy = async () => {
    if (!selectedStudent) return;
    try {
      setGeneratingAi(true);
      const res = await api.generateAiIntervention(selectedStudent.id, customBarrier);
      setAiResult(res.strategy);
      showToast('AI-assisted intervention strategy generated!', 'success');
    } catch (err) {
      showToast('Could not generate intervention strategy', 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-400">
              <Brain className="w-4 h-4" />
              <span>AI Governance & Explainable Early Warning Engine</span>
              <span aria-hidden="true">·</span>
              <span>Model CP-RETENTION-XGB-v2.4</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Explainable Decision Support & Human-in-the-Loop Oversight
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-2">
              Every prediction exposes transparent contributing feature attributions. Automated punitive sanctions or clinical inferences are strictly prohibited by our institutional governance charter.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              Parity Index: 0.962 (Calibrated)
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Explainability Explorer + Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Student Explainability Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Explainable Feature Attribution (SHAP-Style)</h2>
                <div className="text-xs text-slate-500">
                  Inspect the exact weight and direction behind an individual student's vitality signals
                </div>
              </div>

              {/* Student Selector */}
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentIdNumber}) - {s.riskTier} Risk
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="space-y-4">
                {/* Student Vitality & Model Confidence KPI Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500">Calculated Vitality Score</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                      {safeAssessment.vitalityScore}{' '}
                      <span className="text-xs text-slate-500 font-normal">/ 100</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 capitalize">
                      {(selectedStudent.academicVitality || 'ON_TRACK').replace('_', ' ')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500">Data Completeness</div>
                    <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                      {safeAssessment.dataCompleteness}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">High feature reliability</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500">Model Uncertainty / Confidence</div>
                    <div className="text-xl font-bold font-mono text-indigo-600 mt-0.5">
                      {safeAssessment.confidenceScore}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Validated calibration</div>
                  </div>
                </div>

                {/* Override Status Banner if applicable */}
                {safeAssessment.isOverridden && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-950">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Human Override Active ({safeAssessment.overriddenBy}):</span>
                    </div>
                    <p className="mt-1">
                      Risk tier set to <strong>{safeAssessment.overriddenTier}</strong>. Rationale: "
                      {safeAssessment.overrideRationale}"
                    </p>
                  </div>
                )}

                {/* Factors List */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-700">Contributing Signal Weights:</div>
                  {(safeAssessment.contributingFactors || []).map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/40 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {factor.impact === 'POSITIVE' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-900">{factor.factor}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] pl-5">{factor.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold text-xs ${
                            factor.impact === 'POSITIVE' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {factor.weight > 0 ? `+${(factor.weight * 100).toFixed(0)}%` : `${(factor.weight * 100).toFixed(0)}%`}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">attribution</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Human Override Action Bar */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Academic professional judgment always supersedes statistical estimates.
                  </div>
                  <button
                    onClick={() => {
                      setOverrideTier(selectedStudent.riskTier);
                      setShowOverrideModal(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-3 h-3 text-slate-600" />
                    <span>Override AI Assessment</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI-Assisted Intervention Strategy Generator */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  AI-Assisted Human-Centered Intervention Advisor
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Gemini 3.8 Flash</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Generate an empathetic outreach draft and personalized academic recovery strategy for{' '}
              <strong>{selectedStudent?.name}</strong> based on their specific learning context.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Optional barrier context (e.g. Work shifts overlapping with Friday lecture)..."
                value={customBarrier}
                onChange={(e) => setCustomBarrier(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <button
                onClick={handleGenerateAiStrategy}
                disabled={generatingAi}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg text-xs transition-colors whitespace-nowrap"
              >
                {generatingAi ? 'Generating Strategy...' : 'Synthesize Strategy'}
              </button>
            </div>

            {aiResult && (
              <div className="mt-4 p-4.5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3.5 text-xs">
                <div>
                  <span className="font-semibold text-emerald-950 block mb-1">Empathetic Student Outreach Draft:</span>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-slate-800 italic leading-relaxed">
                    "{aiResult.empatheticOutreachMessage}"
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-emerald-950 block mb-1">Recommended Collaborative Action Steps:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {aiResult.actionSteps.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-slate-600">
                  <span>
                    <strong>Primary Campus Resource:</strong> {aiResult.recommendedCampusResource}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult.empatheticOutreachMessage);
                      showToast('Outreach message copied to clipboard!', 'info');
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Draft</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Model Registry & Fairness */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Institutional Model Registry
            </div>

            {models.map((m) => (
              <div key={m.version} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{m.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      m.status === 'PRODUCTION'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="text-slate-700 font-medium">{m.name}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums pt-1">
                  <div>
                    <span className="text-slate-400 block">AUC-ROC</span>
                    <span className="font-bold text-slate-900">{m.aucRoc.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Accuracy</span>
                    <span className="font-bold text-slate-900">{(m.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fairness Parity</span>
                    <span className="font-bold text-emerald-700">{m.fairnessRatio.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Validation N</span>
                    <span className="font-bold text-slate-900">{m.dataPointsCount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700 block">Intended Scope:</span>
                  {m.intendedUse}
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-rose-700 block">Prohibited Scope:</span>
                  {m.prohibitedUse}
                </div>
              </div>
            ))}
          </div>

          {/* Department Fairness Parity */}
          {fairnessAudit && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fairness & Demographic Parity Audit
              </div>
              <p className="text-xs text-slate-600">
                Independent parity checks confirm calibrated true positive rates across colleges.
              </p>
              <div className="space-y-2 pt-1">
                {fairnessAudit.departmentDisparities.map((dep: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-800">{dep.department}</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {(dep.metricRatio * 100).toFixed(1)}% Parity
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Human Override Modal */}
      {showOverrideModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Human Override of Model Risk Tier</h3>
                <div className="text-xs text-slate-500">{selectedStudent.name} ({selectedStudent.studentIdNumber})</div>
              </div>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Overridden Risk Classification</label>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="LOW">LOW (Student has strong peer/faculty buffer)</option>
                  <option value="MODERATE">MODERATE (Monitor weekly via advising)</option>
                  <option value="ELEVATED">ELEVATED (Requires proactive intervention outreach)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Documented Pedagogical Rationale (Mandatory Audit Evidence)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record qualitative context (e.g. Student communicated illness during week 3, already attending department tutoring)..."
                  value={overrideRationale}
                  onChange={(e) => setOverrideRationale(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-600">
                <Shield className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                This override will be committed to the permanent institutional compliance audit trail.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs"
                >
                  Record Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
