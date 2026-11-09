# CampusPulse AI — REST API Specification

All endpoints are versioned under `/api/v1` and require authenticated session context (`x-tenant-id` header or Bearer token).

## Endpoints Summary

### Authentication & Tenant Context
- `GET /api/v1/auth/me`: Current session user, roles, permissions, active tenant profile.
- `POST /api/v1/auth/switch-role`: Switch active role simulation (for multi-role testing/admin).
- `GET /api/v1/tenants`: List accessible institutional tenants.
- `POST /api/v1/tenants`: Provision new institution tenant (Super Admin).
- `PATCH /api/v1/tenants/:id`: Update tenant branding, subscription, or status.

### Students & Student 360
- `GET /api/v1/students`: Filterable list of students with vitality, attendance, and risk summary.
- `GET /api/v1/students/:id`: Detailed Student 360 profile respecting caller RBAC.
- `GET /api/v1/students/:id/vitality`: Student-friendly vitality metrics and transparency breakdown.
- `GET /api/v1/students/:id/goals`: Student personal goals and milestones.
- `POST /api/v1/students/:id/goals`: Create new goal with target milestones.
- `PATCH /api/v1/students/:id/goals/:goalId`: Update goal progress, reflection notes, or advisor share.

### Faculty Command Center
- `GET /api/v1/faculty/courses`: Courses and sections assigned to current faculty.
- `GET /api/v1/faculty/courses/:sectionId/roster`: Section roster with attendance rate, recent absences, assignment scores.
- `POST /api/v1/faculty/referrals`: Create an academic referral for a student with closed-loop tracking.

### Academic Advising
- `GET /api/v1/advisors/advisees`: List assigned advisees with priority indicators.
- `GET /api/v1/advisors/interventions`: Collaborative Academic Success Plans for advisees.
- `POST /api/v1/advisors/interventions`: Create new collaborative intervention plan.
- `PATCH /api/v1/advisors/interventions/:id`: Update intervention plan status, milestones, or outcome.

### Counsellor Suite (Confidential FERPA/HIPAA Boundary)
- `GET /api/v1/counsellors/cases`: Confidential active cases in lifecycle (REFERRED, INTAKE, PLAN_ACTIVE, FOLLOWUP_DUE, RESOLVED).
- `GET /api/v1/counsellors/cases/:caseId`: Detailed case file with clinical notes (access audited).
- `POST /api/v1/counsellors/cases/:caseId/notes`: Append encrypted confidential note.
- `PATCH /api/v1/counsellors/cases/:caseId/status`: Advance case lifecycle state.

### AI Early Warning & Governance
- `GET /api/v1/risk/students/:studentId`: Explainable factor breakdown (SHAP-style weights), data completeness, confidence.
- `POST /api/v1/risk/override`: Human-in-the-loop override with recorded staff rationale.
- `GET /api/v1/risk/governance/models`: Model registry, version history, fairness evaluations across cohorts, model cards.
- `POST /api/v1/ai/generate-intervention`: Server-side Gemini AI generation of supportive, human-centered intervention strategies.

### Communication & Appointments
- `GET /api/v1/appointments`: List appointments for current student/staff.
- `POST /api/v1/appointments`: Book advising, counseling, or office hours slot.
- `PATCH /api/v1/appointments/:id`: Reschedule or update status (CONFIRMED, COMPLETED, CANCELLED).
- `GET /api/v1/messages`: Threaded messages between student, advisor, faculty.
- `POST /api/v1/messages`: Send direct support message.

### Analytics, Ingestion & Super Admin
- `GET /api/v1/analytics/retention`: Executive retention rates, term persistence, department performance, intervention velocity.
- `POST /api/v1/imports/csv`: Ingest CSV/SIS data with column mapping, schema validation, preview, and conflict resolution.
- `GET /api/v1/audit/logs`: Immutable security audit log stream.
- `GET /api/v1/subscriptions`: Available subscription tiers, seat usage, and tenant billing history.
