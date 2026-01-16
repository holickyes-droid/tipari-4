# SystemCore Operational Runbook (v3.8.1)

## Úvod (účel a použití)
Tento zjednodušený Operational Runbook slouží jako praktická příručka pro DevOps, QA, Admin a Compliance týmy. Spojuje provozní instrukce, validace a Deployment Validation Checklist do jednoho dokumentu, který je připravený k okamžitému použití v každodenním provozu i při incidentech.

**Cílové role:**
- **DevOps**: provoz, CI/CD, monitoring, incidenty, dostupnost.
- **QA**: validace buildů, testů, E2E a regresí.
- **Admin**: provozní zásahy a schvalování.
- **Compliance**: audit, GDPR, A11y.

---

## Denní provozní procesy (Daily Operations)
**Cíl:** zajistit stabilní provoz a včasné odhalení anomálií.

**Denní checklist (min. 1×/den):**
1. Zkontrolovat stav CI/CD pipeline (poslední build/test/deploy).
2. Zkontrolovat SLA metriky (uptime, latency, error rate).
3. Zkontrolovat AuditLog a otevřené SystemIncidenty.
4. Ověřit běh cron procesů (GDPR anonymizace, matching, audit archivace).
5. Ověřit integrity checky (schema lint + data integrity).

**Týdenní úlohy:**
- Revize trendů SLA a incidentů.
- QA regresní testy v stagingu.
- Compliance kontrola GDPR/A11y reportů.

---

## Incident Response (postup při chybě)
**Cíl:** standardizované řešení incidentů od detekce po uzavření.

**Postup:**
1. **Alert**: incident zachycen monitoringem nebo CI/CD.
2. **Klasifikace**: definovat typ a závažnost (build failure, data integrity, SLA breach, anonymization failure).
3. **Reakce**: aplikovat mitigaci (rollback, hotfix, dočasné omezení funkcí).
4. **Ověření**: QA/DevOps ověřuje opravu.
5. **Uzavření**: záznam do AuditLog + uzavření SystemIncident.

**Zodpovědnost:**
- DevOps: mitigace, rollback, monitoring.
- QA: validace opravy.
- Compliance: auditní stopa a GDPR validace.

---

## Audit & Compliance (správa auditů, GDPR, A11y)
**Cíl:** zajištění compliance a auditní stopy.

**Hlavní procesy:**
- **AuditLog Review**: pravidelná kontrola všech změn a pipeline běhů.
- **AuditLogArchive exporty**: měsíční export auditních dat.
- **GDPR kontrola**: ověření anonymizace a retention pravidel.
- **A11y audit**: pravidelné testy přístupnosti UX.

**Zodpovědnost:**
- Compliance: auditní kontrola a reporting.
- QA: A11y validace.
- DevOps: zajištění logování a retention.

---

## Monitoring & Alerts (metriky, SLA, notifikace)
**Cíl:** včasná detekce výpadků a degradací.

**Monitorované metriky:**
- Uptime
- Error rate
- Latency
- Cron job health

**Alerting:**
- **Critical**: výpadek produkce, zásadní incident → okamžitá eskalace.
- **High**: degradace SLA → rychlé řešení do 4 hodin.
- **Medium/Low**: sledování trendů a backlog.

**Kanály:** Slack / email / incident ticket systém.

---

## Security & Access Control (RBAC, Admin override)
**Cíl:** řízení přístupů a auditování zásahů.

**Pravidla:**
- Všechny zásahy admina musí být logovány (Admin Canonical Input).
- RBAC musí být ověřen před deploymentem nebo kritickým admin zásahem.
- Všechny změny musí být auditovatelné v AuditLog.

---

## Reporting & Review (reporty, retrospektivy)
**Cíl:** transparentní reporting a zlepšování procesů.

**Reporty:**
- **Operational Summary** (týdně)
- **Audit Summary** (měsíčně)
- **Compliance Report** (kvartálně)

**Retrospektivy:**
- Po každém kritickém incidentu.
- Výstupem je akční plán na prevenci opakování.

---

## Deployment Validation Checklist
Tabulka checklistu pro validaci nasazení. Všechny položky jsou zatím ve stavu **Pending Validation** a budou aktualizovány po prvním běhu.

| Kontrolní bod | Stav (OK / Pending / N/A) |
| --- | --- |
| Build pipeline úspěšný | Pending Validation |
| Linting bez kritických chyb | Pending Validation |
| Unit testy úspěšné | Pending Validation |
| Integration testy úspěšné | Pending Validation |
| E2E testy úspěšné | Pending Validation |
| QA reporty vygenerovány | Pending Validation |
| AuditLog entry vytvořen | Pending Validation |
| GDPR kontrola úspěšná | Pending Validation |
| A11y validace úspěšná | Pending Validation |
| Monitoring a alerty aktivní | Pending Validation |
| RBAC/RBA ověřeno | Pending Validation |
| Incident reporting aktivní | Pending Validation |

---

## Poznámky pro tým
Po prvním běhu pipeline musí být checklist aktualizován takto:
- **DevOps**: doplní stav build/test/deploy, audit logy, incidenty a monitoring.
- **QA**: doplní výstupy z testů, A11y a regresí.
- **Compliance**: doplní GDPR validace a auditní status.

Checklist se aktualizuje po každém major release a po kritickém incidentu, aby odrážel reálný stav metrik (SLA, audit logy, incidenty).

---

Mám podle tohoto Runbooku vytvořit Governance Review Deck (shrnutí SLA, incidentů a auditních metrik pro vedení)?
Doporučení: vytvořit až po druhém QA cyklu, aby metriky reflektovaly stabilizovaný provoz a byly dostatečně reprezentativní.
