export type UserRole =
  | 'STUDENT'
  | 'FACULTY'
  | 'ACADEMIC_ADVISOR'
  | 'COUNSELLOR'
  | 'INSTITUTION_ADMIN'
  | 'SUPER_ADMIN';

export type AcademicVitality = 'ON_TRACK' | 'NEEDS_FOCUS' | 'IMPROVING' | 'SUPPORT_AVAILABLE';

export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED';

export type CaseStatus =
  | 'REFERRED'
  | 'INTAKE'
  | 'PLAN_ACTIVE'
  | 'FOLLOWUP_DUE'
  | 'RESOLVED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';

export type ProvisioningStatus = 'PROVISIONED' | 'CONFIGURING' | 'ACTIVE' | 'SUSPENDED' | 'FAILED';

export interface TenantSettings {
  minAttendanceThreshold: number;
  maxAbsencesBeforeAlert: number;
  contactEmail: string;
  academicCalendar: 'SEMESTER' | 'QUARTER' | 'TRIMESTER';
  timezone?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string;
  logoText: string;
  accentColor: string;
  status: 'ACTIVE' | 'SUSPENDED';
  provisioningStatus: ProvisioningStatus;
  provisioningError?: string;
  subscriptionTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  studentCount: number;
  facultyCount: number;
  retentionRate: number;
  createdAt: string;
  updatedAt?: string;
  settings?: TenantSettings;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  subRole?: string;
  avatarInitials: string;
  department?: string;
  title?: string;
  associatedStudentId?: string;
}

export interface StudentGoal {
  id: string;
  tenantId: string;
  studentId: string;
  title: string;
  category: 'ACADEMIC' | 'CAREER' | 'WELLNESS' | 'SKILL';
  targetDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  sharedWithAdvisor: boolean;
  progressPercent: number;
  milestones: GoalMilestone[];
  reflections: string[];
}

