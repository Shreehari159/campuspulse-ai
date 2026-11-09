import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import {
  Building2,
  TrendingUp,
  Users,
  UploadCloud,
  FileCheck,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  Database,
  BarChart2,
} from 'lucide-react';

export const InstitutionAdminDashboard: React.FC = () => {
  const { currentTenant, showToast } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CSV Ingestion state
  const [ingestType, setIngestType] = useState('STUDENTS');
  const [csvText, setCsvText] = useState(
    `student_id,name,email,department,program,gpa\nSJU-2025-1001,Jordan Lee,j.lee@stjude.edu,Computer Science,B.S. CS,3.65\nSJU-2025-1002,Chloe Bennett,c.bennett@stjude.edu,Health Sciences,B.S. Nursing,3.82\nSJU-2025-1003,Devon Brooks,d.brooks@stjude.edu,Engineering,B.S. MechE,2.95`
  );
  const [importing, setImporting] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getRetentionAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load institution analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const handleExecuteImport = async () => {
    if (!csvText.trim()) return;

    try {
      setImporting(true);
      const res = await api.importCsv(ingestType, csvText, `${ingestType.toLowerCase()}_batch_import.csv`);
      setLastImportResult(res.result);
      showToast(`Successfully processed ${res.result.successCount} records!`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Department,Enrolled,RetentionRate,VitalityHigh\n' +
      (analytics?.departmentComparison || [])
        .map((d: any) => `${d.name},${d.enrolled},${d.retention}%,${d.vitalityHigh}%`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentTenant?.slug}_retention_report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Executive retention report exported', 'info');
  };

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Provost Strategic Command</span>
            <span aria-hidden="true">·</span>
            <span>{currentTenant?.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Institutional Retention Intelligence & Data Ingestion
          </h1>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Executive Report (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Institutional Retention Rate</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {analytics?.retentionRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+2.8% over historical baseline</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Term-to-Term Persistence</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {analytics?.termToTermPersistence}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Fall 2026 continuing cohort</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Active Students Tracked</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {currentTenant?.studentCount?.toLocaleString() || '14,250'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across 5 collegiate divisions</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500">Avg Time-to-Intervention</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {analytics?.interventionVelocity?.avgTimeToFirstContactDays} <span className="text-xs font-normal text-slate-500">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">From referral initiation</div>
        </div>
      </div>

      {/* Department Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Academic Division Retention Benchmarks</h2>
            <p className="text-xs text-slate-500">Comparative retention and vitality indicators across university colleges</p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {analytics?.departmentComparison?.length} Departments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Collegiate Division</th>
                <th className="py-3 px-4 text-right">Enrolled Students</th>
                <th className="py-3 px-4 text-right">Retention Rate</th>
                <th className="py-3 px-4 text-right">High Vitality Ratio</th>
                <th className="py-3 px-4">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {analytics?.departmentComparison?.map((d: any) => (
                <tr key={d.name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{d.name}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                    {d.enrolled.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                    {d.retention}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600 font-semibold">
                    {d.vitalityHigh}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        d.retention >= 90
                          ? 'bg-emerald-50 text-emerald-800'
                          : d.retention >= 86
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {d.retention >= 90 ? 'Exceeding Benchmark' : d.retention >= 86 ? 'Target Cadence' : 'Support Priority'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Ingestion & Integration Engine */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <span>Institutional Data Ingestion Engine (CSV / SIS)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ingest student rosters, attendance logs, and course grades with automatic schema validation and duplicate detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={ingestType}
              onChange={(e) => setIngestType(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white"
            >
              <option value="STUDENTS">Students Master Roster</option>
              <option value="ATTENDANCE">Course Attendance Feed</option>
              <option value="GRADES">Assessment & Grade Feed</option>
              <option value="COURSES">Course Catalog & Sections</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            CSV File Payload (Headers + Data Rows)
          </label>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:outline-emerald-600 bg-slate-50 text-slate-800"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500">
              Automatic column mapping applied. Duplicate student identifiers will be idempotently merged.
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={importing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg text-xs transition-colors whitespace-nowrap"
            >
              {importing ? 'Validating & Processing...' : 'Execute Ingestion Job'}
            </button>
          </div>

          {lastImportResult && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  Import Job Result: {lastImportResult.id}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {new Date(lastImportResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div>
                  Total Rows: <strong>{lastImportResult.totalRows}</strong>
                </div>
                <div className="text-emerald-700 font-bold">
                  Ingested: {lastImportResult.successCount}
                </div>
                <div className="text-slate-500">
                  Errors: {lastImportResult.errorCount}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
