import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Appointment } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Video,
  X,
  UserCheck,
} from 'lucide-react';

export const AppointmentsHub: React.FC = () => {
  const { currentRole, currentUser, showToast } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // New appointment modal
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'ADVISING' | 'COUNSELING' | 'OFFICE_HOURS' | 'TUTORING'>('ADVISING');
  const [scheduledDate, setScheduledDate] = useState('2026-10-26');
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 02:30 PM');
  const [notes, setNotes] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getAppointments();
      setAppointments(res.appointments);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [currentRole]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAppointment({
        studentId: currentUser?.associatedStudentId || 'stu-sarah-chen',
        type,
        scheduledDate,
        timeSlot,
        notes,
      });
      showToast('Appointment successfully booked and synced to institutional calendar!', 'success');
      setShowModal(false);
      setNotes('');
      loadAppointments();
    } catch (err) {
      showToast('Failed to schedule appointment', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Calendar & Office Hours</span>
            <span aria-hidden="true">·</span>
            <span>Academic Coordination</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Appointments & Consultation Schedule
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Book New Session</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Scheduled Support Sessions</h2>
            <p className="text-xs text-slate-500">Upcoming advising, faculty office hours, and counseling sessions</p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {appointments.length} Sessions
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No scheduled sessions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any upcoming consultations on your institutional calendar. Book an advising check-in or faculty office hours above.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book New Session</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 capitalize">
                      {(apt.type || 'ADVISING').replace('_', ' ')}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-medium text-slate-700">{apt.staffName || 'Advisor / Staff'}</span>
                    <span className="text-slate-400 text-xs font-normal">({apt.staffRole || 'Institutional Support'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800">
                      {apt.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.scheduledDate || 'Scheduled'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.timeSlot || 'Consultation Slot'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{apt.location || 'Faculty Room / Online'}</span>
                  </div>
                </div>

                {apt.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <span className="font-medium text-slate-700">Agenda / Discussion Focus:</span> {apt.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Book Institutional Support Session</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Session Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="ADVISING">Academic Advising (Degree Pacing & Milestones)</option>
                  <option value="OFFICE_HOURS">Faculty Office Hours (Coursework & Labs)</option>
                  <option value="TUTORING">Peer Tutoring (Math & CS Commons)</option>
                  <option value="COUNSELING">Counseling & Wellness (Confidential CAPS)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
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
                <label className="block font-medium text-slate-700 mb-1">Session Agenda / Notes</label>
                <textarea
                  rows={3}
                  placeholder="What would you like to focus on during this consultation?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
