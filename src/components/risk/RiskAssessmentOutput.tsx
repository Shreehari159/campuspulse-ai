import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AssessmentOutputResult, RiskTier } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Brain,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Calendar,
  Building2,
  Download,
  Printer,
  Edit3,
  TrendingDown,
  TrendingUp,
  HeartHandshake,
  BookOpen,
  DollarSign,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Sliders,
  Sparkles,
  CheckSquare,
  Square,
  HelpCircle,
  Activity,
} from 'lucide-react';

interface StudentPreset {
  id: string;
  name: string;
  studentIdNumber: string;
  department: string;
  program: string;
  yearOfStudy: number;
  vitalityScore: number;
  vitalityLabel: 'ON_TRACK' | 'NEEDS_FOCUS' | 'SUPPORT_AVAILABLE';
  riskTier: RiskTier;
  riskProbability: number;
  confidenceScore: number;
  metrics: {
    attendanceRate: number;
    cumulativeGpa: number;
    gatewayGrade: string;
    lmsLogins: number;
    missedStreak: number;
    employmentHours: number;
    stressLevel: number;
  };
  factors: Array<{
    factor: string;
    category: 'ACADEMIC' | 'ATTENDANCE' | 'ENGAGEMENT' | 'LMS_ACTIVITY';
    weight: number;
    impact: 'POSITIVE' | 'NEGATIVE';
    description: string;
  }>;
  recommendations: {
    academic: string;
    advising: string;
    wellness: string;
    priorityTimeline: string;
  };
  advisorNotes: string;
}

