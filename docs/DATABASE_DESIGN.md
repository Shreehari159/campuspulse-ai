# CampusPulse AI — Database Design & Entity Schema

## Normalized Entities

### 1. Multi-Tenant & Academic Infrastructure
- **Tenant**: `id, slug, name, domain, logoUrl, status (active/suspended), subscriptionTier, createdAt, updatedAt`
- **InstitutionConfig**: `tenantId, primaryColor, academicCalendarType, gradingScaleId, minAttendanceThreshold, maxAbsencesBeforeAlert`
- **Campus & Department**: `id, tenantId, code, name, headOfDepartmentId`
- **AcademicTerm**: `id, tenantId, name, code, startDate, endDate, isCurrent`
- **GradingScale**: `id, tenantId, name, gradeThresholds (JSON: A=93, B=85, etc.)`

### 2. Identity, Roles & Relationships
- **User**: `id, tenantId, email, name, avatarUrl, role (STUDENT, FACULTY, ACADEMIC_ADVISOR, COUNSELLOR, INSTITUTION_ADMIN, SUPER_ADMIN), subRole, status, lastLoginAt`
- **Student**: `id, tenantId, userId, studentIdNumber, departmentId, program, yearOfStudy, currentSemester, cumulativeGpa, academicVitalityStatus, assignedAdvisorId, assignedCounsellorId`
- **Faculty**: `id, tenantId, userId, employeeId, departmentId, officeLocation, title`
- **Advisor**: `id, tenantId, userId, departmentId, maxAdviseeCapacity`
- **Counsellor**: `id, tenantId, userId, licenseNumber, specialization, isConfidential`

### 3. Academics & Attendance
- **Course**: `id, tenantId, code, name, departmentId, credits`
- **CourseSection**: `id, tenantId, courseId, termId, instructorId, schedule, room`
- **Enrollment**: `id, tenantId, studentId, courseSectionId, status, finalGrade, attendanceRate`
- **AttendanceRecord**: `id, tenantId, courseSectionId, studentId, date, status (PRESENT, ABSENT, EXCUSED, LATE), verifiedBy`
- **Assessment**: `id, tenantId, courseSectionId, title, maxScore, weightPercent, dueDate`
- **Submission & Grade**: `id, tenantId, assessmentId, studentId, score, submittedAt, isLate, feedback`

### 4. Student Goals & Agency
- **StudentGoal**: `id, tenantId, studentId, title, category (ACADEMIC, CAREER, WELLNESS, PERSONAL), targetDate, status (IN_PROGRESS, COMPLETED, ON_HOLD), sharedWithAdvisor`
- **GoalMilestone**: `id, tenantId, goalId, title, dueDate, isCompleted, reflectionNote`

### 5. Interventions & Case Management
- **Referral**: `id, tenantId, studentId, referredByUserId, category (TUTORING, ADVISING, COUNSELING, WRITING_CENTER, FINANCIAL_AID), reason, priority, status (OPEN, ACCEPTED, IN_PROGRESS, CLOSED), closedLoopNotes, createdAt`
- **SupportCase**: `id, tenantId, studentId, assignedCounsellorId, priority, status (REFERRED, INTAKE, PLAN_ACTIVE, FOLLOWUP_DUE, RESOLVED), referralId, openedAt, closedAt`
- **ConfidentialCaseNote**: `id, tenantId, caseId, counsellorId, encryptedNoteBody, noteType (INTAKE, SESSION, CRISIS_EVALUATION, CLOSURE), accessAuditLog (JSON)`
- **InterventionPlan**: `id, tenantId, studentId, ownerUserId, goal, identifiedBarrier, agreedAction, responsibleParty, targetDate, status, studentSignedAt`
- **Appointment**: `id, tenantId, studentId, staffUserId, appointmentType (ADVISING, COUNSELING, OFFICE_HOURS, TUTORING), scheduledAt, durationMinutes, status (REQUESTED, CONFIRMED, COMPLETED, CANCELLED), notes`

### 6. AI Early Warning & Governance
- **RiskAssessment**: `id, tenantId, studentId, riskTier (LOW, MODERATE, ELEVATED), vitalityScore (0-100), contributingFactors (JSON: factor, weight, direction), modelVersion, confidenceScore, dataCompletenessScore, calculatedAt`
- **RiskOverride**: `id, tenantId, riskAssessmentId, staffUserId, previousTier, overriddenTier, rationale, timestamp`
- **AIModelVersion**: `id, modelCode, version, deployedAt, status, accuracy, aucRoc, fairnessMetrics (JSON), trainingDatasetLineage`
- **ModelCard**: `id, modelVersionId, description, intendedUse, outOfScopeUse, knownBiases, limitations`

### 7. Auditing & Commercial
- **AuditEvent**: `id, tenantId, actorUserId, action, resourceType, resourceId, ipAddress, userAgent, timestamp, details (JSON)`
- **SubscriptionPlan**: `id, code, name, maxStudents, maxFaculty, aiFeaturesEnabled, integrationsEnabled, monthlyFee`
- **DataImportJob**: `id, tenantId, sourceFileName, entityType, recordsProcessed, successCount, failureCount, errors (JSON), status, executedAt`