export interface GoalMilestone {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CourseSection {
  id: string;
  tenantId: string;
  courseCode: string;
  courseName: string;
  instructorName: string;
  instructorEmail: string;
  credits: number;
  schedule: string;
  room: string;
  enrolledCount: number;
  averageAttendanceRate: number;
  averageGrade: string;
}

export interface Enrollment {
  id: string;
  tenantId: string;
  studentId: string;
  courseSectionId: string;
  courseCode: string;
  courseName: string;
  instructorName: string;
  currentGrade: string;
  currentPercentage: number;
  attendanceRate: number;
  absencesCount: number;
  lastAttended: string;
  recentAssessment: string;
  status: 'ENROLLED' | 'WITHDRAWN' | 'COMPLETED';
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  studentId: string;
  courseCode: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface RiskFactor {
  factor: string;
  category: 'ATTENDANCE' | 'ACADEMIC' | 'LMS_ACTIVITY' | 'ENGAGEMENT';
  weight: number; // e.g. -0.32 or +0.15
  impact: 'NEGATIVE' | 'POSITIVE' | 'NEUTRAL';
  description: string;
}

export interface RiskAssessment {
  studentId: string;
  riskTier: RiskTier;
  vitalityScore: number; // 0 - 100
  vitalityLabel: AcademicVitality;
  dataCompleteness: number; // 0 - 100%
  confidenceScore: number; // 0 - 100%
  modelVersion: string;
  assessedAt: string;
  contributingFactors: RiskFactor[];
  recommendedAction: string;
  isOverridden?: boolean;
  overriddenBy?: string;
  overriddenTier?: RiskTier;
  overrideRationale?: string;
}

export interface Student {
  id: string;
  tenantId: string;
  studentIdNumber: string;
  name: string;
  email: string;
  avatarInitials: string;
  program: string;
  department: string;
  yearOfStudy: number;
  currentSemester: number;
  cumulativeGpa: number;
  academicVitality: AcademicVitality;
  riskTier: RiskTier;
  assignedAdvisorName: string;
  assignedAdvisorId: string;
  enrollments: Enrollment[];
  goals: StudentGoal[];
  riskAssessment: RiskAssessment;
  totalCreditsEarned: number;
  targetDegreeCredits: number;
  recentInterventionsCount: number;
}

export interface Referral {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  referredByUserId: string;
  referredByName: string;
  referredByRole: string;
  category: 'TUTORING' | 'ACADEMIC_ADVISING' | 'WRITING_CENTER' | 'STUDY_SKILLS' | 'FINANCIAL_COUNSELING' | 'WELLNESS_SUPPORT';
  courseCode?: string;
  reason: string;
  urgency: 'ROUTINE' | 'ELEVATED' | 'PRIORITY';
  status: 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
  assignedToName?: string;
  closedLoopNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportCase {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  assignedCounsellorId: string;
  assignedCounsellorName: string;
  status: CaseStatus;
  priority: 'ROUTINE' | 'ELEVATED' | 'HIGH';
  intakeDate: string;
  lastContactDate: string;
  nextFollowupDate: string;
  referralSource: string;
  presentingConcernSummary: string; // Non-diagnostic administrative summary
  confidentialNotesCount: number;
  interventionPlanActive: boolean;
  isEscalated?: boolean;
}

export interface ConfidentialCaseNote {
  id: string;
  tenantId: string;
  caseId: string;
  counsellorId: string;
  counsellorName: string;
  timestamp: string;
  noteType: 'INTAKE' | 'SESSION' | 'COLLABORATION' | 'CLOSURE';
  content: string; // Encrypted/Protected in clinical boundary
  isPrivileged: boolean;
}

export interface InterventionPlan {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  ownerId: string;
  ownerName: string;
  goalTitle: string;
  identifiedBarrier: string;
  agreedActions: string[];
  responsibleParty: string;
  targetCompletionDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'REVIEW_DUE' | 'COMPLETED';
  studentAcknowledged: boolean;
  progressPercent: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  staffUserId: string;
  staffName: string;
  staffRole: string;
  type: 'ADVISING' | 'COUNSELING' | 'OFFICE_HOURS' | 'TUTORING' | 'PEER_MENTORING';
  scheduledDate: string;
  timeSlot: string;
  location: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';
  notes?: string;
}

export interface CampusResource {
  id: string;
  tenantId: string;
  title: string;
  category: 'ACADEMIC' | 'CAREER' | 'WELLNESS' | 'FINANCIAL' | 'ACCESSIBILITY' | 'STUDENT_LIFE';
  description: string;
  location: string;
  hours: string;
  contactEmail: string;
  isVirtualAvailable: boolean;
  appointmentRequired: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  name: string;
  monthlyFee: number;
  annualFee: number;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  maxStudents: number;
  maxFaculty: number;
  features: string[];
  isConfigurable: boolean;
}

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';

export interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: SubscriptionStatus;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  currentPrice: number;
  startDate: string;
  renewalDate: string;
  studentCapacity: number;
  currentStudentCount: number;
  paymentCollectionStatus: 'MANUAL_INVOICE' | 'NOT_CONFIGURED' | 'TEST_MODE';
  autoRenew: boolean;
}

export interface ModelBatchJob {
  jobId: string;
  executedAt: string;
  recordsScored: number;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILED' | 'COMPLETED_WITH_WARNINGS';
  errorSummary?: string;
}

export interface AIModelInfo {
  version: string;
  code: string;
  name: string;
  status: 'PRODUCTION' | 'STAGING' | 'DEPRECATED';
  isActive: boolean;
  trainedOnCohort: string;
  deployedAt?: string;
  accuracy: number;
  aucRoc: number;
  f1Score?: number;
  fairnessRatio: number; // Demographic parity index
  dataPointsCount: number;
  intendedUse: string;
  prohibitedUse: string;
  knownLimitations: string;
  lastCalibrated: string;
  healthStatus: 'HEALTHY' | 'DRIFT_DETECTED' | 'CALIBRATION_PENDING';
  lastBatchJob?: ModelBatchJob;
}

export type AuditOutcome = 'SUCCESS' | 'FAILURE' | 'DENIED';

export interface AuditEvent {
  id: string;
  tenantId: string;
  tenantName?: string;
  timestamp: string;
  actorId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resource: string;
  outcome?: AuditOutcome;
  requestId?: string;
  details: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface ImportJobResult {
  id: string;
  fileName: string;
  entityType: 'STUDENTS' | 'ATTENDANCE' | 'GRADES' | 'COURSES';
  totalRows: number;
  successCount: number;
  errorCount: number;
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
  timestamp: string;
  errors: string[];
}

export interface RiskAssessmentSubmission {
  studentId?: string;
  studentName?: string;
  studentIdNumber?: string;
  department?: string;
  program?: string;
  yearOfStudy?: number;
  // Academic Metrics
  attendanceRate: number; // e.g. 78%
  cumulativeGpa: number; // e.g. 2.75
  gatewayCourseGrade: string; // e.g. 'C-'
  recentGradeDropPercent: number; // e.g. 15%
  homeworkTimelinessScore: number; // 0 - 100
  // Behavioral & Engagement
  lmsLoginsPast14Days: number;
  discussionPostsCount: number;
  missedClassesStreak: number;
  officeHourVisits: number;
  // Holistic Vitality
  financialAidAtRisk: boolean;
  commuteHoursDaily: number;
  employmentHoursWeekly: number;
  stressLevel: number; // 1 to 10
  majorFitCertainty: number; // 1 to 10
  // Qualitative Observations
  advisorNotes?: string;
}

export interface AssessmentOutputResult {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  department: string;
  program: string;
  yearOfStudy: number;
  assessedAt: string;
  assessedByName: string;
  assessedByRole: string;
  vitalityScore: number; // 0-100
  vitalityLabel: AcademicVitality;
  riskTier: RiskTier;
  riskProbability: number; // e.g. 0.72 -> 72%
  confidenceScore: number;
  modelVersion: string;
  dataCompleteness: number;
  contributingFactors: RiskFactor[];
  recommendations: {
    academic: string;
    advising: string;
    wellness: string;
    priorityTimeline: string;
  };
  metricsSnapshot: {
    attendanceRate: number;
    cumulativeGpa: number;
    gatewayGrade: string;
    lmsLogins: number;
    missedStreak: number;
    employmentHours: number;
    stressLevel: number;
  };
  advisorNotes?: string;
  isOverridden?: boolean;
  overriddenTier?: RiskTier;
  overrideRationale?: string;
  overriddenBy?: string;
}

