import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CourseSection, Referral } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Users,
  Search,
  AlertTriangle,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  BookOpen,
  X,
} from 'lucide-react';

export const FacultyCommandCenter: React.FC = () => {
  const { currentTenant, currentUser, activeTab, setActiveTab, showToast } = useApp();
  const [courses, setCourses] = useState<CourseSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('sec-cs201-02');
  const [roster, setRoster] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Referral Modal
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedStudentForReferral, setSelectedStudentForReferral] = useState<any>(null);
  const [referralCategory, setReferralCategory] = useState('TUTORING');
  const [referralReason, setReferralReason] = useState('');
  const [referralUrgency, setReferralUrgency] = useState('ROUTINE');

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, referralsRes] = await Promise.all([
        api.getFacultyCourses(),
        api.getReferrals(),
      ]);
      setCourses(coursesRes.courses);
      setReferrals(referralsRes.referrals);

      if (coursesRes.courses.length > 0) {
        const secId = selectedSection || coursesRes.courses[0].id;
        const rosterRes = await api.getCourseRoster(secId);
        setRoster(rosterRes.students);
      }
    } catch (err) {
      console.error('Failed to load faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSection]);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForReferral || !referralReason.trim()) return;

    try {
      const activeCourse = courses.find((c) => c.id === selectedSection);
      await api.createReferral({
        studentId: selectedStudentForReferral.studentId,
        category: referralCategory,
        courseCode: activeCourse?.courseCode || 'CS201',
        reason: referralReason,
        urgency: referralUrgency,
      });

      showToast(`Referral submitted for ${selectedStudentForReferral.name}. Advisor notified!`, 'success');
      setShowReferralModal(false);
      setReferralReason('');
      setSelectedStudentForReferral(null);
      loadData();
    } catch (err) {
      showToast('Failed to submit referral', 'error');
    }
  };

  const filteredRoster = roster.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeCourseObj = courses.find((c) => c.id === selectedSection);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Faculty Command Center</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser?.name || 'Dr. Marcus Vance'} ({currentUser?.title || 'Course Instructor'})</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {activeTab === 'referrals'
              ? 'Closed-Loop Referrals & Advising Outreach'
              : 'Course Rosters & Early Disengagement Outreach'}
          </h1>
        </div>

        {/* Course Section Selector & Action */}
        <div className="flex items-center gap-2">
          {activeTab === 'referrals' ? (
            <button
              onClick={() => {
                if (roster.length > 0) {
                  setSelectedStudentForReferral(roster[0]);
                }
                setShowReferralModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate Academic Referral</span>
            </button>
          ) : (
            courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedSection(c.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedSection === c.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.courseCode}: {c.courseName.split(' ')[0]}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Course Stats Strip */}
      {activeCourseObj && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500">Enrolled Students</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {activeCourseObj.enrolledCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{activeCourseObj.schedule}</div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500">Class Attendance Average</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {activeCourseObj.averageAttendanceRate}%
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">Room {activeCourseObj.room}</div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500">Cohort Median Grade</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {activeCourseObj.averageGrade}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">4 Academic Credits</div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500">Active Academic Referrals</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {referrals.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Closed-loop tracking enabled</div>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeCourseObj?.courseCode} - {activeCourseObj?.courseName} Student Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review attendance regularity and trigger supportive closed-loop referrals.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4 text-right">Attendance Rate</th>
                <th className="py-3 px-4 text-right">Current Grade</th>
                <th className="py-3 px-4">Recent Performance</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRoster.map((s) => {
                const hasWarning = s.attendanceRate < 75 || s.currentPercentage < 75;
                return (
                  <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                          {s.avatarInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{s.name}</span>
                            {hasWarning && (
                              <span className="text-[10px] text-amber-700 font-medium">Needs Attention</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{s.studentIdNumber}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{s.program}</td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span
                        className={`font-semibold ${
                          s.attendanceRate < 75 ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {s.attendanceRate}%
                      </span>
                      <span className="text-slate-400 text-[11px] block">{s.absencesCount} absences</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span className="font-semibold text-slate-900">{s.currentGrade}</span>
                      <span className="text-slate-400 text-[11px] block">({s.currentPercentage}%)</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {s.recentAssessment}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudentForReferral(s);
                          setReferralReason(
                            `Student has ${s.absencesCount} recent absences in ${activeCourseObj?.courseCode}. Recent assessment: ${s.recentAssessment}. Recommended tutoring check-in.`
                          );
                          setShowReferralModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Refer Support</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Closed-Loop Referrals Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Initiated Closed-Loop Referrals</h2>
            <p className="text-xs text-slate-500">
              Track the status of academic outreach without compromising private student counseling confidentiality.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {referrals.length} Total Referrals
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {referrals.map((ref) => (
            <div key={ref.id} className="p-4.5 hover:bg-slate-50 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">{ref.studentName}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-mono text-slate-500">{ref.courseCode || 'General'}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 capitalize">{ref.category.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {ref.status}
                  </span>
                  <span className="text-slate-400 text-[11px]">{new Date(ref.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded border border-slate-100">
                "{ref.reason}"
              </p>

              {ref.closedLoopNote && (
                <div className="text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded border border-emerald-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Advisor Follow-up ({ref.assignedToName}):</span>{' '}
                    {ref.closedLoopNote}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral Modal */}
      {showReferralModal && selectedStudentForReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Initiate Academic Referral</h3>
                <div className="text-xs text-slate-500">
                  Target Student: {selectedStudentForReferral.name} ({selectedStudentForReferral.studentIdNumber})
                </div>
              </div>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Student</label>
                <select
                  value={selectedStudentForReferral?.studentId}
                  onChange={(e) => {
                    const st = roster.find((s) => s.studentId === e.target.value);
                    if (st) setSelectedStudentForReferral(st);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {roster.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name} ({s.studentIdNumber}) - Attendance: {s.attendanceRate}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Referral Service</label>
                <select
                  value={referralCategory}
                  onChange={(e) => setReferralCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="TUTORING">Peer Tutoring & Learning Commons</option>
                  <option value="ACADEMIC_ADVISING">Academic Success Advising</option>
                  <option value="WRITING_CENTER">University Writing Center</option>
                  <option value="STUDY_SKILLS">Study Skills Coaching & Time Management</option>
                  <option value="WELLNESS_SUPPORT">General Campus Wellness Check-in</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Urgency</label>
                <select
                  value={referralUrgency}
                  onChange={(e) => setReferralUrgency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="ROUTINE">Routine (Check-in within 5 business days)</option>
                  <option value="ELEVATED">Elevated (Check-in within 48 hours)</option>
                  <option value="PRIORITY">Priority (Immediate advising outreach)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Concise Context & Specific Academic Observation
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the academic signal (e.g. difficulty with recursion lab, consecutive Friday absences)."
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Closed-Loop Commitment:</span> The assigned advisor will contact the student and record a non-confidential status update for your dashboard.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
                >
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
