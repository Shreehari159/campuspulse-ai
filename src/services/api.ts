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
  ImportJobResult,
  SubscriptionPlan,
  TenantSubscription,
  RiskAssessmentSubmission,
  AssessmentOutputResult,
} from '../types/index.ts';

class ApiService {
  private tenantId = 'tenant-st-jude';
  private userRole: UserRole = 'STUDENT';
  private userId = 'usr-student-sarah';

  setContext(tenantId: string, role: UserRole, userId: string) {
    this.tenantId = tenantId;
    this.userRole = role;
    this.userId = userId;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      'x-user-role': this.userRole,
      'x-user-id': this.userId,
    };
  }

  async getAuthContext(): Promise<{ user: User; tenant: Tenant; accessibleTenants: Tenant[] }> {
    const res = await fetch('/api/v1/auth/me', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch auth context');
    return res.json();
  }

  async switchRole(role: UserRole, tenantId?: string): Promise<{ user: User; tenant: Tenant }> {
    const res = await fetch('/api/v1/auth/switch-role', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role, tenantId: tenantId || this.tenantId }),
    });
    if (!res.ok) throw new Error('Failed to switch role');
    return res.json();
  }

  async login(credentials: { email: string; password?: string; tenantId?: string }): Promise<{
    success: boolean;
    user: User;
    tenant: Tenant;
    accessibleTenants: Tenant[];
    token: string;
  }> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to authenticate');
    }
    const data = await res.json();
    this.setContext(data.tenant.id, data.user.role, data.user.id);
    return data;
  }

  async register(payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    tenantId?: string;
    department?: string;
    studentIdNumber?: string;
    title?: string;
  }): Promise<{
    success: boolean;
    user: User;
    tenant: Tenant;
    accessibleTenants: Tenant[];
    token: string;
  }> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    this.setContext(data.tenant.id, data.user.role, data.user.id);
    return data;
  }

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to logout');
    return res.json();
  }

  // -------------------------------------------------------------
  // 1. Tenants & Provisioning API
  // -------------------------------------------------------------
  async getTenants(params?: {
    search?: string;
    status?: string;
    tier?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tenants: Tenant[]; total: number; page: number; totalPages: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.tier) searchParams.set('tier', params.tier);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const url = `/api/v1/tenants${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch tenants');
    }
    return res.json();
  }

  async getTenantDetails(id: string): Promise<{ tenant: Tenant; subscription?: TenantSubscription; stats: any }> {
    const res = await fetch(`/api/v1/tenants/${id}`, { headers: this.getHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch tenant details');
    }
    return res.json();
  }

  async createTenant(data: Partial<Tenant>): Promise<{ tenant: Tenant; subscription: TenantSubscription }> {
    const res = await fetch('/api/v1/tenants', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to provision tenant');
    }
    return res.json();
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<{ tenant: Tenant }> {
    const res = await fetch(`/api/v1/tenants/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update tenant configuration');
    }
    return res.json();
  }

  async updateTenantStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED',
    rationale: string
  ): Promise<{ tenant: Tenant; subscription?: TenantSubscription }> {
    const res = await fetch(`/api/v1/tenants/${id}/status`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, rationale }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update tenant status');
    }
    return res.json();
  }

  async changeTenantSubscription(
    id: string,
    planTier: string
  ): Promise<{ tenant: Tenant; subscription: TenantSubscription }> {
    const res = await fetch(`/api/v1/tenants/${id}/subscription`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ planTier }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to change subscription plan');
    }
    return res.json();
  }

  // -------------------------------------------------------------
  // 2. Subscriptions & Tiers API
  // -------------------------------------------------------------
  async getSubscriptionPlans(): Promise<{ plans: SubscriptionPlan[] }> {
    const res = await fetch('/api/v1/subscriptions/plans', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscription plans');
    return res.json();
  }

  async updateSubscriptionPlan(tier: string, data: Partial<SubscriptionPlan>): Promise<{ plan: SubscriptionPlan }> {
    const res = await fetch(`/api/v1/subscriptions/plans/${tier}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update subscription plan');
    }
    return res.json();
  }

  async getTenantSubscriptions(): Promise<{
    subscriptions: TenantSubscription[];
    paymentCollectionConfigured: boolean;
    paymentGatewayNotice: string;
  }> {
    const res = await fetch('/api/v1/subscriptions/tenants', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tenant subscriptions');
    return res.json();
  }

  async updateSubscriptionLifecycle(
    tenantId: string,
    action: 'activate' | 'suspend' | 'cancel' | 'renew',
    rationale?: string
  ): Promise<{ subscription: TenantSubscription }> {
    const res = await fetch(`/api/v1/subscriptions/tenants/${tenantId}/lifecycle`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, rationale }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update subscription lifecycle');
    }
    return res.json();
  }

  async validateSubscriptionLimit(
    tenantId: string,
    additionalStudents: number
  ): Promise<{ allowed: boolean; currentCount: number; projectedCount: number; maxAllowed: number; message: string }> {
    const res = await fetch('/api/v1/subscriptions/validate-limit', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetTenantId: tenantId, additionalStudents }),
    });
    if (!res.ok) throw new Error('Failed to validate subscription limit');
    return res.json();
  }

  // -------------------------------------------------------------
  // 3. Model Operations API
  // -------------------------------------------------------------
  async getModels(): Promise<{ models: AIModelInfo[]; activeModel: AIModelInfo; inferenceServiceStatus: any }> {
    const res = await fetch('/api/v1/models', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  }

  async getModelHealth(): Promise<any> {
    const res = await fetch('/api/v1/models/health', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch model health telemetry');
    return res.json();
  }

  async promoteModel(
    version: string,
    rationale: string
  ): Promise<{ success: boolean; activeModel: AIModelInfo; models: AIModelInfo[] }> {
    const res = await fetch(`/api/v1/models/${version}/promote`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rationale }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to promote model version');
    }
    return res.json();
  }

  async rollbackModel(
    version: string,
    rationale: string
  ): Promise<{ success: boolean; activeModel: AIModelInfo; models: AIModelInfo[] }> {
    const res = await fetch(`/api/v1/models/${version}/rollback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rationale }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to rollback model version');
    }
    return res.json();
  }

  async testModelInference(): Promise<any> {
    const res = await fetch('/api/v1/models/test-inference', {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to run test inference');
    return res.json();
  }

  // -------------------------------------------------------------
  // 4. Security Audit Log API
  // -------------------------------------------------------------
  async getAuditLogs(params?: {
    search?: string;
    tenantId?: string;
    action?: string;
    outcome?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditEvent[]; total: number; page: number; totalPages: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tenantId) searchParams.set('tenantId', params.tenantId);
    if (params?.action) searchParams.set('action', params.action);
    if (params?.outcome) searchParams.set('outcome', params.outcome);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const url = `/api/v1/audit/logs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch audit logs');
    }
    return res.json();
  }

  async getAuditLogDetails(id: string): Promise<{ log: AuditEvent }> {
    const res = await fetch(`/api/v1/audit/logs/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch audit log detail');
    return res.json();
  }

  async exportAuditLogsUrl(): Promise<string> {
    return `/api/v1/audit/export`;
  }

  async verifyAuditIntegrity(): Promise<{
    verified: boolean;
    recordCount: number;
    algorithm: string;
    appendOnlyPolicy: string;
    hashChainVerified: boolean;
    blockHash: string;
    timestamp: string;
  }> {
    const res = await fetch('/api/v1/audit/verify-integrity', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to verify audit ledger integrity');
    return res.json();
  }

  // -------------------------------------------------------------
  // 5. Existing Academic & Core Operations
  // -------------------------------------------------------------
  async getStudents(params?: { query?: string; vitality?: string; riskTier?: string }): Promise<{ students: Student[] }> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.vitality) searchParams.set('vitality', params.vitality);
    if (params?.riskTier) searchParams.set('riskTier', params.riskTier);

    const url = `/api/v1/students${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  }

  async getStudent(id: string): Promise<{ student: Student }> {
    const res = await fetch(`/api/v1/students/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch student profile');
    return res.json();
  }

  async getStudentVitality(id: string) {
    const res = await fetch(`/api/v1/students/${id}/vitality`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch student vitality');
    return res.json();
  }

  async createStudentGoal(studentId: string, goal: Partial<StudentGoal>): Promise<{ goal: StudentGoal }> {
    const res = await fetch(`/api/v1/students/${studentId}/goals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Failed to create student goal');
    return res.json();
  }

  async toggleGoalMilestone(studentId: string, goalId: string, milestoneId: string, isCompleted: boolean) {
    const res = await fetch(`/api/v1/students/${studentId}/goals/${goalId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ isCompleted }),
    });
    if (!res.ok) throw new Error('Failed to toggle milestone');
    return res.json();
  }

  async getFacultyCourses(): Promise<{ courses: CourseSection[] }> {
    const res = await fetch('/api/v1/faculty/courses', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch faculty courses');
    return res.json();
  }

  async getCourseRoster(sectionId: string) {
    const res = await fetch(`/api/v1/faculty/courses/${sectionId}/roster`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch course roster');
    return res.json();
  }

  async getReferrals(): Promise<{ referrals: Referral[] }> {
    const res = await fetch('/api/v1/referrals', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch referrals');
    return res.json();
  }

  async createReferral(data: {
    studentId: string;
    category: string;
    courseCode?: string;
    reason: string;
    urgency: string;
  }): Promise<{ referral: Referral }> {
    const res = await fetch('/api/v1/referrals', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create referral');
    return res.json();
  }

  async updateReferral(id: string, data: Partial<Referral>): Promise<{ referral: Referral }> {
    const res = await fetch(`/api/v1/referrals/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update referral');
    return res.json();
  }

  async getAdvisees(): Promise<{ advisees: Student[] }> {
    const res = await fetch('/api/v1/advisors/advisees', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch advisees');
    return res.json();
  }

  async getInterventionPlans(): Promise<{ plans: InterventionPlan[] }> {
    const res = await fetch('/api/v1/advisors/interventions', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch intervention plans');
    return res.json();
  }

  async createInterventionPlan(data: Partial<InterventionPlan>): Promise<{ plan: InterventionPlan }> {
    const res = await fetch('/api/v1/advisors/interventions', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create intervention plan');
    return res.json();
  }

  async updateInterventionPlan(id: string, data: Partial<InterventionPlan>): Promise<{ plan: InterventionPlan }> {
    const res = await fetch(`/api/v1/advisors/interventions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update intervention plan');
    return res.json();
  }

  async getCounsellorCases(): Promise<{ cases: SupportCase[] }> {
    const res = await fetch('/api/v1/counsellors/cases', { headers: this.getHeaders() });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Access Denied: Counseling records are confidential.');
    }
    return res.json();
  }

  async getCounsellorCase(caseId: string): Promise<{ supportCase: SupportCase; notes: ConfidentialCaseNote[] }> {
    const res = await fetch(`/api/v1/counsellors/cases/${caseId}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch confidential case details');
    return res.json();
  }

  async addConfidentialNote(caseId: string, noteType: string, content: string): Promise<{ note: ConfidentialCaseNote }> {
    const res = await fetch(`/api/v1/counsellors/cases/${caseId}/notes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ noteType, content }),
    });
    if (!res.ok) throw new Error('Failed to record confidential note');
    return res.json();
  }

  async updateCaseStatus(caseId: string, data: Partial<SupportCase>): Promise<{ supportCase: SupportCase }> {
    const res = await fetch(`/api/v1/counsellors/cases/${caseId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update case status');
    return res.json();
  }

  async overrideRisk(studentId: string, overriddenTier: string, rationale: string) {
    const res = await fetch('/api/v1/risk/override', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ studentId, overriddenTier, rationale }),
    });
    if (!res.ok) throw new Error('Failed to override risk assessment');
    return res.json();
  }

  async assessStudentRisk(submission: RiskAssessmentSubmission): Promise<{ success: boolean; result: AssessmentOutputResult }> {
    const res = await fetch('/api/v1/risk/assess', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete risk assessment');
    }
    return res.json();
  }

  async getModelGovernance(): Promise<{ models: AIModelInfo[]; fairnessAudit: any }> {
    const res = await fetch('/api/v1/risk/governance/models', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch model governance');
    return res.json();
  }

  async generateAiIntervention(studentId: string, identifiedBarrier?: string) {
    const res = await fetch('/api/v1/ai/generate-intervention', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ studentId, identifiedBarrier }),
    });
    if (!res.ok) throw new Error('Failed to generate AI intervention');
    return res.json();
  }

  async getAppointments(): Promise<{ appointments: Appointment[] }> {
    const res = await fetch('/api/v1/appointments', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  }

  async createAppointment(data: Partial<Appointment>): Promise<{ appointment: Appointment }> {
    const res = await fetch('/api/v1/appointments', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to schedule appointment');
    return res.json();
  }

  async getResources(): Promise<{ resources: CampusResource[] }> {
    const res = await fetch('/api/v1/resources', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch campus resources');
    return res.json();
  }

  async getRetentionAnalytics() {
    const res = await fetch('/api/v1/analytics/retention', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch retention analytics');
    return res.json();
  }

  async importCsv(entityType: string, csvContent: string, fileName?: string): Promise<{ result: ImportJobResult }> {
    const res = await fetch('/api/v1/imports/csv', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ entityType, csvContent, fileName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to import CSV');
    }
    return res.json();
  }

  async getSubscriptions() {
    const res = await fetch('/api/v1/subscriptions', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    return res.json();
  }
}

export const api = new ApiService();
