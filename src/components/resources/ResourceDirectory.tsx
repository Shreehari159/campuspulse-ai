import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CampusResource } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  MapPin,
  Mail,
  Video,
  CheckCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react';

export const ResourceDirectory: React.FC = () => {
  const { currentTenant, showToast, setActiveTab } = useApp();
  const [resources, setResources] = useState<CampusResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const res = await api.getResources();
        setResources(res.resources);
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [currentTenant]);

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'ACADEMIC', label: 'Academic & Tutoring' },
    { id: 'WELLNESS', label: 'Health & Wellness' },
    { id: 'ACCESSIBILITY', label: 'Accessibility & Accommodations' },
    { id: 'FINANCIAL', label: 'Emergency & Financial Aid' },
  ];

  const filtered = resources.filter((r) => {
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Campus Knowledge & Resource Hub</span>
            <span aria-hidden="true">·</span>
            <span>{currentTenant?.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Institutional Support & Academic Success Services
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Access free department tutoring, writing feedback, accessibility accommodations, and confidential counseling.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search service, building, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-emerald-700 text-[11px] uppercase tracking-wider">
                  {r.category}
                </span>
                {r.isVirtualAvailable && (
                  <span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                    <Video className="w-3 h-3" />
                    <span>Virtual Option</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">{r.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{r.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{r.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{r.contactEmail}</span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(`Session request initiated for ${r.title}`, 'info');
              }}
              className="w-full py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              {r.appointmentRequired ? 'Schedule Consultation' : 'Drop-in Hours Available'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
