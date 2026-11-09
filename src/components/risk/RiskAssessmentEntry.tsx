import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Student } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  HeartHandshake,
  DollarSign,
  Briefcase,
  FileText,
  RotateCcw,
  Zap,
} from 'lucide-react';

export const RiskAssessmentEntry: React.FC = () => {
  const { currentTenant, showToast, viewAssessmentResult } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [studentName, setStudentName] = useState('Sarah Chen');
  const [studentIdNumber, setStudentIdNumber] = useState('SJU-2024-8841');
  const [department, setDepartment] = useState('Computer Science');
  const [program, setProgram] = useState('B.S. Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState(2);

  // Academic Metrics
  const [attendanceRate, setAttendanceRate] = useState<number>(76);
  const [cumulativeGpa, setCumulativeGpa] = useState<number>(2.78);
  const [gatewayCourseGrade, setGatewayCourseGrade] = useState<string>('C-');
  const [recentGradeDropPercent, setRecentGradeDropPercent] = useState<number>(18);
  const [homeworkTimelinessScore, setHomeworkTimelinessScore] = useState<number>(68);

  // Behavioral & Engagement
  const [lmsLoginsPast14Days, setLmsLoginsPast14Days] = useState<number>(6);
  const [discussionPostsCount, setDiscussionPostsCount] = useState<number>(1);
  const [missedClassesStreak, setMissedClassesStreak] = useState<number>(3);
  const [officeHourVisits, setOfficeHourVisits] = useState<number>(0);

  // Holistic Vitality
  const [financialAidAtRisk, setFinancialAidAtRisk] = useState<boolean>(true);
  const [commuteHoursDaily, setCommuteHoursDaily] = useState<number>(2);
  const [employmentHoursWeekly, setEmploymentHoursWeekly] = useState<number>(24);
  const [stressLevel, setStressLevel] = useState<number>(8); // 1-10
  const [majorFitCertainty, setMajorFitCertainty] = useState<number>(4); // 1-10

  // Qualitative Observations
  const [advisorNotes, setAdvisorNotes] = useState<string>(
    'Student expressed feeling overwhelmed by midterm pacing in CS201 and balancing evening work shifts.'
  );

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const res = await api.getStudents();
        setStudents(res.students);
        if (res.students.length > 0) {
          const first = res.students[0];
          setSelectedStudentId(first.id);
          populateFromStudent(first);
        }
      } catch (err) {
        console.error('Failed to load students for entry form', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [currentTenant]);

  const populateFromStudent = (student: Student) => {
    setStudentName(student.name);
    setStudentIdNumber(student.studentIdNumber);
    setDepartment(student.department);
    setProgram(student.program);
    setYearOfStudy(student.yearOfStudy);
    setCumulativeGpa(student.cumulativeGpa);
    if (student.enrollments && student.enrollments.length > 0) {
      setAttendanceRate(student.enrollments[0].attendanceRate || 82);
    }
  };

  const handleSelectStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    const found = students.find((s) => s.id === id);
    if (found) {
      populateFromStudent(found);
      showToast(`Loaded academic record for ${found.name}`, 'info');
    }
  };

  // Scenario Presets
  const applyPreset = (type: 'HIGH_RISK' | 'MODERATE_RISK' | 'THRIVING') => {
    if (type === 'HIGH_RISK') {
      setAttendanceRate(64);
      setCumulativeGpa(2.15);
      setGatewayCourseGrade('D');
      setRecentGradeDropPercent(25);
      setHomeworkTimelinessScore(50);
      setLmsLoginsPast14Days(3);
      setMissedClassesStreak(4);
      setOfficeHourVisits(0);
      setFinancialAidAtRisk(true);
      setEmploymentHoursWeekly(32);
      setStressLevel(9);
      setMajorFitCertainty(3);
      setAdvisorNotes('Severe mid-semester attendance dropoff, financial hold flagged on bursar account.');
      showToast('Loaded High-Risk Early Warning Scenario', 'info');
    } else if (type === 'MODERATE_RISK') {
      setAttendanceRate(78);
      setCumulativeGpa(2.82);
      setGatewayCourseGrade('C');
      setRecentGradeDropPercent(12);
      setHomeworkTimelinessScore(74);
      setLmsLoginsPast14Days(8);
      setMissedClassesStreak(1);
      setOfficeHourVisits(1);
      setFinancialAidAtRisk(false);
      setEmploymentHoursWeekly(18);
      setStressLevel(6);
      setMajorFitCertainty(6);
      setAdvisorNotes('Pacing difficulty in prerequisite course, responding to advisor outreach.');
      showToast('Loaded Moderate Vitality Support Scenario', 'info');
    } else {
      setAttendanceRate(96);
      setCumulativeGpa(3.72);
      setGatewayCourseGrade('A');
      setRecentGradeDropPercent(0);
      setHomeworkTimelinessScore(98);
      setLmsLoginsPast14Days(22);
      setMissedClassesStreak(0);
      setOfficeHourVisits(3);
      setFinancialAidAtRisk(false);
      setEmploymentHoursWeekly(8);
      setStressLevel(3);
      setMajorFitCertainty(9);
      setAdvisorNotes('Student thriving with strong study habits and regular faculty engagement.');
      showToast('Loaded On-Track High Vitality Scenario', 'info');
    }
  };

  // Live estimated risk projection
  const estimatedRiskPercent = Math.min(
    95,
    Math.max(
      8,
      Math.round(
        30 +
          (attendanceRate < 80 ? (80 - attendanceRate) * 1.3 : -8) +
          (cumulativeGpa < 2.5 ? (2.5 - cumulativeGpa) * 25 : -10) +
          (gatewayCourseGrade === 'D' || gatewayCourseGrade === 'F' ? 22 : 0) +
          missedClassesStreak * 4 +
          (financialAidAtRisk ? 18 : 0) +
          (stressLevel > 7 ? (stressLevel - 7) * 4 : 0) +
          (officeHourVisits > 0 ? -10 : 0)
      )
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.assessStudentRisk({
        studentId: selectedStudentId || undefined,
        studentName,
        studentIdNumber,
        department,
        program,
        yearOfStudy,
        attendanceRate,
        cumulativeGpa,
        gatewayCourseGrade,
        recentGradeDropPercent,
        homeworkTimelinessScore,
        lmsLoginsPast14Days,
        discussionPostsCount,
        missedClassesStreak,
        officeHourVisits,
        financialAidAtRisk,
        commuteHoursDaily,
        employmentHoursWeekly,
        stressLevel,
        majorFitCertainty,
        advisorNotes,
      });

      showToast(`Risk assessment generated for ${res.result.studentName}!`, 'success');
      viewAssessmentResult(res.result);
    } catch (err: any) {
      showToast(err.message || 'Failed to complete risk assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Predictive Early Warning Diagnostic Console</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Human-in-the-Loop Intake Form</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Multidimensional Student Risk & Vitality Evaluation
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Input academic pacing, digital LMS cadence, and holistic vitality indicators to calculate calibrated dropout risk probabilities, directional SHAP attributions, and supportive intervention plans.
            </p>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Test Scenarios:</span>
            <button
              type="button"
              onClick={() => applyPreset('HIGH_RISK')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors"
            >
              Elevated Risk
            </button>
            <button
              type="button"
              onClick={() => applyPreset('MODERATE_RISK')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-colors"
            >
              Needs Focus
            </button>
            <button
              type="button"
              onClick={() => applyPreset('THRIVING')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors"
            >
              On Track
            </button>
          </div>
        </div>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Student Identity & Academic Profile */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>1. Student Identity & Degree Context</span>
              </h2>
              <p className="text-xs text-slate-500">
                Select an existing institutional advisee or enter a student evaluation record.
              </p>
            </div>

            {students.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">Load Enrolled Student:</span>
                <select
                  value={selectedStudentId}
                  onChange={handleSelectStudentChange}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentIdNumber} · {s.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Student ID Number</label>
              <input
                type="text"
                required
                value={studentIdNumber}
                onChange={(e) => setStudentIdNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Collegiate Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Degree Program</label>
              <input
                type="text"
                required
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Academic Performance & Attendance Factors */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>2. Academic Pacing & Attendance Metrics</span>
            </h2>
            <p className="text-xs text-slate-500">
              Quantitative grade momentum, prerequisite course gateway mastery, and lecture attendance cadence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Attendance Regularity Rate (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={attendanceRate}
                  onChange={(e) => setAttendanceRate(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={attendanceRate}
                  onChange={(e) => setAttendanceRate(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {attendanceRate < 75 ? '⚠️ Below institutional warning threshold (75%)' : 'Within target attendance cadence'}
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Cumulative GPA (4.0 Scale)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                required
                value={cumulativeGpa}
                onChange={(e) => setCumulativeGpa(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {cumulativeGpa < 2.0 ? '🚨 Below Good Standing' : cumulativeGpa < 2.5 ? 'Needs Academic Recovery' : 'In Good Standing'}
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Foundational Gateway Grade
              </label>
              <select
                value={gatewayCourseGrade}
                onChange={(e) => setGatewayCourseGrade(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 bg-white"
              >
                <option value="A">A / A- (Mastery)</option>
                <option value="B">B / B+ (Proficient)</option>
                <option value="C">C / C+ (Satisfactory)</option>
                <option value="C-">C- (Prerequisite Warning)</option>
                <option value="D">D / D+ (Bottleneck Risk)</option>
                <option value="F">F (Critical Failure)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Evaluates key bottleneck course (e.g. Calculus, Intro CS)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Recent Midterm / Quiz Score Drop (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={recentGradeDropPercent}
                onChange={(e) => setRecentGradeDropPercent(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Percentage drop compared to first 3 weeks benchmark.
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Homework Timeliness Score (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={homeworkTimelinessScore}
                onChange={(e) => setHomeworkTimelinessScore(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Reflects on-time submission frequency for assignments and labs.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Behavioral & Digital Learning Cadence */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>3. Behavioral Cadence & Learning Portal Engagement</span>
            </h2>
            <p className="text-xs text-slate-500">
              Asynchronous digital LMS logins, absence streaks, and faculty office hour consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                LMS Logins (Past 14 Days)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={lmsLoginsPast14Days}
                onChange={(e) => setLmsLoginsPast14Days(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {lmsLoginsPast14Days < 6 ? '⚠️ Low engagement' : 'Typical peer activity'}
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Consecutive Missed Sessions
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={missedClassesStreak}
                onChange={(e) => setMissedClassesStreak(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Consecutive unexcused lectures missed
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Discussion Forum Posts
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={discussionPostsCount}
                onChange={(e) => setDiscussionPostsCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Asynchronous collaborative inquiries
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Office Hour Consultations
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={officeHourVisits}
                onChange={(e) => setOfficeHourVisits(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {officeHourVisits > 0 ? 'Proactive self-advocacy' : 'Zero contact to date'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Holistic Vitality & Socio-Environmental Factors */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>4. Holistic Vitality & Non-Academic Environmental Factors</span>
            </h2>
            <p className="text-xs text-slate-500">
              Employment commitments, financial aid risk, and student-reported wellness stressors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={financialAidAtRisk}
                  onChange={(e) => setFinancialAidAtRisk(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">Financial Aid / Hold Pending</span>
                  <span className="text-[11px] text-slate-500">
                    Bursar balance, incomplete FAFSA verification, or SAP appeal in progress.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Weekly Off-Campus Workload (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={employmentHoursWeekly}
                onChange={(e) => setEmploymentHoursWeekly(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {employmentHoursWeekly >= 25 ? '⚠️ High employment fatigue risk (>25 hrs)' : 'Standard work-study cadence'}
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Daily Commute Burden (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="6"
                value={commuteHoursDaily}
                onChange={(e) => setCommuteHoursDaily(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Round-trip transit time to campus
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Self-Reported Stress/Overwhelm</label>
                <span className="font-mono font-bold text-slate-900">{stressLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 - Minimal Stress</span>
                <span>5 - Moderate</span>
                <span>10 - Severe Burnout</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Major Fit & Academic Certainty</label>
                <span className="font-mono font-bold text-slate-900">{majorFitCertainty} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={majorFitCertainty}
                onChange={(e) => setMajorFitCertainty(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 - Questioning Major</span>
                <span>5 - Exploring</span>
                <span>10 - High Alignment</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Qualitative Advisor / Faculty Observations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>5. Qualitative Context & Pedagogical Observations</span>
            </h2>
            <p className="text-xs text-slate-500">
              Subjective observations from advising touchpoints, faculty office hours, or student self-reports.
            </p>
          </div>

          <textarea
            rows={3}
            placeholder="Record relevant qualitative nuances, stated barriers, personal aspirations, or recent life transitions..."
            value={advisorNotes}
            onChange={(e) => setAdvisorNotes(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-emerald-600"
          />
        </div>

        {/* LIVE CALCULATION PREVIEW STRIP & SUBMIT ACTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky bottom-4 z-20">
          <div className="flex items-center gap-4">
            <div className="text-xs">
              <span className="text-slate-500 block text-[11px]">Real-Time Model Projection:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`font-mono font-bold text-base ${
                    estimatedRiskPercent >= 65
                      ? 'text-rose-600'
                      : estimatedRiskPercent >= 35
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {estimatedRiskPercent}% Estimated Risk
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-700">
                  {estimatedRiskPercent >= 65
                    ? 'Elevated Risk (Support Available)'
                    : estimatedRiskPercent >= 35
                    ? 'Moderate Risk (Needs Focus)'
                    : 'Low Risk (On Track)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => applyPreset('MODERATE_RISK')}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{submitting ? 'Running Inference & Attributions...' : 'Run Risk Assessment & View Output'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
