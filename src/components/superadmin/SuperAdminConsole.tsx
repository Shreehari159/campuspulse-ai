import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TenantsModule } from './TenantsModule.tsx';
import { SubscriptionsModule } from './SubscriptionsModule.tsx';
import { ModelOperationsModule } from './ModelOperationsModule.tsx';
import { SecurityAuditLogModule } from './SecurityAuditLogModule.tsx';
import {
  Building2,
  CreditCard,
  Brain,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SuperAdminConsole: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  // Normalize active tab to one of the 4 operational modules
  const currentModule = (() => {
    if (activeTab === 'subscriptions') return 'subscriptions';
    if (activeTab === 'ai_governance' || activeTab === 'models') return 'models';
    if (activeTab === 'audit_logs') return 'audit_logs';
    return 'tenants'; // default for 'dashboard' or any other
  })();

  const tabs = [
    {
      id: 'tenants',
      navId: 'dashboard',
      label: 'Tenants & Provisioning',
      icon: Building2,
      desc: 'Institutional boundaries, domains & configs',
    },
    {
      id: 'subscriptions',
      navId: 'subscriptions',
      label: 'Subscriptions & Tiers',
      icon: CreditCard,
      desc: 'Commercial allocations & quota limits',
    },
    {
      id: 'models',
      navId: 'models',
      label: 'Model Operations',
      icon: Brain,
      desc: 'MLOps, serving health & safe rollback',
    },
    {
      id: 'audit_logs',
      navId: 'audit_logs',
      label: 'Security Audit Log',
      icon: Shield,
      desc: 'Append-only tamper-evident event stream',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Platform Super Admin Header Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Platform Super Admin Operations Console</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Jordan Miller (SaaS Cloud Architect)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Multi-Tenant Architecture, Commercial Tiers & Model Governance
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Cross-institutional operations, FERPA/HIPAA multi-tenant isolation, enterprise plan quotas, safe MLOps model promotion, and immutable regulatory compliance logging.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Engine 100% Operational</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation Switcher */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.navId)}
                className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Module Renderer */}
      <div className="pt-2">
        {currentModule === 'tenants' && <TenantsModule />}
        {currentModule === 'subscriptions' && <SubscriptionsModule />}
        {currentModule === 'models' && <ModelOperationsModule />}
        {currentModule === 'audit_logs' && <SecurityAuditLogModule />}
      </div>
    </div>
  );
};