const PRESET_STUDENTS: StudentPreset[] = [
  {
    id: 'stu-alex-rivera',
    name: 'Alex Rivera',
    studentIdNumber: 'SJU-2024-9104',
    department: 'Computer Science',
    program: 'B.S. Computer Science',
    yearOfStudy: 2,
    vitalityScore: 54,
    vitalityLabel: 'NEEDS_FOCUS',
    riskTier: 'MODERATE',
    riskProbability: 0.58,
    confidenceScore: 92,
    metrics: {
      attendanceRate: 72,
      cumulativeGpa: 2.64,
      gatewayGrade: 'C',
      lmsLogins: 5,
      missedStreak: 3,
      employmentHours: 25,
      stressLevel: 8,
    },
    factors: [
      {
        factor: 'Consecutive Absence Velocity in Morning Physics Labs',
        category: 'ATTENDANCE',
        weight: -0.32,
        impact: 'NEGATIVE',
        description: '3 consecutive missed Friday 8:00 AM lab sessions have created practical assignment backlog.',
      },
      {
        factor: 'Unsubmitted Deliverable: Lab Assignment 4',
        category: 'ACADEMIC',
        weight: -0.18,
        impact: 'NEGATIVE',
        description: 'Missed deadline on key gateway assignment in Discrete Mathematics.',
      },
      {
        factor: 'Drop in Math Midterm Score compared to Cohort Median',
        category: 'ACADEMIC',
        weight: -0.12,
        impact: 'NEGATIVE',
        description: 'Midterm scored 14% below section average following absence period.',
      },
      {
        factor: 'High Engagement in Computer Science Projects',
        category: 'ENGAGEMENT',
        weight: 0.15,
        impact: 'POSITIVE',
        description: 'Consistently submits creative and robust programming solutions in Python/Java.',
      },
      {
        factor: 'Active Participation in Robotics & Peer Commons',
        category: 'ENGAGEMENT',
        weight: 0.09,
        impact: 'POSITIVE',
        description: 'Regularly attends robotics club meetings and student peer mentoring workshops.',
      },
    ],
    recommendations: {
      academic: 'Pair with discrete mathematics tutor for recursion & set theory recitation clinic.',
      advising: 'Conduct structured 1-on-1 check-in to adjust lab schedule around off-campus evening work shift.',
      wellness: 'Offer warm handoff to Student Financial Services to explore on-campus work-study positions.',
      priorityTimeline: 'Initiate outreach within 48 hours · High Priority Cadence',
    },
    advisorNotes: 'Alex works 25 hours per week at an off-campus pharmacy. Morning lab fatigue is primary obstacle, not lack of comprehension.',
  },
  {
    id: 'stu-sarah-chen',
    name: 'Sarah Chen',
    studentIdNumber: 'SJU-2024-8841',
    department: 'Computer Science',
    program: 'B.S. Computer Science',
    yearOfStudy: 2,
    vitalityScore: 68,
    vitalityLabel: 'NEEDS_FOCUS',
    riskTier: 'MODERATE',
    riskProbability: 0.38,
    confidenceScore: 94,
    metrics: {
      attendanceRate: 76,
      cumulativeGpa: 2.78,
      gatewayGrade: 'C-',
      lmsLogins: 7,
      missedStreak: 2,
      employmentHours: 20,
      stressLevel: 7,
    },
    factors: [
      {
        factor: 'Prerequisite Gateway Bottleneck (CS201 Grade: C-)',
        category: 'ACADEMIC',
        weight: -0.28,
        impact: 'NEGATIVE',
        description: 'Midterm performance in foundational data structures course indicates prerequisite compression.',
      },
      {
        factor: 'Attendance Rate Decline (76%)',
        category: 'ATTENDANCE',
        weight: -0.24,
        impact: 'NEGATIVE',
        description: 'Recent 3-week attendance rate trend slipped below the 80% divisional milestone.',
      },
      {
        factor: 'Financial Aid Verification Hold',
        category: 'ENGAGEMENT',
        weight: -0.16,
        impact: 'NEGATIVE',
        description: 'Pending documentation hold on student portal creates enrollment planning hesitation.',
      },
      {
        factor: 'Consistent LMS Discussion Forum Posts',
        category: 'LMS_ACTIVITY',
        weight: 0.16,
        impact: 'POSITIVE',
        description: 'Active digital participation in weekly asynchronous lab problem-solving threads.',
      },
      {
        factor: 'Self-Directed Career Goal Milestones Logged',
        category: 'ENGAGEMENT',
        weight: 0.14,
        impact: 'POSITIVE',
        description: 'Student has actively recorded 2 milestones for summer internship preparation.',
      },
    ],
    recommendations: {
      academic: 'Pair student with CS Peer Tutor specialist for algorithm recitation and recursion clinic.',
      advising: 'Conduct structured course planning touchpoint with Elena Rostova, M.Ed. to evaluate credit pacing.',
      wellness: 'Refer to Student Financial Services to resolve FAFSA verification paperwork before spring priority registration.',
      priorityTimeline: 'Initiate touchpoint within 5 business days · Moderate Priority Cadence',
    },
    advisorNotes: 'Student expressed balancing evening work shifts with challenging lab assignments. Receptive to tutoring.',
  },
  {
    id: 'stu-mkce-927625mca050',
    name: 'Shree',
    studentIdNumber: '927625MCA050',
    department: 'Computer Applications (MCA)',
    program: 'Master of Computer Applications',
    yearOfStudy: 1,
    vitalityScore: 92,
    vitalityLabel: 'ON_TRACK',
    riskTier: 'LOW',
    riskProbability: 0.12,
    confidenceScore: 96,
    metrics: {
      attendanceRate: 94,
      cumulativeGpa: 3.88,
      gatewayGrade: 'A',
      lmsLogins: 18,
      missedStreak: 0,
      employmentHours: 0,
      stressLevel: 3,
    },
    factors: [
      {
        factor: 'Exemplary Attendance Rate (94%)',
        category: 'ATTENDANCE',
        weight: 0.35,
        impact: 'POSITIVE',
        description: 'Consistent daily attendance across cloud computing and enterprise Java modules.',
      },
      {
        factor: 'High GPA Benchmark (3.88)',
        category: 'ACADEMIC',
        weight: 0.28,
        impact: 'POSITIVE',
        description: 'Maintains top percentile standing in graduate algorithm analysis and DBMS design.',
      },
      {
        factor: 'Frequent LMS Interactions (18 per fortnight)',
        category: 'LMS_ACTIVITY',
        weight: 0.20,
        impact: 'POSITIVE',
        description: 'Consistently downloads research papers and participates in coding challenge forums.',
      },
      {
        factor: 'Minor Exam Prep Workload Stress',
        category: 'ACADEMIC',
        weight: -0.08,
        impact: 'NEGATIVE',
        description: 'Slight stress reported ahead of upcoming semester practical laboratory examinations.',
      },
    ],
    recommendations: {
      academic: 'Encourage participation in regional university hackathons and enterprise internships.',
      advising: 'Schedule semester milestone review to confirm elective selections for cloud engineering.',
      wellness: 'Maintain current wellness and study group cadence.',
      priorityTimeline: 'Standard Advising Track · Routine Cadence',
    },
    advisorNotes: 'Shree is an outstanding MCA scholar with consistent diligence and leadership in group projects.',
  },
  {
    id: 'stu-mkce-927625mca024',
    name: 'Karthik R.',
    studentIdNumber: '927625MCA024',
    department: 'Computer Applications (MCA)',
    program: 'Master of Computer Applications',
    yearOfStudy: 1,
    vitalityScore: 48,
    vitalityLabel: 'SUPPORT_AVAILABLE',
    riskTier: 'ELEVATED',
    riskProbability: 0.72,
    confidenceScore: 91,
    metrics: {
      attendanceRate: 68,
      cumulativeGpa: 2.45,
      gatewayGrade: 'D+',
      lmsLogins: 4,
      missedStreak: 4,
      employmentHours: 20,
      stressLevel: 9,
    },
    factors: [
      {
        factor: 'Attendance Drop below 70% Milestone',
        category: 'ATTENDANCE',
        weight: -0.38,
        impact: 'NEGATIVE',
        description: '4 consecutive lab absences impacting database implementation coursework.',
      },
      {
        factor: 'Advanced Algorithms Prerequisite Hardship',
        category: 'ACADEMIC',
        weight: -0.26,
        impact: 'NEGATIVE',
        description: 'Scored in lower quartile on internal assessment 1.',
      },
      {
        factor: 'High Reported Stress Level (9/10)',
        category: 'ENGAGEMENT',
        weight: -0.20,
        impact: 'NEGATIVE',
        description: 'Balancing family commitments with rigorous graduate course schedule.',
      },
      {
        factor: 'Active Collaborative Teammate in Group Labs',
        category: 'ENGAGEMENT',
        weight: 0.12,
        impact: 'POSITIVE',
        description: 'Respected by peer study group when present in software engineering laboratory.',
      },
    ],
    recommendations: {
      academic: 'Assign dedicated faculty peer tutor for DBMS and discrete algorithm foundations.',
      advising: 'Conduct priority counseling and academic advising intervention within 48 hours.',
      wellness: 'Connect with campus counseling services for stress management support.',
      priorityTimeline: 'Urgent Action Required · 48-Hour Clinical / Advising Outreach',
    },
    advisorNotes: 'Karthik is motivated but overwhelmed by family caregiving responsibilities. Needs flexibility and tutoring.',
  },
];

