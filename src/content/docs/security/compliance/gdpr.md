---
title: "GDPR for Engineers"
description: "Practical GDPR requirements for software engineers — what to build, what to avoid, and how to implement data subject rights."
---

GDPR (General Data Protection Regulation) applies to any organization processing personal data of EU residents, regardless of where the organization is based. Engineers are responsible for the technical implementation of GDPR obligations.

## What Counts as Personal Data

Personal data is any information that can identify a natural person, directly or indirectly:

- **Direct identifiers:** Name, email, national ID number, phone number
- **Online identifiers:** IP addresses, cookie IDs, device fingerprints
- **Location data:** GPS coordinates, home address
- **Biometric data:** Fingerprints, facial recognition data (special category)
- **Health data:** Medical records, diagnoses (special category — higher protection)
- **Pseudonymous data:** Still personal if re-identification is possible with additional data

**Aggregated/truly anonymous data** is not personal data and falls outside GDPR.

---

## Data Minimization

Collect only what you actually need. Every data field you collect is a liability.

```
Before adding a new data collection:
1. What is the specific purpose?
2. Do we have a lawful basis?
3. Is this field actually necessary for that purpose?
4. How long will it be retained?
5. Who will have access to it?
```

**In code:**
```javascript
// ✗ Collecting everything "just in case"
const user = await User.create({
  email, name, phone, birthdate, gender, address, employer, income, ...req.body
});

// ✓ Collecting only what the feature requires
const user = await User.create({ email, name });
// Additional fields collected only when needed, with clear purpose
```

---

## Lawful Bases for Processing

You must have one of six lawful bases for each type of data processing:

| Basis | When to use |
|---|---|
| **Consent** | User actively opted in; must be freely given, specific, informed, unambiguous |
| **Contract** | Processing necessary to fulfill a contract with the user |
| **Legal obligation** | Required by law (e.g., tax records, fraud reporting) |
| **Vital interests** | Emergency situations to protect life |
| **Public task** | Public authorities carrying out official duties |
| **Legitimate interests** | Balanced interest in processing vs. user's rights |

**Consent design rules:**
- Opt-in by default — no pre-checked boxes
- Separate consent for separate purposes
- As easy to withdraw as to give
- Cannot be bundled with terms of service
- Records of consent must be kept

```javascript
// ✗ Pre-checked or bundled consent
<input type="checkbox" checked> I agree to marketing emails and terms of service

// ✓ Separate, explicit, not pre-checked
<input type="checkbox"> I agree to receive marketing emails (optional)
<input type="checkbox" required> I agree to the Terms of Service
```

---

## Data Subject Rights

GDPR grants users eight rights. You must provide mechanisms to fulfill them within one month.

### Right of Access (Article 15)

Users can request all personal data you hold about them.

```javascript
// Data export endpoint
app.get('/api/me/data-export', auth, async (req, res) => {
  const userId = req.user.id;

  const [user, orders, events, preferences] = await Promise.all([
    User.findById(userId),
    Order.findAll({ userId }),
    AuditLog.findAll({ userId }),
    Preferences.findById(userId),
  ]);

  // Assemble complete picture of all data held
  res.json({
    profile: user,
    orders,
    activity: events,
    preferences,
    exportedAt: new Date().toISOString(),
  });
});
```

### Right to Erasure (Article 17) — "Right to Be Forgotten"

Users can request deletion of their personal data when there's no longer a lawful basis to keep it.

```javascript
app.delete('/api/me', auth, async (req, res) => {
  const userId = req.user.id;

  // Must propagate to all storage locations
  await Promise.all([
    User.anonymize(userId),          // replace PII with 'DELETED'
    Order.retainForTax(userId),      // keep for legal obligation, but strip PII
    EventLog.delete({ userId }),     // no legal basis to keep
    SearchIndex.remove(userId),      // remove from search
    CDN.purgeUserUploads(userId),    // remove uploaded files
    notifySubProcessors(userId),     // tell Stripe, Mailchimp, etc.
  ]);

  // Cancel active sessions
  await Session.deleteAll({ userId });

  res.json({ message: 'Your account and personal data have been deleted' });
});
```

