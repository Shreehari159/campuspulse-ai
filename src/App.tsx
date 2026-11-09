/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/common/Header.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { StudentPortal } from './components/student/StudentPortal.tsx';
import { FacultyCommandCenter } from './components/faculty/FacultyCommandCenter.tsx';
import { AdvisorWorkspace } from './components/advisor/AdvisorWorkspace.tsx';
import { CounsellorSuite } from './components/counsellor/CounsellorSuite.tsx';
import { InstitutionAdminDashboard } from './components/admin/InstitutionAdminDashboard.tsx';
import { SuperAdminConsole } from './components/superadmin/SuperAdminConsole.tsx';
import { AIGovernanceConsole } from './components/ai/AIGovernanceConsole.tsx';
import { ResourceDirectory } from './components/resources/ResourceDirectory.tsx';
import { AppointmentsHub } from './components/appointments/AppointmentsHub.tsx';
import { AuthPortal } from './components/auth/AuthPortal.tsx';
import { RiskAssessmentEntry } from './components/risk/RiskAssessmentEntry.tsx';
import { RiskAssessmentOutput } from './components/risk/RiskAssessmentOutput.tsx';
import { DataIngestionWorkbench } from './components/ingestion/DataIngestionWorkbench.tsx';
import { SubscriptionsModule } from './components/superadmin/SubscriptionsModule.tsx';
import { ModelOperationsModule } from './components/superadmin/ModelOperationsModule.tsx';
import { SecurityAuditLogModule } from './components/superadmin/SecurityAuditLogModule.tsx';

const AppContent: React.FC = () => {
  const {
    currentRole,
    activeTab,
    currentTenant,
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
  } = useApp();

  // If unauthenticated, show the dedicated Credential Registration & Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900">
        <AuthPortal initialMode="login" />
        <ToastContainer />
      </div>
    );
  }

  // Route renderer based on active role and tab
  const renderCurrentView = () => {
    // Cross-role dedicated tools & workbenches
    if (activeTab === 'risk_entry') {
      return <RiskAssessmentEntry />;
    }
    if (activeTab === 'risk_output' || activeTab === 'ai_decision_support') {
      return <RiskAssessmentOutput />;
    }
    if (activeTab === 'data_ingestion' || activeTab === 'ingestion') {
      return <DataIngestionWorkbench />;
    }
    if (activeTab === 'resources') {
      return <ResourceDirectory />;
    }
    if (activeTab === 'appointments') {
      return <AppointmentsHub />;
    }

    // Role-specific primary views
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return <SuperAdminConsole />;
      case 'INSTITUTION_ADMIN':
        if (activeTab === 'subscriptions') return <SubscriptionsModule />;
        if (activeTab === 'ai_governance' || activeTab === 'models') return <AIGovernanceConsole />;
        return <InstitutionAdminDashboard />;
      case 'STUDENT':
        return <StudentPortal />;
      case 'FACULTY':
        return <FacultyCommandCenter />;
      case 'ACADEMIC_ADVISOR':
        return <AdvisorWorkspace />;
      case 'COUNSELLOR':
        return <CounsellorSuite />;
      default:
        if (activeTab === 'subscriptions') return <SubscriptionsModule />;
        if (activeTab === 'models') return <ModelOperationsModule />;
        if (activeTab === 'audit_logs') return <SecurityAuditLogModule />;
        if (activeTab === 'ai_governance') return <AIGovernanceConsole />;
        return <StudentPortal />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 pb-16">{renderCurrentView()}</main>

      {/* Auth Modal Overlay when requested */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 z-50 text-slate-400 hover:text-slate-600 bg-white/80 rounded-full p-1"
            >
              ✕
            </button>
            <AuthPortal isModal onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">CampusPulse AI</span>
            <span>·</span>
            <span>Intelligent Student Success, Early Warning & Human-Centered Intervention Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Student = Person, Not Record</span>
            <span>·</span>
            <span>FERPA & HIPAA Separation Enforced</span>
            <span>·</span>
            <span>{currentTenant?.name}</span>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
