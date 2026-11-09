import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/index.ts';
import {
  Bell,
  Building2,
  UserCheck,
  ChevronDown,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Shield,
  LifeBuoy,
  CheckCircle,
  LogOut,
  LogIn,
  Sliders,
  FileSpreadsheet,
  Brain,
  CreditCard,
  Lock,
  User,
  ArrowRight,
  Gauge,
  Grid,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    currentRole,
    tenants,
    activeTab,
    setActiveTab,
    switchRole,
    switchTenant,
    notifications,
    markNotificationRead,
    isAuthenticated,
    setShowAuthModal,
    logout,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModulesMenu, setShowModulesMenu] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'STUDENT', label: 'Student', desc: 'Sarah Chen · CS Sophomore' },
    { role: 'FACULTY', label: 'Faculty', desc: 'Dr. Marcus Vance · Professor' },
    { role: 'ACADEMIC_ADVISOR', label: 'Academic Advisor', desc: 'Elena Rostova, M.Ed.' },
    { role: 'COUNSELLOR', label: 'Counsellor (Confidential)', desc: 'Dr. Rachel Adams, Psy.D.' },
    { role: 'INSTITUTION_ADMIN', label: 'Institution Admin', desc: 'Dr. Evelyn Reed · Vice Provost' },
    { role: 'SUPER_ADMIN', label: 'Platform Super Admin', desc: 'Jordan Miller · SaaS Lead' },
  ];

  // Dynamic navigation items based on active role
  const getNavLinks = () => {
    switch (currentRole) {
      case 'STUDENT':
        return [
          { id: 'dashboard', label: 'My Vitality' },
          { id: 'academics', label: 'Course Progress' },
          { id: 'goals', label: 'Goals & Growth' },
          { id: 'appointments', label: 'Appointments' },
          { id: 'resources', label: 'Campus Support' },
        ];
      case 'FACULTY':
        return [
          { id: 'dashboard', label: 'Course Rosters' },
          { id: 'ai_decision_support', label: 'AI Decision Support' },
          { id: 'risk_entry', label: 'Evaluate Student Risk' },
          { id: 'referrals', label: 'Referrals & Outreach' },
          { id: 'appointments', label: 'Office Hours' },
        ];
      case 'ACADEMIC_ADVISOR':
        return [
          { id: 'dashboard', label: 'Advisee Triage' },
          { id: 'ai_decision_support', label: 'AI Decision Support' },
          { id: 'risk_entry', label: 'Risk Intake Form' },
          { id: 'interventions', label: 'Success Plans' },
          { id: 'appointments', label: 'Schedule' },
        ];
      case 'COUNSELLOR':
        return [
          { id: 'dashboard', label: 'Case Management' },
          { id: 'ai_decision_support', label: 'AI Decision Support' },
          { id: 'appointments', label: 'Session Calendar' },
          { id: 'crisis_protocol', label: 'Crisis & Safety' },
          { id: 'resources', label: 'Support Services' },
        ];
      case 'INSTITUTION_ADMIN':
        return [
          { id: 'dashboard', label: 'Retention Intelligence' },
          { id: 'ai_decision_support', label: 'AI Decision Support' },
          { id: 'data_ingestion', label: 'CSV Ingestion Workbench' },
          { id: 'subscriptions', label: 'Subscriptions & Tiers' },
          { id: 'ai_governance', label: 'AI Governance & Audit' },
        ];
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Tenants & Provisioning' },
          { id: 'ai_decision_support', label: 'AI Decision Support' },
          { id: 'subscriptions', label: 'Subscriptions & Tiers' },
          { id: 'models', label: 'Model Operations' },
          { id: 'audit_logs', label: 'Security Audit Log' },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard' }];
    }
  };

  const navLinks = getNavLinks();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* ZONE 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-xs cursor-pointer hover:bg-emerald-700 transition-colors"
          >
            CP
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              CampusPulse AI
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {currentTenant?.name || 'Higher Ed Ecosystem'}
            </span>
          </div>
        </div>

        {/* ZONE 2: 4–5 nav links, single-line labels */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === link.id
                  ? 'border-emerald-600 text-slate-900 font-bold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* ZONE 3: Controls Cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Modules Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowModulesMenu(!showModulesMenu);
                setShowRoleMenu(false);
                setShowTenantMenu(false);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Quick Access All Modules"
            >
              <Grid className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Modules</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showModulesMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in text-xs">
                <div className="px-3 py-1.5 font-bold text-slate-900 border-b border-slate-100">
                  Quick Navigation Modules
                </div>
                <div className="divide-y divide-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('risk_entry');
                      setShowModulesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Risk Assessment Form</div>
                      <div className="text-[11px] text-slate-500">Multidimensional student intake</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('risk_output');
                      setShowModulesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                  >
                    <Gauge className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Risk Output Screen</div>
                      <div className="text-[11px] text-slate-500">SHAP attributions & action plan</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('data_ingestion');
                      setShowModulesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-slate-900">CSV Import & Ingestion</div>
                      <div className="text-[11px] text-slate-500">Self-healing batch data pipelines</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('subscriptions');
                      setShowModulesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Subscriptions & Tiers</div>
                      <div className="text-[11px] text-slate-500">Commercial plans & capacity limits</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('models');
                      setShowModulesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                  >
                    <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Model Operations (MLOps)</div>
                      <div className="text-[11px] text-slate-500">Serving health, drift & rollback</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('audit_logs');
                      setShowModulesMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    <div>
                      <div className="font-semibold text-slate-900">Security Audit Log</div>
                      <div className="text-[11px] text-slate-500">Tamper-evident compliance stream</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Institution Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTenantMenu(!showTenantMenu);
                setShowRoleMenu(false);
                setShowNotifications(false);
                setShowUserMenu(false);
                setShowModulesMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Switch Institution Tenant"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline font-mono">{currentTenant?.logoText}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTenantMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Switch Higher Ed Institution
                </div>
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setShowTenantMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      t.id === currentTenant?.id ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {t.studentCount?.toLocaleString()} students · {t.subscriptionTier}
                      </div>
                    </div>
                    {t.id === currentTenant?.id && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowTenantMenu(false);
                setShowNotifications(false);
                setShowUserMenu(false);
                setShowModulesMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-2xs transition-colors whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{roles.find((r) => r.role === currentRole)?.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Switch Active Persona & RBAC Context
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start gap-2.5 ${
                      r.role === currentRole ? 'bg-emerald-50/70 text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {r.role === 'STUDENT' && <BookOpen className="w-3.5 h-3.5 text-blue-600" />}
                      {r.role === 'FACULTY' && <Calendar className="w-3.5 h-3.5 text-indigo-600" />}
                      {r.role === 'ACADEMIC_ADVISOR' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      {r.role === 'COUNSELLOR' && <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />}
                      {r.role === 'INSTITUTION_ADMIN' && <Building2 className="w-3.5 h-3.5 text-purple-600" />}
                      {r.role === 'SUPER_ADMIN' && <Shield className="w-3.5 h-3.5 text-slate-800" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{r.label}</div>
                      <div className="text-[11px] text-slate-500">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleMenu(false);
                setShowTenantMenu(false);
                setShowUserMenu(false);
                setShowModulesMenu(false);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-3 pb-2 text-xs font-semibold text-slate-700 border-b border-slate-100 flex items-center justify-between">
                  <span>Institutional Notifications</span>
                  <span className="text-[11px] font-normal text-slate-500 font-mono tabular-nums">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-900 font-medium mb-1">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu / Login Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowRoleMenu(false);
                  setShowTenantMenu(false);
                  setShowNotifications(false);
                  setShowModulesMenu(false);
                }}
                className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-medium text-xs flex items-center justify-center shrink-0">
                  {currentUser?.avatarInitials || 'CP'}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser?.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-1">
                      {currentUser?.role.replace('_', ' ')} · {currentTenant?.name}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch Account / Register</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