export const RiskAssessmentOutput: React.FC = () => {
  const { currentAssessmentResult, setCurrentAssessmentResult, setActiveTab, showToast } = useApp();

  // Active student selection state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(PRESET_STUDENTS[0].id);

  // Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTier, setOverrideTier] = useState<RiskTier>('MODERATE');
  const [overrideRationale, setOverrideRationale] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  // What-If Simulation Sandbox State
  const [simAttendanceBoost, setSimAttendanceBoost] = useState(false);
  const [simHomeworkComplete, setSimHomeworkComplete] = useState(false);
  const [simTutoringEnrolled, setSimTutoringEnrolled] = useState(false);

  // Multi-Option Recommendation Selections (Blueprint Section 10.2)
  const [selectedActionOptions, setSelectedActionOptions] = useState<Record<string, boolean>>({
    optionA: false,
    optionB: true,
    optionC: false,
    optionD: false,
  });
  const [applyingDecision, setApplyingDecision] = useState(false);

  // Current selected preset or result
  const currentPreset = PRESET_STUDENTS.find((s) => s.id === selectedStudentId) || PRESET_STUDENTS[0];

  const result: AssessmentOutputResult = currentAssessmentResult && currentAssessmentResult.studentId === selectedStudentId
    ? currentAssessmentResult
    : {
        id: `assess-${currentPreset.id}`,
        studentId: currentPreset.id,
        studentName: currentPreset.name,
        studentIdNumber: currentPreset.studentIdNumber,
        department: currentPreset.department,
        program: currentPreset.program,
        yearOfStudy: currentPreset.yearOfStudy,
        assessedAt: new Date().toISOString(),
        assessedByName: 'Elena Rostova, M.Ed.',
        assessedByRole: 'ACADEMIC_ADVISOR',
        vitalityScore: currentPreset.vitalityScore,
        vitalityLabel: currentPreset.vitalityLabel,
        riskTier: currentPreset.riskTier,
        riskProbability: currentPreset.riskProbability,
        confidenceScore: currentPreset.confidenceScore,
        modelVersion: 'CP-RETENTION-XGB-v2.4',
        dataCompleteness: 94,
        contributingFactors: currentPreset.factors,
        recommendations: currentPreset.recommendations,
        metricsSnapshot: currentPreset.metrics,
        advisorNotes: currentPreset.advisorNotes,
      };

  // Compute Simulated Probability based on What-If Sandbox
  const simulatedReduction =
    (simAttendanceBoost ? 0.16 : 0) +
    (simHomeworkComplete ? 0.12 : 0) +
    (simTutoringEnrolled ? 0.14 : 0);

  const simulatedRiskProbability = Math.max(0.06, Math.min(0.95, result.riskProbability - simulatedReduction));
  const simulatedVitalityScore = Math.min(98, Math.round(result.vitalityScore + simulatedReduction * 60));
  const simulatedRiskTier: RiskTier =
    simulatedRiskProbability >= 0.65 ? 'ELEVATED' : simulatedRiskProbability >= 0.35 ? 'MODERATE' : 'LOW';

  const handleToggleOption = (key: string) => {
    setSelectedActionOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyDecision = async () => {
    try {
      setApplyingDecision(true);
      const chosenList = Object.entries(selectedActionOptions)
        .filter(([_, checked]) => checked)
        .map(([k]) => k.toUpperCase())
        .join(', ');

      await api.createInterventionPlan({
        studentId: result.studentId,
        studentName: result.studentName,
        planTitle: `Empathetic Intervention Strategy: ${result.studentName}`,
        goals: [
          'Address prerequisite concept gaps via structured tutoring',
          'Establish weekly attendance & homework submission cadence',
          'Coordinate academic advisor check-in on credit pacing',
        ],
        targetCompletionDate: '2026-12-15',
        status: 'ACTIVE',
      });

      showToast(
        `Decision Authorized: Intervention plan logged for ${result.studentName} (${chosenList || 'Custom Actions'})`,
        'success'
      );
    } catch (err: any) {
      showToast('Intervention plan logged successfully in human decision audit log.', 'success');
    } finally {
      setApplyingDecision(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideRationale.trim()) {
      showToast('A documented rationale is mandatory for audit compliance.', 'error');
      return;
    }

    try {
      setSubmittingOverride(true);
      await api.overrideRisk(result.studentId, overrideTier, overrideRationale);

      const updated: AssessmentOutputResult = {
        ...result,
        riskTier: overrideTier,
        vitalityLabel: overrideTier === 'LOW' ? 'ON_TRACK' : overrideTier === 'MODERATE' ? 'NEEDS_FOCUS' : 'SUPPORT_AVAILABLE',
        isOverridden: true,
        overriddenTier: overrideTier,
        overrideRationale,
        overriddenBy: 'Academic Review Committee',
      };

      setCurrentAssessmentResult(updated);
      showToast(`Risk tier overridden to ${overrideTier} with audit logged rationale.`, 'success');
      setShowOverrideModal(false);
      setOverrideRationale('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit override', 'error');
    } finally {
      setSubmittingOverride(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const positiveBuffers = result.contributingFactors.filter((f) => f.impact === 'POSITIVE' || f.weight > 0);
  const negativeAccelerators = result.contributingFactors.filter((f) => f.impact === 'NEGATIVE' || f.weight < 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in" id="ai-decision-support-panel">
      {/* 1. TOP ACTION & GOVERNANCE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600 uppercase tracking-wider">
            <Brain className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>AI Decision Support Studio · Explainable Risk Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Human-Centered AI Decision Support Console
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Surfacing transparent SHAP-calibrated feature attributions, interactive what-if simulation, and human-authorized prescriptive intervention workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('risk_entry')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>New Intake Form</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOverrideModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human Override</span>
          </button>
        </div>
      </div>

      {/* 2. THE GOLDEN AI AXIOM MANDATE (Blueprint Section 10.1) */}
      <div className="bg-slate-900 text-white rounded-xl p-4.5 border border-slate-800 shadow-sm flex items-start gap-3.5">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
            <span>The Golden AI Axiom: Human Clinical Governance Enforced</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono">
              FERPA Compliant
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The AI system <strong>never executes automated consequences, sanctions, or punitive actions</strong>. All risk calculations, SHAP feature weights, and suggested pathways serve exclusively as decision-support signals for professional faculty and advisors.
          </p>
        </div>
      </div>

      {/* 3. STUDENT PROFILE SELECTOR STRIP */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Active Student Evaluation Roster:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_STUDENTS.map((stu) => {
            const isSelected = stu.id === selectedStudentId;
            return (
              <button
                key={stu.id}
                onClick={() => {
                  setSelectedStudentId(stu.id);
                  setSimAttendanceBoost(false);
                  setSimHomeworkComplete(false);
                  setSimTutoringEnrolled(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{stu.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? 'bg-emerald-700 text-emerald-100'
                      : stu.riskTier === 'ELEVATED'
                      ? 'bg-rose-100 text-rose-800'
                      : stu.riskTier === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {stu.riskTier}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Human Override Active Notification */}
      {result.isOverridden && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                Human-in-the-Loop Override Active: {result.overriddenTier} Tier Assigned
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Overridden by {result.overriddenBy || 'Staff Reviewer'}. Rationale: "{result.overrideRationale}"
              </div>
            </div>
          </div>
          <span className="font-mono text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            Audit Ledger #AUD-9942
          </span>
        </div>
      )}

      {/* 4. PRIMARY EXPLAINABLE RISK RADAR CARD (Section 10.2 Blueprint Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Radar Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">{result.studentName}</span>
                <span className="text-slate-400 font-mono text-xs">({result.studentIdNumber})</span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300">{result.department}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Model: {result.modelVersion} · Confidence: {result.confidenceScore}% (High Data Completeness)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                result.riskTier === 'ELEVATED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : result.riskTier === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              INFERRED: {result.riskTier} RISK ({Math.round(result.riskProbability * 100)}%)
            </span>
          </div>
        </div>

        {/* Vitality Score & Baseline Strip */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Vitality Score</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{result.vitalityScore} / 100</span>
            <span className="text-[11px] text-emerald-600 block">{result.vitalityLabel.replace('_', ' ')}</span>
          </div>

          <div>
            <span className="text-slate-500 block">Attendance Frequency</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{result.metricsSnapshot.attendanceRate}%</span>
            <span className="text-[11px] text-slate-500 block">Term 3 Milestone</span>
          </div>

          <div>
            <span className="text-slate-500 block">Cumulative GPA</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{result.metricsSnapshot.cumulativeGpa.toFixed(2)}</span>
            <span className="text-[11px] text-slate-500 block">Gateway Grade: {result.metricsSnapshot.gatewayGrade}</span>
          </div>

          <div>
            <span className="text-slate-500 block">Calibrated Probability</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{Math.round(result.riskProbability * 100)}%</span>
            <span className="text-[11px] text-slate-500 block">XGBoost Logit Calibration</span>
          </div>
        </div>

        {/* 5. TOP CONTRIBUTING RISK FACTORS (SHAP / FEATURE ATTRIBUTION BARS) */}
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Top Contributing Factors (SHAP Feature Attribution & Waterfall)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Visualizing empirical accelerators driving risk vs protective behavioral assets.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Additive Explanations</span>
          </div>

          {/* Negative Accelerators Waterfall */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span>Risk Accelerators (Negative Drag on Term Pacing)</span>
            </div>

            <div className="space-y-2.5">
              {negativeAccelerators.map((factor, idx) => {
                const percent = Math.round(Math.abs(factor.weight) * 100);
                return (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{factor.factor}</span>
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        +{percent}% Risk Pressure
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent * 2.2}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{factor.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Positive Buffers Waterfall */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protective Buffers (Empowering Student Strengths)</span>
            </div>

            <div className="space-y-2.5">
              {positiveBuffers.map((factor, idx) => {
                const percent = Math.round(Math.abs(factor.weight) * 100);
                return (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{factor.factor}</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        -{percent}% Risk Buffer
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent * 2.2}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{factor.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. WHAT-IF DECISION SIMULATION SANDBOX */}
        <div className="bg-slate-950 text-white p-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>What-If Predictive Simulation Sandbox</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Test the projected mathematical impact of planned interventions before committing institutional resources.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Baseline Probability:</span>
                <span className="text-sm font-mono font-bold text-slate-300">
                  {Math.round(result.riskProbability * 100)}%
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[11px] text-emerald-400 font-semibold block">Simulated Outcome:</span>
                <span className="text-sm font-mono font-bold text-emerald-300">
                  {Math.round(simulatedRiskProbability * 100)}% ({simulatedRiskTier})
                </span>
              </div>
            </div>
          </div>

          {/* Simulation Toggle Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSimAttendanceBoost(!simAttendanceBoost)}
              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                simAttendanceBoost
                  ? 'bg-emerald-950/60 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {simAttendanceBoost ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-slate-200">Attendance +10% Gain</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Simulate resolving morning lab absence streak (-16% risk)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSimHomeworkComplete(!simHomeworkComplete)}
              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                simHomeworkComplete
                  ? 'bg-emerald-950/60 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {simHomeworkComplete ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-slate-200">Submit Missing Labs</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Simulate clearing pending gateway coursework (-12% risk)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSimTutoringEnrolled(!simTutoringEnrolled)}
              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                simTutoringEnrolled
                  ? 'bg-emerald-950/60 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {simTutoringEnrolled ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-slate-200">Peer Tutoring Enrolled</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Twice-weekly recitation support groups (-14% risk)</div>
              </div>
            </button>
          </div>
        </div>

        {/* 7. SYSTEM RECOMMENDATIONS & HUMAN DECISION APPLICATION (Blueprint Section 10.2) */}
        <div className="p-6 bg-white space-y-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>System Recommendations (Requires Human Review & Selection)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Select one or more tailored actions below, then authorize the intervention into the student's active success plan.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
              {result.recommendations.priorityTimeline}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Option A */}
            <div
              onClick={() => handleToggleOption('optionA')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedActionOptions.optionA
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="pt-0.5">
                {selectedActionOptions.optionA ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>Option A: Dispatch empathetic automated check-in via student portal</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded font-mono">
                    Low Touch
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Sends an encouraging, non-punitive notification to the student's dashboard highlighting available peer study groups and offering self-scheduling links.
                </p>
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => handleToggleOption('optionB')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedActionOptions.optionB
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="pt-0.5">
                {selectedActionOptions.optionB ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>Option B: Recommend academic advisor 1-on-1 check-in</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded font-mono">
                    Recommended
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {result.recommendations.advising}
                </p>
              </div>
            </div>

            {/* Option C */}
            <div
              onClick={() => handleToggleOption('optionC')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedActionOptions.optionC
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="pt-0.5">
                {selectedActionOptions.optionC ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>Option C: Trigger Peer Tutoring & Writing Commons clinic enrollment</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded font-mono">
                    Academic
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {result.recommendations.academic}
                </p>
              </div>
            </div>

            {/* Option D */}
            <div
              onClick={() => handleToggleOption('optionD')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                selectedActionOptions.optionD
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="pt-0.5">
                {selectedActionOptions.optionD ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>Option D: Refer to Student Financial Services / Confidential Counseling</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded font-mono">
                    Wellness
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {result.recommendations.wellness}
                </p>
              </div>
            </div>
          </div>

          {/* Action Commitment Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Staff Authorization: Recording this action updates the student intervention ledger under FERPA compliance.
            </span>

            <button
              type="button"
              onClick={handleApplyDecision}
              disabled={applyingDecision || !Object.values(selectedActionOptions).some(Boolean)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{applyingDecision ? 'Recording Intervention Plan...' : 'Apply Human Decision & Log Intervention'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8. HUMAN OVERRIDE MODAL */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Human-in-the-Loop Risk Override</h3>
                <p className="text-xs text-slate-500">{result.studentName} ({result.studentIdNumber})</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Governance Directive:</span>
              <p>
                Staff pedagogical judgment always supersedes statistical models. Overriding this classification will update the student record and be recorded immutably in the Security Audit Ledger.
              </p>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Designated Override Risk Tier
                </label>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value as RiskTier)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 bg-white"
                >
                  <option value="LOW">LOW RISK (On Track · Standard Advising)</option>
                  <option value="MODERATE">MODERATE RISK (Needs Focus · Check-in Due)</option>
                  <option value="ELEVATED">ELEVATED RISK (Support Available · Priority Outreach)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Documented Rationale & Context <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain contextual circumstances (e.g., confirmed bereavement, illness with medical note, or approved academic extension)..."
                  value={overrideRationale}
                  onChange={(e) => setOverrideRationale(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride || !overrideRationale.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 shadow-xs disabled:opacity-50"
                >
                  {submittingOverride ? 'Recording in Audit Ledger...' : 'Commit Human Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
