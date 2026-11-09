import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, StudentGoal, Appointment } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Sparkles,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Info,
  Clock,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  LifeBuoy,
  X,
  Target,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { currentTenant, currentUser, showToast, activeTab, setActiveTab } = useApp();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransparencyDrawer, setShowTransparencyDrawer] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // New goal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<'ACADEMIC' | 'CAREER' | 'WELLNESS' | 'SKILL'>('ACADEMIC');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-11-30');
  const [shareWithAdvisor, setShareWithAdvisor] = useState(true);
  const [milestoneInput, setMilestoneInput] = useState('');

  // Booking state
  const [bookingType, setBookingType] = useState<'ADVISING' | 'COUNSELING' | 'OFFICE_HOURS' | 'TUTORING'>('ADVISING');
  const [bookingDate, setBookingDate] = useState('2026-10-24');
  const [bookingSlot, setBookingSlot] = useState('02:00 PM - 02:30 PM');
  const [bookingNotes, setBookingNotes] = useState('');

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const studentId = currentUser?.associatedStudentId || 'stu-sarah-chen';
      const res = await api.getStudent(studentId);
      setStudent(res.student);
    } catch (err) {
      console.error('Failed to load student portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [currentUser?.associatedStudentId]);

  const handleToggleMilestone = async (goalId: string, milestoneId: string, currentStatus: boolean) => {
    if (!student) return;
    try {
      await api.toggleGoalMilestone(student.id, goalId, milestoneId, !currentStatus);
      showToast(currentStatus ? 'Milestone marked incomplete' : 'Milestone completed! Keep up the momentum.', 'success');
      loadStudentData();
    } catch (err) {
      showToast('Failed to update milestone', 'error');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !goalTitle.trim()) return;

    try {
      await api.createStudentGoal(student.id, {
        title: goalTitle,
        category: goalCategory,
        targetDate: goalTargetDate,
        sharedWithAdvisor: shareWithAdvisor,
        milestones: milestoneInput
          ? [{ id: `m-${Date.now()}`, title: milestoneInput, dueDate: goalTargetDate, isCompleted: false }]
          : undefined,
      });
      showToast('Personal growth goal created!', 'success');
      setShowGoalModal(false);
      setGoalTitle('');
      setMilestoneInput('');
      loadStudentData();
    } catch (err) {
      showToast('Could not save goal', 'error');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      await api.createAppointment({
        studentId: student.id,
        type: bookingType,
        scheduledDate: bookingDate,
        timeSlot: bookingSlot,
        notes: bookingNotes,
      });
      showToast('Support session booked successfully!', 'success');
      setShowAppointmentModal(false);
      setBookingNotes('');
    } catch (err) {
      showToast('Failed to book appointment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600">Student profile could not be loaded.</p>
      </div>
    );
  }

  const overallAttendance = Math.round(
    student.enrollments.reduce((acc, e) => acc + e.attendanceRate, 0) / (student.enrollments.length || 1)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Academic Vitality Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Academic Vitality Companion</span>
              <span aria-hidden="true">·</span>
              <span>Semester 3 of 8</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {student.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your overall course vitality is currently{' '}
              <span className="text-amber-400 font-semibold">Needs Focus</span> in discrete mathematics, while technical writing and computer science pacing remain strong. Support resources are available to help you excel this semester.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowTransparencyDrawer(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg border border-white/10 transition-colors whitespace-nowrap"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Transparency</span>
            </button>
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>Book Advising or Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Vitality Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Cumulative GPA</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {student.cumulativeGpa.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Target: 3.50 Honors</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Attendance Consistency</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {overallAttendance}%
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            <span>2 recent Friday absences</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Degree Credits Completed</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {student.totalCreditsEarned}{' '}
            <span className="text-sm font-normal text-slate-400">/ {student.targetDegreeCredits}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${(student.totalCreditsEarned / student.targetDegreeCredits) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Active Success Goals</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {student.goals.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>{student.goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.isCompleted).length, 0)} milestones completed</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      {activeTab === 'academics' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Current Course Enrollments & Academic Pacing</h2>
                <div className="text-xs text-slate-500">Fall 2026 Academic Term · {currentTenant?.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md tabular-nums font-semibold">
                  {student.enrollments.length} Active Courses
                </span>
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md transition-colors"
                >
                  Book Tutoring
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {student.enrollments.map((enr) => (
                <div key={enr.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-slate-900">{enr.courseCode}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-sm text-slate-900">{enr.courseName}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Instructor: {enr.instructorName}</div>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono tabular-nums">
                      <div className="text-right">
                        <div className="text-slate-500 text-[11px]">Current Grade</div>
                        <div className="font-bold text-slate-900 text-sm">
                          {enr.currentGrade}{' '}
                          <span className="text-xs text-slate-500">({enr.currentPercentage}%)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500 text-[11px]">Attendance</div>
                        <div
                          className={`font-bold text-sm ${
                            enr.attendanceRate < 75 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {enr.attendanceRate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-slate-700">Recent Assessment:</span> {enr.recentAssessment}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">Last present: {enr.lastAttended}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'goals' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Growth & Study Goals</h2>
                <p className="text-xs text-slate-500">
                  Student agency in action. Set milestones and share with your advisor if desired.
                </p>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Goal</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {student.goals.map((g) => (
                <div key={g.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
                          {g.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Target: {g.targetDate}</span>
                        {g.sharedWithAdvisor && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-blue-600 font-medium">Shared with Advisor</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{g.title}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                        {g.progressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${g.progressPercent}%` }}
                    />
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2 pt-1">
                    {g.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(g.id, m.id, m.isCompleted)}
                        className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer group hover:text-slate-900"
                      >
                        {m.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        )}
                        <span className={m.isCompleted ? 'line-through text-slate-400' : ''}>{m.title}</span>
                        <span className="text-[11px] text-slate-400 ml-auto font-mono">{m.dueDate}</span>
                      </div>
                    ))}
                  </div>

                  {g.reflections.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs italic text-slate-600">
                      "{g.reflections[0]}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Enrolled Courses & Pacing */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Current Course Enrollments</h2>
                  <div className="text-xs text-slate-500">Fall 2026 Academic Term · {currentTenant?.name}</div>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {student.enrollments.length} Courses
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {student.enrollments.map((enr) => (
                  <div key={enr.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm text-slate-900">{enr.courseCode}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-medium text-sm text-slate-900">{enr.courseName}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Instructor: {enr.instructorName}</div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                        <div className="text-right">
                          <div className="text-slate-500 text-[11px]">Current Grade</div>
                          <div className="font-bold text-slate-900 text-sm">
                            {enr.currentGrade}{' '}
                            <span className="text-xs text-slate-500">({enr.currentPercentage}%)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500 text-[11px]">Attendance</div>
                          <div
                            className={`font-bold text-sm ${
                              enr.attendanceRate < 75 ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {enr.attendanceRate}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-700">Recent Assessment:</span> {enr.recentAssessment}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">Last present: {enr.lastAttended}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Goals & Milestones */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Growth & Study Goals</h2>
                  <p className="text-xs text-slate-500">
                    Student agency in action. Set milestones and share with your advisor if desired.
                  </p>
                </div>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {student.goals.map((g) => (
                  <div key={g.id} className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/30 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
                            {g.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Target: {g.targetDate}</span>
                          {g.sharedWithAdvisor && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-blue-600">Shared with Advisor</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">{g.title}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                          {g.progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${g.progressPercent}%` }}
                      />
                    </div>

                    {/* Milestones list */}
                    <div className="space-y-2 pt-1">
                      {g.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(g.id, m.id, m.isCompleted)}
                          className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer group hover:text-slate-900"
                        >
                          {m.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                          )}
                          <span className={m.isCompleted ? 'line-through text-slate-400' : ''}>{m.title}</span>
                          <span className="text-[11px] text-slate-400 ml-auto font-mono">{m.dueDate}</span>
                        </div>
                      ))}
                    </div>

                    {g.reflections.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs italic text-slate-600">
                        "{g.reflections[0]}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Advisor & Recommended Support */}
          <div className="space-y-6">
            {/* Assigned Advisor Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Academic Advisor
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                  ER
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{student.assignedAdvisorName}</div>
                  <div className="text-xs text-slate-500">College of Sciences · Student Success</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Elena is your dedicated partner for degree pacing, course selection, and connecting with department peer tutoring.
              </p>
              <button
                onClick={() => {
                  setBookingType('ADVISING');
                  setShowAppointmentModal(true);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
              >
                Schedule Advising Check-in
              </button>
            </div>

            {/* Supportive Campus Resources */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recommended Campus Support
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">Peer Tutoring & Learning Commons</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Free drop-in discrete mathematics study groups Mon/Wed at Science Library.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">University Writing Center</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    1-on-1 technical research writing consultations.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">Wellness & Counseling Services (CAPS)</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Confidential support for exam stress, test anxiety, and sleep health.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Student Data Transparency Drawer */}
      {showTransparencyDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Student Data Transparency</h3>
              </div>
              <button
                onClick={() => setShowTransparencyDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-emerald-950">
                <div className="font-bold mb-1">Our Privacy & Dignity Guarantee:</div>
                <p>
                  You are a person, not a record. CampusPulse AI only analyzes academic course engagement to connect you with helpful resources early.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">What data is used for my vitality indicators?</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Course attendance frequency from professor attendance logs</li>
                  <li>Recent assignment and midterm grading milestone timelines</li>
                  <li>Your self-created goals and reflections (only when shared)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">What data is strictly excluded?</h4>
                <p className="text-slate-600">
                  Private counseling session notes, medical disclosures, demographic characteristics, and financial aid specifics are strictly firewalled and NEVER factored into academic risk scoring.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Who can view this information?</h4>
                <p className="text-slate-600">
                  Only you and your assigned Academic Advisor ({student.assignedAdvisorName}). Professors only see their own course section's attendance and grades.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Active Model Contributing Signals:</h4>
                <div className="space-y-2 mt-2">
                  {student.riskAssessment.contributingFactors.map((f, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-900">{f.factor}</span>
                        <span
                          className={`font-mono font-bold ${
                            f.impact === 'POSITIVE' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {f.weight > 0 ? `+${(f.weight * 100).toFixed(0)}%` : `${(f.weight * 100).toFixed(0)}%`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTransparencyDrawer(false)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close Transparency Details
            </button>
          </div>
        </div>
      )}

      {/* 5. Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Create Personal Success Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master dynamic programming recursion"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e: any) => setGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="ACADEMIC">Academic Pacing</option>
                    <option value="WELLNESS">Wellness & Habit</option>
                    <option value="CAREER">Career & Skills</option>
                    <option value="SKILL">Technical Mastery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">First Action Step (Milestone)</label>
                <input
                  type="text"
                  placeholder="e.g. Review lecture 8 recursion notes with peer study group"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="shareCheck"
                  checked={shareWithAdvisor}
                  onChange={(e) => setShareWithAdvisor(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="shareCheck" className="text-slate-600">
                  Share this goal with my Academic Advisor ({student.assignedAdvisorName})
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Book Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Book Support Session</h3>
              <button onClick={() => setShowAppointmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Service Type</label>
                <select
                  value={bookingType}
                  onChange={(e: any) => setBookingType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="ADVISING">Academic Advising (Elena Rostova, M.Ed.)</option>
                  <option value="OFFICE_HOURS">Faculty Office Hours (Dr. Marcus Vance)</option>
                  <option value="TUTORING">Peer Tutoring (Math & CS Commons)</option>
                  <option value="COUNSELING">Counseling & Psychological Services (Confidential)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">What would you like to discuss?</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Discussing MATH150 pace, upcoming midterm review, or schedule balancing."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
