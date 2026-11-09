# CampusPulse AI — AI Governance, Ethics & Model Operations

## 1. Ethical Principles & Anti-Stigmatization Directive
- **Human-in-the-Loop Requirement**: AI never independently executes academic dismissals, revokes financial aid, or issues punitive sanctions. Every consequential intervention requires human review and signoff.
- **Explainable Decisions**: Every risk classification must supply transparent contributing factors with signed direction and relative weighting (e.g., Attendance trend: -32%, Missing milestones: -25%, LMS login frequency: -14%).
- **Non-Stigmatizing Vocabulary**: Student-facing interfaces display vitality indicators such as "On Track", "Needs Focus", "Growth Opportunity", and "Support Available". Never expose raw probabilistic dropout percentages to students.

## 2. Feature Governance & Exclusions
- **Permitted Predictors**: Course attendance patterns, assignment submission timeliness, LMS activity frequency, prerequisite course completion, credit velocity.
- **Strictly Excluded Predictors**: Mental health notes, counseling attendance, demographic protected classes (race, religion, gender, disability), financial distress disclosures, disciplinary records.

## 3. Model Registry & Model Cards
- **Registry Structure**:
  - Model ID & Version (e.g. `CP-RETENTION-XGB-v2.4`)
  - Training Dataset Lineage & Sample Size
  - Evaluation Metrics (AUC-ROC, Precision@K, Recall, Brier Calibration Score)
  - Cohort Fairness Disparity Ratios across academic departments and student demographics
  - Model Card documentation outlining intended use cases, known operational limitations, and data freshness thresholds.
- **Drift & Degradation Monitoring**: Feature drift (PSI > 0.2) or population shift triggers automated alerts and falls back to deterministic rule-based heuristics until re-calibrated.

## 4. Human Override Protocol
- Academic staff may override any model risk tier assignment.
- All overrides require a documented rationale, recorded in an immutable audit ledger (`RiskOverride`).
