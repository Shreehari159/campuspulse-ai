# CampusPulse AI — Product Requirements Document (PRD)

## 1. Executive Summary & Philosophy
CampusPulse AI is an enterprise-grade multi-tenant Student Success, Early Warning, and Human-Centered Intervention SaaS platform designed for higher education institutions.
**Core Philosophy: STUDENT = PERSON, NOT RECORD.**
The platform focuses on holistic understanding, empathetic outreach, dignity, privacy, and actionable human-in-the-loop workflows rather than punitive surveillance or automated sanctions.

## 2. Target Personas
1. **Students**: Empowered learners seeking clarity on academic vitality, degree progress, personal goals, and seamless access to supportive advising, counselling, and tutoring without stigmatization.
2. **Faculty**: Instructors teaching courses, monitoring class attendance, identifying academic disengagement, and initiating confidential, closed-loop support referrals.
3. **Academic Advisors**: Professionals managing assigned advisee cohorts, building collaborative Academic Success Plans, and tracking milestone recovery.
4. **Counsellors & Mental Health Professionals**: Licensed practitioners managing sensitive support cases, scheduling confidential appointments, and recording HIPAA/FERPA-compliant private case notes completely firewalled from academic rosters.
5. **Institution Administrators (Provosts, Deans, Retention Directors)**: Strategic leaders monitoring retention cohorts, gateway course completion, intervention velocity, and regulatory data governance.
6. **Platform Super Administrators**: SaaS operators provisioning institutional tenants, managing subscription tiers (Starter, Professional, Enterprise), feature flags, and system telemetry.

## 3. Functional Modules
- **Tenant Isolation & Institution Onboarding**: Multi-tenant architecture with custom branding, academic terms, grading scales, and departments.
- **Student 360 Master Profile**: Academic vitality, credit progress, attendance timeline, personal goal tracker with milestones, and a student data transparency drawer ("Why am I seeing this?").
- **Faculty Command Center**: Roster engagement analytics, attendance logging, academic warning signals, and rapid referral workflows.
- **Advisor Workspace**: Advisee management, risk triage, collaborative success plans, and appointment scheduling.
- **Counsellor Case Suite**: Confidential case management (REFERRED -> INTAKE -> PLAN_ACTIVE -> FOLLOWUP_DUE -> RESOLVED), encrypted notes, and crisis safety protocol (human-in-the-loop).
- **AI Early Warning & Explainability Engine**: Rule-based indicators + explainable factor attribution (SHAP-style weights), data completeness metrics, model confidence, and human override logs.
- **AI Governance & Model Registry**: Version tracking, training dataset lineage, fairness/bias audits across cohorts, calibration metrics, and model cards.
- **Communication & Appointment Hub**: Student-staff messaging, office-hour booking, automated reminders, and calendar coordination.
- **Campus Knowledge & Resource Directory**: Curated institutional resources (tutoring, writing center, financial aid, accessibility, wellness).
- **Data Ingestion Engine**: CSV/SIS/LMS import wizard with schema validation, column mapping, preview, duplicate detection, and audit history.
- **Commercial SaaS & Subscriptions**: Plan tiering, seat utilization, usage metering, and tenant provisioning.
