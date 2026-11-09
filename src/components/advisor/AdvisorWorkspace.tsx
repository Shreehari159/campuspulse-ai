import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, InterventionPlan } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  X,
  Target,
  Sparkles,
} from 'lucide-react';

export const AdvisorWorkspace: React.FC = () => {
  const { currentTenant, currentUser, activeTab, setActiveTab, showToast } = useApp();
  const [advisees, setAdvisees] = useState<Student[]>([]);
  const [plans, setPlans] = useState<InterventionPlan[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // New Intervention Plan modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planStudentId, setPlanStudentId] = useState('');
  const [planGoalTitle, setPlanGoalTitle] = useState('');
  const [planBarrier, setPlanBarrier] = useState('');
  const [planAction1, setPlanAction1] = useState('');
  const [planAction2, setPlanAction2] = useState('');
  const [planTargetDate, setPlanTargetDate] = useState('2026-11-30');

  const loadData = async () => {
    try {
      setLoading(true);
      const [adviseesRes, plansRes] = await Promise.all([
        api.getAdvisees(),
        api.getInterventionPlans(),
      ]);
      setAdvisees(adviseesRes.advisees);
      setPlans(plansRes.plans);
    } catch (err) {
      console.error('Failed to load advisor workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planStudentId || !planGoalTitle.trim()) return;

    try {
      const actions = [planAction1, planAction2].filter((a) => a.trim().length > 0);
      await api.createInterventionPlan({
        studentId: planStudentId,
        goalTitle: planGoalTitle,
        identifiedBarrier: planBarrier,
        agreedActions: actions.length > 0 ? actions : ['Weekly advising touchpoint'],
        responsibleParty: 'Student + Advisor',
        targetCompletionDate: planTargetDate,
      });

      showToast('Collaborative Academic Success Plan created!', 'success');
      setShowPlanModal(false);
      setPlanGoalTitle('');
      setPlanBarrier('');
      setPlanAction1('');
      setPlanAction2('');
      loadData();
    } catch (err) {
      showToast('Failed to create plan', 'error');
    }
  };

  const handleToggleAcknowledge = async (plan: InterventionPlan) => {
    try {
      await api.updateInterventionPlan(plan.id, {
        studentAcknowledged: !plan.studentAcknowledged,
        progressPercent: plan.studentAcknowledged ? plan.progressPercent : Math.max(plan.progressPercent, 25),
      });
      showToast(
        !plan.studentAcknowledged ? 'Student collaborative agreement acknowledged!' : 'Signoff status updated',
        'info'
      );
      loadData();
    } catch (err) {
      showToast('Error updating plan', 'error');
    }
  };

  const filteredAdvisees = advisees.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || s.riskTier === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Academic Advising Hub</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser?.name || 'Elena Rostova, M.Ed.'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {activeTab === 'interventions'
              ? 'Collaborative Success Plans & Intervention Milestones'
              : 'Advisee Cohort Triage & Collaborative Success Planning'}
          </h1>
        </div>

        <button
          onClick={() => {
            setPlanStudentId(advisees[0]?.id || 'stu-sarah-chen');
            setShowPlanModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Collaborative Success Plan</span>
        </button>
      </div>

      {/* Advisee KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Assigned Advisees</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {advisees.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">College of Sciences</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Priority Support Needed</div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {advisees.filter((s) => s.riskTier === 'ELEVATED' || s.riskTier === 'MODERATE').length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Attendance or pacing friction</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Active Success Plans</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {plans.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Student co-signed</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Avg Time-to-First Contact</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            1.4 <span className="text-xs font-normal text-slate-500">Days</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Exceeds 48h benchmark</div>
        </div>
      </div>

      {/* Main Grid: Advisees List + Active Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Advisee List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Advisee Cohort Directory</h2>
                <p className="text-xs text-slate-500">
                  Select a student to inspect their 360 degree progress and contributing signals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, ID, major..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-56 focus:outline-emerald-600"
                  />
                </div>

                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-white"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="ELEVATED">Elevated</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAdvisees.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`p-4 sm:p-5 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 ${
                    selectedStudent?.id === s.id ? 'bg-emerald-50/40 border-l-2 border-emerald-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center shrink-0">
                      {s.avatarInitials}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono">{s.studentIdNumber}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {s.program} · Year {s.yearOfStudy} (Sem {s.currentSemester})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0">
                    <div className="text-right">
                      <div className="text-slate-400 text-[11px]">GPA</div>
                      <div className="font-bold text-slate-900">{s.cumulativeGpa.toFixed(2)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-400 text-[11px]">Vitality</div>
                      <div
                        className={`font-semibold ${
                          s.academicVitality === 'ON_TRACK'
                            ? 'text-emerald-600'
                            : s.academicVitality === 'NEEDS_FOCUS'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {s.academicVitality.replace('_', ' ')}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Student 360 Quick Inspector OR Active Plans */}
        <div className="space-y-6">
          {selectedStudent ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Student 360 Quick View
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">Degree Progress:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedStudent.totalCreditsEarned} / {selectedStudent.targetDegreeCredits} Credits (
                    {Math.round((selectedStudent.totalCreditsEarned / selectedStudent.targetDegreeCredits) * 100)}%)
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-800 block mb-1.5">Enrolled Course Sections:</span>
                  <div className="space-y-1.5">
                    {selectedStudent.enrollments.map((e) => (
                      <div
                        key={e.id}
                        className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-800">{e.courseCode}</span>
                          <span className="text-slate-500 block text-[11px]">{e.courseName}</span>
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          <span className="font-bold text-slate-900">{e.currentGrade}</span>
                          <span className="text-slate-500 block text-[11px]">{e.attendanceRate}% att.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-800 block mb-1.5">Early Warning Contributing Signals:</span>
                  <div className="space-y-1.5">
                    {selectedStudent.riskAssessment.contributingFactors.map((f, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded text-[11px] border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{f.factor}</span>
                          <span
                            className={`font-mono font-bold ${
                              f.impact === 'POSITIVE' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {f.weight > 0 ? `+${(f.weight * 100).toFixed(0)}%` : `${(f.weight * 100).toFixed(0)}%`}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setPlanStudentId(selectedStudent.id);
                      setPlanGoalTitle(`Course recovery pacing for ${selectedStudent.enrollments[0]?.courseCode || 'courses'}`);
                      setShowPlanModal(true);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors"
                  >
                    Draft Collaborative Success Plan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-xs text-slate-500">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>Select any advisee from the directory to inspect their 360 degree progress and early warning indicators.</p>
            </div>
          )}

          {/* Active Collaborative Plans */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Collaborative Plans</h3>
                <div className="text-xs text-slate-500">Student + Advisor agreements</div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{plans.length}</span>
            </div>

            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{p.goalTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Advisee: {p.studentName}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                      {p.progressPercent}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200/80">
                    <span className="font-medium text-slate-800">Barrier:</span> {p.identifiedBarrier}
                  </p>

                  <div className="space-y-1 text-xs text-slate-700">
                    <span className="font-medium text-slate-800 block text-[11px]">Agreed Actions:</span>
                    {p.agreedActions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleAcknowledge(p)}
                      className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${p.studentAcknowledged ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>{p.studentAcknowledged ? 'Student Co-signed' : 'Pending Student Signoff'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">Due: {p.targetCompletionDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Collaborative Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Collaborative Academic Success Plan</h3>
                <div className="text-xs text-slate-500">Student + Advisor Partnership</div>
              </div>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Advisee</label>
                <select
                  value={planStudentId}
                  onChange={(e) => setPlanStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {advisees.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentIdNumber}) - {s.program}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Collaborative Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus prerequisite recovery and study routine stabilization"
                  value={planGoalTitle}
                  onChange={(e) => setPlanGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Identified Academic Barrier</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Work schedule conflicts with morning lecture; lab pacing overlap."
                  value={planBarrier}
                  onChange={(e) => setPlanBarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-slate-700">Agreed Action Steps</label>
                <input
                  type="text"
                  placeholder="Action 1: Attend department tutoring on Tuesdays 3 PM"
                  value={planAction1}
                  onChange={(e) => setPlanAction1(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Action 2: Bi-weekly 15-minute check-in with advisor"
                  value={planAction2}
                  onChange={(e) => setPlanAction2(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Completion Milestone</label>
                <input
                  type="date"
                  value={planTargetDate}
                  onChange={(e) => setPlanTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
                >
                  Save Collaborative Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