**Anonymization vs deletion:** You may keep some records (order history for tax) if you strip or replace all personal data fields. An order can retain amount, product, date — but remove customer name, email, IP.

### Right to Portability (Article 20)

Users can export their data in a machine-readable format:

```javascript
// Export as structured JSON or CSV
res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
res.json(userData);
```

### Right to Rectification (Article 16)

Users can correct inaccurate data. Provide profile editing in the UI.

### Right to Object / Restrict Processing (Articles 21, 18)

Users can object to processing based on legitimate interests or request restriction while a dispute is investigated.

### Right to not be subject to automated decisions (Article 22)

If your product makes significant decisions by purely automated means (loan approval, job screening), users can request human review.

---

## Data Retention

Define and enforce retention periods for all data types:

```javascript
// Example retention policy implementation
const RETENTION_PERIODS = {
  user_events: 90,        // days — analytics logs
  session_data: 30,       // days — security
  order_records: 7 * 365, // days — tax/legal requirement
  support_tickets: 3 * 365,
  deleted_accounts: 30,   // days — to process late erasure requests
};

// Scheduled job (runs daily)
async function enforceRetention() {
  for (const [table, days] of Object.entries(RETENTION_PERIODS)) {
    const cutoff = new Date(Date.now() - days * 86400 * 1000);
    await db.query(`DELETE FROM ${table} WHERE created_at < $1`, [cutoff]);
  }
}
```

---

## Breach Notification

If personal data is breached, you must:

1. **Within 72 hours:** Notify your Data Protection Authority (DPA) — unless the breach is unlikely to result in risk
2. **Without undue delay:** Notify affected users — if the breach is likely to result in *high* risk to their rights

**Incident response for data breaches:**
```
Hour 0:    Detect breach
Hour 1:    Contain (revoke credentials, take system offline if needed)
Hour 4:    Assess scope (what data, how many users, what risk)
Hour 24:   Internal incident report
Hour 48:   Draft DPA notification
Hour 72:   File DPA notification (deadline)
Day 3-7:   Notify affected users if high risk
```

---

## Technical Measures Required by GDPR

GDPR doesn't prescribe specific technologies but requires "appropriate technical measures" (Article 32):

| Measure | Implementation |
|---|---|
| Encryption at rest | AES-256-GCM for sensitive fields; encrypted database volumes |
| Encryption in transit | TLS 1.2+ for all data transmission |
| Access control | RBAC; least privilege; MFA for production access |
| Pseudonymization | Replace direct identifiers with tokens where possible |
| Data integrity | Checksums, audit logs, tamper detection |
| Availability | Backups, redundancy, disaster recovery |
| Regular testing | Penetration testing, vulnerability scanning |
| Privacy by design | Security built in from architecture phase |

---

## Sub-Processors

Any third party that processes personal data on your behalf is a sub-processor. You need:

1. A **Data Processing Agreement (DPA)** with each sub-processor
2. A list of sub-processors disclosed to users (in your Privacy Policy)
3. Notification to users before adding new sub-processors (30 days notice is common)

Common sub-processors requiring DPAs: Stripe, Mailchimp/SendGrid, Intercom, Datadog, Sentry, AWS, Google Cloud, Salesforce.

---

## Quick Engineering Checklist

- [ ] Data inventory: know what personal data is collected, where it's stored, why
- [ ] Lawful basis documented for each processing activity
- [ ] Consent mechanism is opt-in, specific, and withdrawable
- [ ] Data minimization: no unused or unnecessary fields
- [ ] Retention periods defined and automated deletion in place
- [ ] Data access endpoint implemented (Article 15)
- [ ] Data deletion endpoint implemented (Article 17) — propagates to all stores
- [ ] Data export endpoint implemented (Article 20)
- [ ] Breach detection and notification procedure in place
- [ ] DPAs signed with all sub-processors
- [ ] Privacy Policy up to date and accurate
- [ ] Encryption at rest and in transit for personal data
