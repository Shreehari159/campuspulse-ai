import initialStore from '../../server/data/store.json';
import {
  Tenant,
  User,
  Student,
  CourseSection,
  Referral,
  SupportCase,
  ConfidentialCaseNote,
  InterventionPlan,
  Appointment,
  CampusResource,
  AIModelInfo,
  AuditEvent,
  UserRole,
  StudentGoal,
  SubscriptionPlan,
  TenantSubscription,
} from '../types/index.ts';

const STORAGE_KEY = 'campuspulse_static_db';

class ClientDataStore {
  private data: any;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.data = initialStore;
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.data = initialStore;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch {
      this.data = initialStore;
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    }
  }

  getAuthMe(tenantId: string, role: UserRole, userId: string) {
    const user = this.data.users.find((u: any) => u.id === userId || u.role === role) || this.data.users[0];
    const tenant = this.data.tenants.find((t: any) => t.id === tenantId || t.id === user.tenantId) || this.data.tenants[0];
    return {
      user,
      tenant,
      accessibleTenants: this.data.tenants,
    };
  }

  login(email: string) {
    const user = this.data.users.find((u: any) => u.email?.toLowerCase() === email?.toLowerCase()) || this.data.users[0];
    const tenant = this.data.tenants.find((t: any) => t.id === user.tenantId) || this.data.tenants[0];
    return {
      success: true,
      user,
      tenant,
      accessibleTenants: this.data.tenants,
      token: `token-${user.id}-${Date.now()}`,
    };
  }

  switchRole(role: UserRole, tenantId?: string) {
    const user = this.data.users.find((u: any) => u.role === role) || {
      ...this.data.users[0],
      role,
    };
    const tenant = this.data.tenants.find((t: any) => t.id === (tenantId || user.tenantId)) || this.data.tenants[0];
    return { user, tenant };
  }

  getTenants() {
    return { tenants: this.data.tenants || [] };
  }

  getStudents(tenantId?: string) {
    const students = tenantId ? this.data.students.filter((s: any) => s.tenantId === tenantId) : this.data.students;
    return { students: students.length > 0 ? students : this.data.students };
  }

  getStudent(id: string) {
    const student = this.data.students.find((s: any) => s.id === id) || this.data.students[0];
    return { student };
  }

  getFacultyCourses(tenantId?: string) {
    const courses = this.data.courses || [];
    return { courses };
  }

  getReferrals(tenantId?: string) {
    const referrals = this.data.referrals || [];
    return { referrals };
  }

  getAdvisees(tenantId?: string) {
    return this.getStudents(tenantId);
  }

  getInterventions(tenantId?: string) {
    const plans = this.data.interventionPlans || [];
    return { plans };
  }

  createInterventionPlan(plan: any) {
    const newPlan = {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...plan,
    };
    this.data.interventionPlans = [newPlan, ...(this.data.interventionPlans || [])];
    this.save();
    return { plan: newPlan };
  }

  getCases(tenantId?: string) {
    const cases = this.data.counselingCases || [];
    return { cases };
  }

  getAppointments(tenantId?: string) {
    const appointments = this.data.appointments || [];
    return { appointments };
  }

  createAppointment(apt: any) {
    const newApt = {
      id: `apt-${Date.now()}`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      staffName: 'Elena Rostova, M.Ed.',
      staffRole: 'ACADEMIC_ADVISOR',
      location: 'Student Success Center · Room 304',
      ...apt,
    };
    this.data.appointments = [newApt, ...(this.data.appointments || [])];
    this.save();
    return { appointment: newApt };
  }

  getResources(tenantId?: string) {
    return { resources: this.data.resources || [] };
  }

  getRetentionAnalytics(tenantId?: string) {
    const tenant = this.data.tenants.find((t: any) => t.id === tenantId) || this.data.tenants[0];
    return {
      institution: tenant.name,
      retentionRate: tenant.retentionRate || 92.4,
      historicalRate: (tenant.retentionRate || 92.4) - 2.5,
      activeStudents: tenant.studentCount || 4200,
      termToTermPersistence: 91.8,
      interventionVelocity: {
        totalReferrals: (this.data.referrals || []).length,
        acceptedRate: 88.5,
        avgTimeToFirstContactDays: 1.2,
        plansActiveCount: (this.data.interventionPlans || []).length,
      },
      departmentComparison: [
        { name: 'Computer Science', retention: 92.5, enrolled: 1240, vitalityHigh: 82 },
        { name: 'Engineering', retention: 89.8, enrolled: 1680, vitalityHigh: 76 },
        { name: 'Health Sciences', retention: 94.2, enrolled: 950, vitalityHigh: 88 },
        { name: 'Business', retention: 87.4, enrolled: 1420, vitalityHigh: 71 },
        { name: 'Humanities & Arts', retention: 85.0, enrolled: 780, vitalityHigh: 68 },
      ],
      vitalityDistribution: {
        onTrack: 65,
        improving: 20,
        needsFocus: 10,
        supportAvailable: 5,
      },
    };
  }

  getModels() {
    return {
      models: this.data.aiModels || [],
      activeModel: (this.data.aiModels || []).find((m: any) => m.isActive) || (this.data.aiModels || [])[0],
    };
  }

  getModelHealth() {
    return {
      servingStatus: 'HEALTHY',
      activeRequestsPerSec: 42,
      p95LatencyMs: 48,
      driftStatus: 'STABLE',
      dataDriftScore: 0.04,
      fairnessDemographicParityRatio: 0.96,
      disparateImpactRatio: 0.94,
      lastHealthEvaluation: new Date().toISOString(),
    };
  }

  getAuditLogs() {
    return {
      logs: this.data.auditEvents || [],
      total: (this.data.auditEvents || []).length,
    };
  }

  getSubscriptionsPlans() {
    return {
      plans: this.data.subscriptionPlans || [],
    };
  }

  getSubscriptionsTenants() {
    return {
      tenants: this.data.tenants || [],
    };
  }
}

export const clientStore = new ClientDataStore();
