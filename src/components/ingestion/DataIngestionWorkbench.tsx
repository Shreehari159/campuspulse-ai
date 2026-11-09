import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ImportJobResult } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Layers,
  FileCheck,
  Table,
} from 'lucide-react';

export const DataIngestionWorkbench: React.FC = () => {
  const { currentTenant, showToast } = useApp();
  const [entityType, setEntityType] = useState<'STUDENTS' | 'ATTENDANCE' | 'GRADES' | 'COURSES'>('STUDENTS');
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('students_master_roster_fall2026.csv');
  const [importing, setImporting] = useState<boolean>(false);
  const [lastJobResult, setLastJobResult] = useState<ImportJobResult | null>(null);

  // Parsed Table Preview
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Historical Jobs
  const [jobHistory, setJobHistory] = useState<ImportJobResult[]>([
    {
      id: 'job-batch-8801',
      fileName: 'fall2026_student_roster.csv',
      entityType: 'STUDENTS',
      totalRows: 1240,
      successCount: 1240,
      errorCount: 0,
      status: 'COMPLETED',
      timestamp: '2026-10-12T16:00:22Z',
      errors: [],
    },
    {
      id: 'job-batch-8742',
      fileName: 'cs201_attendance_week4.csv',
      entityType: 'ATTENDANCE',
      totalRows: 420,
      successCount: 418,
      errorCount: 2,
      status: 'PARTIAL',
      timestamp: '2026-10-11T09:14:10Z',
      errors: ['Row 182: Missing course code column', 'Row 310: Invalid date format'],
    },
  ]);

  // Sample CSV Templates
  const sampleTemplates: Record<string, string> = {
    STUDENTS: `student_id,name,email,department,program,gpa\nSJU-2025-1001,Jordan Lee,j.lee@stjude.edu,Computer Science,B.S. CS,3.65\nSJU-2025-1002,Chloe Bennett,c.bennett@stjude.edu,Health Sciences,B.S. Nursing,3.82\nSJU-2025-1003,Devon Brooks,d.brooks@stjude.edu,Engineering,B.S. MechE,2.95\nSJU-2025-1004,Amara Patel,a.patel@stjude.edu,Business,B.S. Finance,3.40\nSJU-2025-1005,Lucas Rivera,l.rivera@stjude.edu,Arts & Sciences,B.A. English,3.15`,
    ATTENDANCE: `student_id,course_code,date,status\nSJU-2025-1001,CS101,2026-10-14,PRESENT\nSJU-2025-1002,NURS201,2026-10-14,PRESENT\nSJU-2025-1003,ENGR110,2026-10-14,ABSENT\nSJU-2025-1004,FIN300,2026-10-14,LATE\nSJU-2025-1005,ENG102,2026-10-14,PRESENT`,
    GRADES: `student_id,course_code,assessment_name,score,max_score\nSJU-2025-1001,CS101,Midterm 1,92,100\nSJU-2025-1002,NURS201,Clinical Practicum,95,100\nSJU-2025-1003,ENGR110,Physics Lab 3,68,100\nSJU-2025-1004,FIN300,Financial Case Analysis,88,100\nSJU-2025-1005,ENG102,Research Essay,84,100`,
    COURSES: `course_code,course_name,instructor,credits,schedule\nCS101,Intro to Algorithmic Problem Solving,Dr. Marcus Vance,4,Mon/Wed 10:00-11:30\nCS201,Data Structures & Algorithms,Dr. Marcus Vance,4,Tue/Thu 14:00-15:30\nMATH150,Calculus for Engineers,Dr. Sarah Sterling,4,Mon/Wed/Fri 09:00-10:00\nNURS201,Foundations of Nursing Practice,Dr. Teresa Clark,3,Tue 10:00-13:00`,
  };

  // Load default template on mount
  useEffect(() => {
    loadTemplate(entityType);
  }, []);

  const loadTemplate = (type: 'STUDENTS' | 'ATTENDANCE' | 'GRADES' | 'COURSES') => {
    const content = sampleTemplates[type];
    setCsvContent(content);
    setFileName(`${type.toLowerCase()}_feed_${currentTenant?.slug || 'institution'}.csv`);
    parseAndValidate(content);
  };

  const handleEntityTypeChange = (type: 'STUDENTS' | 'ATTENDANCE' | 'GRADES' | 'COURSES') => {
    setEntityType(type);
    loadTemplate(type);
    showToast(`Switched schema template to ${type}`, 'info');
  };

  const parseAndValidate = (text: string) => {
    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setParsedHeaders([]);
      setParsedRows([]);
      setParseErrors([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((r) => r.split(',').map((c) => c.trim()));
    const errors: string[] = [];

    rows.forEach((cols, idx) => {
      if (cols.length < headers.length) {
        errors.push(`Row ${idx + 2}: Insufficient columns (expected ${headers.length}, found ${cols.length})`);
      }
    });

    setParsedHeaders(headers);
    setParsedRows(rows);
    setParseErrors(errors);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsvContent(val);
    parseAndValidate(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseAndValidate(text);
      showToast(`Loaded ${file.name} (${Math.round(file.size / 1024)} KB)`, 'success');
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleTemplates[entityType]], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${entityType.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${entityType} CSV template`, 'info');
  };

  const handleExecuteIngestion = async () => {
    if (!csvContent.trim()) {
      showToast('Please provide CSV data before executing ingestion.', 'error');
      return;
    }

    try {
      setImporting(true);
      const res = await api.importCsv(entityType, csvContent, fileName);
      setLastJobResult(res.result);
      setJobHistory((prev) => [res.result, ...prev]);
      showToast(`Processed ${res.result.successCount} ${entityType.toLowerCase()} records into ${currentTenant?.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Ingestion failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Enterprise SIS & LMS Data Pipeline</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Self-Healing Batch Ingestion Workbench</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Data Ingestion & Institutional CSV Connector
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Ingest student master rosters, attendance records, course catalogs, and assessment grades with real-time schema validation, duplicate detection, and automated audit tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* SCHEMA SELECTION BAR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Ingestion Entity Schema:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['STUDENTS', 'ATTENDANCE', 'GRADES', 'COURSES'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleEntityTypeChange(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                entityType === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type === 'STUDENTS'
                ? 'Student Rosters'
                : type === 'ATTENDANCE'
                ? 'Attendance Feed'
                : type === 'GRADES'
                ? 'Grades & Exams'
                : 'Course Sections'}
            </button>
          ))}
        </div>
      </div>

      {/* CSV INPUT & FILE DROP WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>CSV Payload Editor ({fileName})</span>
              </span>
              <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={12}
              value={csvContent}
              onChange={handleTextChange}
              placeholder="Paste comma-separated rows with headers..."
              className="w-full mt-3 p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              {parsedRows.length} Data Rows · {parsedHeaders.length} Columns
            </span>

            <button
              type="button"
              onClick={handleExecuteIngestion}
              disabled={importing || parsedRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>{importing ? 'Processing Records...' : 'Execute Ingestion'}</span>
            </button>
          </div>
        </div>

        {/* Validation & Live Schema Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <span>Live Schema & Data Parsing Preview</span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  parseErrors.length === 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {parseErrors.length === 0 ? '✓ Schema Valid' : `⚠️ ${parseErrors.length} Syntax Issues`}
              </span>
            </div>

            {parseErrors.length > 0 && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                {parseErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Parsed Preview Table */}
            <div className="mt-3 overflow-x-auto max-h-72 border border-slate-200 rounded-lg">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                    {parsedHeaders.map((h, i) => (
                      <th key={i} className="p-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                  {parsedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((col, cIdx) => (
                        <td key={cIdx} className="p-2 whitespace-nowrap text-slate-800">
                          {col}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Target Institution: <strong className="text-slate-800">{currentTenant?.name}</strong></span>
            <span className="font-mono text-[11px]">Deduplication: Idempotent By ID</span>
          </div>
        </div>
      </div>

      {/* LATEST JOB RESULT SUMMARY (IF RAN) */}
      {lastJobResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Job Execution Completed: {lastJobResult.id}</span>
            </span>
            <span className="font-mono text-xs text-slate-500">
              {new Date(lastJobResult.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Entity Ingested</span>
              <span className="font-bold text-slate-900 font-mono">{lastJobResult.entityType}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Total Rows Parsed</span>
              <span className="font-bold text-slate-900 font-mono">{lastJobResult.totalRows}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-emerald-700 block text-[11px]">Successful Records</span>
              <span className="font-bold text-emerald-900 font-mono">{lastJobResult.successCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Rejected Rows</span>
              <span className="font-bold text-slate-900 font-mono">{lastJobResult.errorCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL INGESTION JOBS STREAM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Ingestion Job History & Audit Ledger Feed</span>
            </h3>
            <p className="text-xs text-slate-500">
              Immutable record of automated SIS feeds, batch CSV updates, and validation error logs.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{jobHistory.length} Recorded Runs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4 text-right">Rows Processed</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {jobHistory.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">{job.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{job.fileName}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{job.entityType}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                    {job.successCount} / {job.totalRows}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500">
                    {new Date(job.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
