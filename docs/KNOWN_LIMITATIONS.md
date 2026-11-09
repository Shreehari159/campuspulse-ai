# CampusPulse AI — Known Operational Boundaries & Future Enhancements

## 1. External SIS/LMS Direct API Adapters
- The current build provides a robust, self-healing CSV / Excel mapping and ingestion engine with real-time schema validation and conflict detection.
- Live bi-directional OAuth/LTI 1.3 connectors for Canvas, Blackboard, and Ellucian Banner require institution-specific production client credentials and IP whitelisting; the architecture defines standardized integration interfaces ready for institutional credentials.

## 2. SMS & Telephony Integrations
- Notification delivery operates in-app with browser notifications and webhook triggers. Twilio / Sinch SMS dispatch adapters are designed to trigger once institutional SMS gateway credentials and shortcodes are configured.

## 3. Human Clinical Boundaries
- CampusPulse AI explicitly does **NOT** provide automated mental health diagnoses or crisis interventions. Crisis indicators present direct referral numbers (e.g. 988 Suicide & Crisis Lifeline) and immediate routing to licensed campus human professionals.
