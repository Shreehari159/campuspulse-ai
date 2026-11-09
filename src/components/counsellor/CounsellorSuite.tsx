import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SupportCase, ConfidentialCaseNote, CaseStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  ShieldAlert,
  Lock,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  FileText,
  UserCheck,
  Calendar,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export const CounsellorSuite: React.FC = () => {
  const { currentTenant, currentRole, currentUser, activeTab, setActiveTab, showToast } = useApp();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [caseNotes, setCaseNotes] = useState<ConfidentialCaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // New Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteType, setNoteType] = useState('SESSION');
  const [noteContent, setNoteContent] = useState('');

  // Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus>('PLAN_ACTIVE');
  const [followupDate, setFollowupDate] = useState('2026-10-31');

  const loadCases = async () => {
    try {
      setLoading(true);
      setErrorNotice(null);
      const res = await api.getCounsellorCases();
      setCases(res.cases);
      if (res.cases.length > 0 && !selectedCase) {
        selectCase(res.cases[0].id);
      }
    } catch (err: any) {
      console.warn('Counsellor access restricted:', err);
      setErrorNotice(err.message || 'Access restricted by clinical privacy boundaries.');
    } finally {
      setLoading(false);
    }
  };

  const selectCase = async (caseId: string) => {
    try {
      const res = await api.getCounsellorCase(caseId);
      setSelectedCase(res.supportCase);
      setCaseNotes(res.notes);
    } catch (err) {
      showToast('Error loading confidential case details', 'error');
    }
  };

  useEffect(() => {
    loadCases();
  }, [currentRole]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !noteContent.trim()) return;

    try {
      await api.addConfidentialNote(selectedCase.id, noteType, noteContent);
      showToast('Confidential clinical note encrypted and saved', 'success');
      setShowNoteModal(false);
      setNoteContent('');
      selectCase(selectedCase.id);
    } catch (err) {
      showToast('Failed to record note', 'error');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await api.updateCaseStatus(selectedCase.id, {
        status: newStatus,
        nextFollowupDate: followupDate,
      });
      showToast(`Case lifecycle transitioned to ${newStatus}`, 'success');
      setShowStatusModal(false);
      loadCases();
    } catch (err) {
      showToast('Failed to update case lifecycle', 'error');
    }
  };

  const handleToggleEscalation = async () => {
    if (!selectedCase) return;
    const nextEscalated = !selectedCase.isEscalated;
    try {
      await api.updateCaseStatus(selectedCase.id, { isEscalated: nextEscalated });
      showToast(
        nextEscalated
          ? 'Case flagged for Senior Clinical Supervisor human review'
          : 'Case de-escalated to routine counseling protocol',
        nextEscalated ? 'error' : 'info'
      );
      selectCase(selectedCase.id);
      loadCases();
    } catch (err) {
      showToast('Error modifying escalation status', 'error');
    }
  };

  if (errorNotice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Confidential Mental Health Boundary Enforced</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {errorNotice} To view confidential case files and clinical intake records, switch to the{' '}
          <strong className="text-slate-900">Counsellor</strong> role using the top-right persona switcher.
        </p>
      </div>
    );
  }

  const lifecycleStages: CaseStatus[] = ['REFERRED', 'INTAKE', 'PLAN_ACTIVE', 'FOLLOWUP_DUE', 'RESOLVED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Strict Clinical Confidentiality & Crisis Safety Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  HIPAA / FERPA Mental Health Boundary
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">{currentUser?.name || 'Dr. Rachel Adams, Psy.D.'}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
                {activeTab === 'crisis_protocol'
                  ? 'Emergency Response & Clinical Crisis Protocols'
                  : 'Confidential Case Management & Clinical Operations'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800/80 rounded-lg px-3.5 py-2 text-xs text-rose-200">
            <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">24/7 National Crisis Line:</span> Dial 988 or text HOME to 741741
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          <strong className="text-white">Strict Ethical Separation:</strong> Records in this suite are firewalled from academic rosters and cannot be viewed by faculty, course instructors, or university billing personnel. AI models are strictly prohibited from inferring psychological conditions or modifying clinical treatment paths.
        </div>
      </div>

      {/* 2. Main Case Directory & Detail Workspace OR Crisis Safety Protocols */}
      {activeTab === 'crisis_protocol' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-rose-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Institutional Crisis Intervention & Safety Response Matrix</h2>
                  <p className="text-xs text-slate-500">
                    Mandatory clinical safety protocols, immediate harm de-escalation, and FERPA emergency disclosure rules.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Active Protocol Standard v3.2
              </span>
            </div>

            {/* Emergency Hotlines Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">24/7 Suicide & Crisis Lifeline</span>
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-rose-950">988</div>
                <p className="text-[11px] text-rose-700">Free, confidential support available nationwide via phone or text 24 hours a day.</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Crisis Text Line</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-950">HOME to 741741</div>
                <p className="text-[11px] text-amber-700">Immediate text communication with trained crisis counselors for acute anxiety or trauma.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Campus Emergency Response</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">Ext. 5555 / 911</div>
                <p className="text-[11px] text-slate-300">Direct link to Campus Safety and Local Emergency Medical Services (EMS) for physical safety.</p>
              </div>
            </div>

            {/* 3-Tier Clinical Triage Matrix */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900">Immediate Harm Risk Stratification & Protocol Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>Level 1: Routine / Stress</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800">Standard</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Academic pressure, homesickness, sleep disruption without intent or self-harm thoughts.</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] pt-1">
                    <li>Bi-weekly supportive counseling sessions</li>
                    <li>Referral to academic success coaching</li>
                    <li>Stress regulation and sleep hygiene tools</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-amber-900">
                    <span>Level 2: Elevated / Moderate</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800">Elevated</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">Significant emotional distress, severe panic attacks, passive suicidal ideation without plan or intent.</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] pt-1">
                    <li>Same-day clinical triage consultation</li>
                    <li>Comprehensive Columbia Suicide Severity Scale (C-SSRS)</li>
                    <li>Co-created written Safety Support Plan</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 space-y-2">
                  <div className="flex items-center justify-between font-semibold text-rose-900">
                    <span>Level 3: Imminent Harm</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-100 text-rose-800">Emergency</span>
                  </div>
                  <p className="text-rose-800 text-[11px]">Active suicidal intent with plan or means, severe psychosis, or acute danger to self or others.</p>
                  <ul className="list-disc list-inside space-y-1 text-rose-900 text-[11px] pt-1 font-medium">
                    <li>Do not leave student unattended under any circumstances</li>
                    <li>Initiate warm physical escort to emergency medical services</li>
                    <li>Invoke FERPA Health & Safety Emergency exception</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Protocols & Compliance Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>FERPA Emergency Disclosure & Institutional Duty to Care Exception</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Under FERPA 34 CFR § 99.36, postsecondary institutions may disclose personally identifiable information from an education record to appropriate parties in connection with an emergency if knowledge of the information is necessary to protect the health or safety of the student or other individuals. All emergency disclosures must be documented in the student case ledger within 24 hours.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Confidential Case Directory */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Assigned Case Queue</h2>
                <div className="text-[11px] text-slate-500">Active counseling support cases</div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                {cases.length} Records
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCase(c.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedCase?.id === c.id ? 'bg-amber-50/50 border-l-2 border-amber-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs text-slate-900">{c.studentName}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {c.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {c.studentIdNumber} · Intake: {c.intakeDate}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {c.presentingConcernSummary}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{c.confidentialNotesCount} session notes</span>
                    <span>Next: {c.nextFollowupDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Case Detail & Clinical Notes */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCase ? (
            <>
              {/* Case Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>Case #{selectedCase.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>Referral: {selectedCase.referralSource}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedCase.studentName}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleEscalation}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                        selectedCase.isEscalated
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                      {selectedCase.isEscalated ? 'High Care Protocol Active' : 'Flag for Supervisor Review'}
                    </button>

                    <button
                      onClick={() => {
                        setNewStatus(selectedCase.status);
                        setShowStatusModal(true);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                    >
                      Advance Status
                    </button>
                  </div>
                </div>

                {/* Case Lifecycle Stepper */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Case Lifecycle Progression
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {lifecycleStages.map((stg, idx) => {
                      const isCurrent = selectedCase.status === stg;
                      const isPast = lifecycleStages.indexOf(selectedCase.status) >= idx;
                      return (
                        <div
                          key={stg}
                          className={`p-2 rounded text-[11px] font-mono font-medium transition-colors ${
                            isCurrent
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : isPast
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {stg.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3.5 text-xs text-slate-700 space-y-1">
                  <span className="font-semibold text-slate-900 block">Presenting Concern (Non-Diagnostic Administrative Summary):</span>
                  <p>{selectedCase.presentingConcernSummary}</p>
                </div>
              </div>

              {/* Confidential Clinical Notes Ledger */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Encrypted Clinical Session Notes</h3>
                    <div className="text-xs text-slate-500">
                      Privileged record · Restricted to assigned licensed clinicians
                    </div>
                  </div>

                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Session Note</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {caseNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-700 text-[10px] uppercase">
                            {note.noteType} NOTE
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-700 font-medium">{note.counsellorName}</span>
                        </div>
                        <span className="font-mono text-[11px]">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-sans">{note.content}</p>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Access strictly audited</span>
                        <span>Privileged Clinical Record</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No case selected. Choose a record from the queue to view details.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Confidential Clinical Note</h3>
                <div className="text-xs text-slate-500">Case #{selectedCase.id} · {selectedCase.studentName}</div>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Note Type</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="SESSION">Individual Clinical Session</option>
                  <option value="INTAKE">Intake Assessment & History</option>
                  <option value="COLLABORATION">Interdisciplinary Collaboration (Permitted)</option>
                  <option value="CLOSURE">Case Resolution & Transition Summary</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Confidential Clinical Observation</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record therapeutic progress, self-regulation strategies, and mutually agreed support steps..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[11px] text-amber-900">
                <Lock className="w-3.5 h-3.5 inline mr-1" />
                This entry is isolated from student transcripts, LMS records, and faculty views.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs"
                >
                  Encrypt & Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Advance Case Lifecycle</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Lifecycle State</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="REFERRED">REFERRED (Pending Intake Review)</option>
                  <option value="INTAKE">INTAKE (Initial Consultation Scheduled)</option>
                  <option value="PLAN_ACTIVE">PLAN_ACTIVE (Therapeutic Support in Progress)</option>
                  <option value="FOLLOWUP_DUE">FOLLOWUP_DUE (Mid-term Check-in Scheduled)</option>
                  <option value="RESOLVED">RESOLVED (Support Objectives Met / Closed)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Next Scheduled Follow-up</label>
                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs"
                >
                  Update Lifecycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
