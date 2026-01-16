# SystemCore Documentation

**Tipari.cz — B2B Investment Platform**

---

## SYSTEM CORE v3.4.0 — GOVERNANCE MODULAR SPLIT

**Date:** 2026-01-14
**Governance Status:** Active — Modular Structure Enabled

---

This document contains the Governance Framework, Business Rules, and Process Descriptions for the System Core. It serves as the canonical source of truth for platform behavior and compliance.

---

# I. EXECUTIVE SUMMARY

## 1. Purpose & Mission
SystemCore (Tipari.cz) vznikl jako B2B investiční platforma, která sjednocuje workflow projektů, investorů a brokerů do jednoho auditovatelného systému. Mise projektu je odstranit roztříštěnost dat a procesů v realitním financování tím, že centralizuje datovou pravdu (schema + governance) a zajišťuje konzistentní procesy od registrace po provize a compliance.

## 2. User Value & Core Benefits
- **Investor:** rychlé a transparentní párování investičních příležitostí, bezpečná správa preferencí, auditní dohled nad rozhodnutími.
- **Broker:** jednotný pipeline pro onboarding investorů a správu rezervací s automatizovanými validacemi.
- **Developer:** standardizované datové kontrakty, jednoznačné procesní kroky a dostupné auditní záznamy.
- **Admin:** centralizované governance řízení, audit trail, SLA monitoring a možnost řízených manuálních zásahů.

## 3. System Overview & Core Modules
- **Data Layer:** SystemCoreSchema a vazby Project → Ticket → Reservation → Commission včetně integrity a constraintů.
- **Logic Layer:** workflow matchingu, rezervací, provizí a automatizovaných auditních procesů.
- **Governance:** RBA/RBAC, AuditLog, incident management a compliance pravidla (GDPR, WCAG).
- **UX Layer:** SystemCoreUXLibrary s mapováním dat do UI a ověřenou přístupností.
- **Automation:** cron procesy pro anonymizaci, archivace logů a SLA monitoring.
- **CI/CD:** pipeline, validation framework a release governance pro stabilní nasazování.

## 4. Development Milestones (v3.0–v4.0)
- **v3.4.0:** governance modular split a stabilizace dokumentační struktury.
- **v3.7.x:** rozsáhlý refaktor datového modelu, auditní validace a sjednocení workflow.
- **v3.8.1:** compliance rozšíření (GDPR pre-anonymizace, A11y) a produkční integrace.
- **v4.0:** optimalizační fáze zaměřená na stabilitu, výkon a governance kvalitu.

## 5. Current State & Governance Readiness
SystemCore je ve verzi 4.0 s připravenými release a validačními artefakty. Governance status je aktivní, auditní a compliance procesy jsou definované a podporují dlouhodobý provoz. Systém má formálně popsané metriky KPI/SLA a připravený rámec pro post-release validaci.

## 6. Executive Overview
SystemCore (Tipari.cz) je B2B investiční platforma postavená na centralizovaných datech, auditních pravidlech a automatizovaných workflow. Projekt sjednocuje procesy investorů, brokerů, developerů i administrátorů a poskytuje auditovatelný průchod dat napříč celým lifecyclem. Vývojový cyklus v3.0–v4.0 přinesl refaktoring, compliance rozšíření a optimalizace stability a výkonu. Aktuální governance rámec zahrnuje RBA/RBAC, auditní logy a monitoring SLA, což umožňuje dlouhodobý provoz bez ztráty kontroly. Platforma je připravena na stabilní provoz díky jednotné datové architektuře, automatizaci a jasně definovaným metrikám kvality.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit jasnou vazbu na konkrétní datové kontrakty (API/DB) a uvést, které části jsou již implementované vs. plánované.
- Chybí přehled klíčových metrik s konkrétními hodnotami (SLA, test coverage, incident rate) a jejich zdroje v auditních reportech.
- Bylo by vhodné rozšířit sekci o mezikapitoly pro klíčové procesy (matching, rezervace, provize, incident workflow) s diagramy toků.
- Doporučuji sjednotit terminologii mezi UXLibrary, Appendixy a schema (naming, field mapping) a explicitně to popsat v architektuře.
- V další fázi doporučuji dopracovat governance sekci o detailní RBA/RBAC matice a zmapování kontrolních bodů v CI/CD pipeline.

# II. PROJECT SCOPE

## 1. Functional Scope
SystemCore pokrývá celý životní cyklus B2B investičních projektů: správu projektů a tiketů, registraci investorů a brokerů, rezervace a provize, investor matching, auditní logování, incident management a compliance evidenci. Platforma sjednocuje datový model a workflow tak, aby byly všechny kroky měřitelné, dohledatelné a konzistentní napříč rolemi.

## 2. Non-Functional Scope
Systém je navržen s důrazem na dostupnost, výkon a auditovatelnost. Klíčové cíle zahrnují vysoké SLA, bezpečné zpracování dat, škálovatelnost pro růst portfolia projektů a stabilní CI/CD s validačními kroky pro release governance. Compliance cíle zahrnují GDPR a WCAG 2.1 AA.

## 3. User Roles & Stakeholders
- **Investor:** správa profilu, preferencí a interakce s investičními příležitostmi.
- **Broker:** onboarding investorů, správa rezervací a komunikace s projekty.
- **Developer:** správa projektových dat a dokumentace, spolupráce na lifecycle projektu.
- **Admin:** governance dohled, auditní zásahy, SLA monitoring a schvalování.
- **Compliance:** kontrola GDPR, A11y a auditních výstupů.
- **QA:** ověřování kvality, test coverage a validační reporty.
- **DevOps:** CI/CD pipeline, monitoring a incident response.

## 4. Core Workflows & Processes
Hlavní procesní tok zahrnuje publikaci projektu, vznik tiketu, rezervaci investora, vznik provize a auditní záznamy pro každý krok. Investor matching běží automatizovaně při změnách klíčových dat. Governance procesy doplňují workflow o schvalování, incident logging, auditní archivy a compliance checkpointy.

## 5. External Dependencies
Systém je závislý na API kontraktech pro CRUD operace a na externích integračních bodech (např. e-sign, notifikační kanály, CI/CD tooling). Data vstupy z brokerů a developerů jsou canonical zdroj, auditní exporty a reporty jsou určeny pro interní i externí kontrolu.

## 6. Constraints & Assumptions
Platforma musí dodržovat GDPR, archivaci auditních záznamů a přístupová pravidla RBA/RBAC. Předpokládá se stabilní infrastruktura pro provoz (staging/production), pravidelné auditní cykly a udržovaná verze schema/UX knihovny. Technické limity zahrnují řízené změny datového modelu a povinnost dokumentovat všechny zásahy do canonical dat.

## 7. Summary of Project Boundaries
SystemCore pokrývá datové, procesní a governance vrstvy investičního workflow na Tipari.cz, od registrace a párování až po provize a audit. Neřeší externí finanční transakce mimo definovaný lifecycle a předpokládá integraci pouze přes definované API a auditní výstupy.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit Scope Breakdown a Use Case Matrix pro jednotlivé role a jejich povolené akce.
- Chybí jasná Role–Process Mapping tabulka, která by ukazovala, kdo vlastní a schvaluje jednotlivé procesy.
- Bylo by vhodné rozšířit část o externích závislostech na detailní integrační mapu (API, notifikace, e-sign).
- V další fázi doporučuji sjednotit bezpečnostní a monitoring požadavky do samostatné mezikapitoly (Security & Observability Scope).
- Při přechodu na verzi 4.1 doporučuji revidovat rozsah podle reálných provozních metrik a doplnit explicitní SLA cíle pro kritické workflow.

# III. SYSTEM ARCHITECTURE

## 1. Architektonické vrstvy
- **Frontend (UX/UI knihovna):** SystemCoreUXLibrary poskytuje standardizované komponenty pro investory, brokery, adminy i QA a mapuje data ze schema do UI.
- **Backend (logika, služby):** business služby zajišťují matching, rezervace, provize, notifikace, auditní validace a SLA procesy.
- **Datová vrstva (schema, entity):** SystemCoreSchema definuje canonical entity, jejich vazby a integritní pravidla.
- **Governance vrstva:** AuditLog, incidenty, RBA/RBAC, GDPR a A11y compliance procesy a evidence.
- **Automatizace a cron joby:** periodické anonymizace, archivy auditních logů, SLA monitoring a scheduled matching.
- **CI/CD a monitoring:** pipeline kroky, validační brány, release governance a provozní metriky.

## 2. Datové entity a jejich vazby
Hlavní entity a vazby vycházejí ze SystemCoreSchema: **Project** je publikovaný investiční objekt, který generuje **Ticket**. Ticket může být rezervován přes **Reservation**, což spouští workflow pro **Commission**. **Investor** a **User** data jsou canonical vstupy, auditované přes **AuditLog**. Pro incidenty a provozní odchylky slouží **SystemIncident** a související auditní záznamy. Vazby jsou navrženy tak, aby každý krok měl dohledatelnou auditní stopu.

## 3. Business logika
Business logika z Appendixu popisuje výpočty provizí, SLA procesy a matching. Provize se vážou na aktivaci rezervace a obsahují finance/metadata. Matching logika se spouští na změny investora, tiketu nebo projektu a vytváří persistentní výsledky. SLA a časové procesy definují reakční okna pro incidenty a validace. Automatické triggery a cron joby pokrývají anonymizaci, auditní archivy a monitoring SLA.

## 4. API kontrakty
Základní endpointy poskytují CRUD a provozní integrace:
- **/api/projects** — správa projektů a publikace.
- **/api/tickets** — tikety, dostupnost a rezervace.
- **/api/reservations** — workflow rezervací a potvrzení.
- **/api/commissions** — provize a billing metadata.
- **/api/investor-matching** — matching výsledky a recalculace.
- **/api/incidents** — auditní incidenty a SLA evidence.
- **/api/audit-log** — auditní záznamy a archivace.
- **/api/cicd-runs** — CI/CD běhy a validační reporty.

## 5. Automatizace a integrační procesy
Frontend komunikuje přes API, backend validuje a zapisuje canonical data do schema, následně generuje auditní záznamy. Automatizace zajišťuje notifikace, SLA měření, anonymizaci a incident reporting. CI/CD pipeline integruje validační kroky (schema lint, QA, compliance checks) a publikuje výsledky do auditních reportů.

## 6. Technologický stack
- **Frontend:** React 18 + TypeScript
- **Backend:** Node.js 18 / Express (nebo ekvivalent)
- **Databáze:** PostgreSQL 15+
- **CI/CD:** GitHub Actions + Docker (release governance, pipelines)
- **Monitoring:** auditní logy, SLA metriky, incident dashboard

## 7. Diagram architektury (textově)
```
User/UX → API Gateway → Backend Services → SystemCoreSchema (DB)
    ↘ Audit & Compliance → AuditLog / SystemIncident → Reports
    ↘ Automation → Cron Jobs (GDPR, SLA, Archive)
    ↘ CI/CD → Validation → Release Governance
```

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit detailní API kontrakty (request/response modely) a sekvenční diagramy pro klíčové procesy.
- Chybí specifikace škálování, zálohování a disaster recovery včetně RPO/RTO cílů.
- Bylo by vhodné rozšířit monitoring a observability sekci o metriky, log retention a alerting flow.
- V další fázi doporučuji doplnit detailní mapování datových toků mezi UX komponentami a schema fieldy.
- Pro verzi 4.1 doporučuji vizualizovat architekturu pomocí DFD/ERD diagramů a rozšířit bezpečnostní vrstvu (token policy, secrets management).

# IV. FUNCTIONAL SPECIFICATION

## 1. Modul Projekty a Tikety
Systém umožňuje zakládání projektů v režimu intake, jejich schvalování a publikaci do veřejného katalogu. Po publikaci vznikají tikety, které reprezentují investiční nabídky a jsou mapovány do UX komponent pro investory a brokery. Vazba **Project → Ticket → Slot → Reservation** určuje, jak je dostupnost projektu rozdělená do investičních slotů a jak se následně rezervuje. Při každé změně stavu projektu nebo tiketu se zapisuje AuditLog a spouští se matching proces pro investory.

## 2. Modul Rezervace a Smlouvy
Rezervace vzniká nad konkrétním slotem tiketu. Životní cyklus rezervace zahrnuje vytvoření, schválení, podpis (včetně e-sign workflow) a expiraci. Při přechodu do stavu **active** se rezervace stává základním vstupem pro Commission Tracking. Smlouvy a jejich metadata jsou auditovány, a pokud vyprší podpisové okno, systém spouští automatickou expiraci s incident logem.

## 3. Modul Provize a Finance
Provize se počítají na základě **commission_amount**, pravidel splitu a entitlementů definovaných v schema a Appendixu. Workflow je rozdělené na **CommissionTracking** (procesní část) a **CommissionFinance** (finanční metadata, fakturace, splatnost). Automatické triggery navazují na změnu stavu rezervace, kdy se aktivuje výpočet provizí a vytvoří se auditní záznamy pro finance a compliance.

## 4. Modul Audit a Incident Management
AuditLog zaznamenává všechny změny a akce v systému včetně CI/CD běhů. **SystemIncident** eviduje incidenty, jejich závažnost a SLA countdown. IncidentDashboard poskytuje provozní přehled pro Admin a DevOps, zatímco CI/CD dashboard je napojený na validační reporty a auditní zápisy. Každý incident musí být uzavřen auditním záznamem a případné re-audity jsou archivovány.

## 5. Modul Matching Investorů
Matching engine páruje investory s projekty na základě preferencí, rizikových parametrů a validací dostupnosti. Výsledkem je **matching score**, který se persistuje a ukládá do investor matching výsledků. Pravidelný validation cron ověřuje relevanci výsledků a vytváří auditní stopu, aby bylo možné prokázat konzistenci mezi datovým modelem a UI výstupy.

## 6. Modul Governance a Compliance
Governance modul pokrývá RBA/RBAC, auditní politiky, GDPR anonymizaci a WCAG compliance. Governance Framework definuje schvalovací procesy pro změny dat, release a incident response. Každý manuální zásah admina se zapisuje do auditních záznamů a každá compliance kontrola generuje auditní checkpointy, které jsou použity pro governance review.

## 7. Modul Automatizace a Cron Joby
Automatizace zahrnuje GDPR pre-anonymization, SLA expirace, commission negotiation cron a matching revalidation cron. Cron joby běží podle definovaných intervalů a jejich výsledky jsou ukládány do AuditLog a Incident managementu. Automatizované procesy generují alerty při selhání nebo překročení SLA.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit detailní use-case scénáře a sekvenční diagramy pro moduly rezervací, provizí a matching, aby byl jasný průchod dat a schvalování.
- Chybí explicitní API kontrakty (request/response modely) pro jednotlivé moduly, zejména pro Commission Engine a Incident Manager.
- Bylo by vhodné rozšířit modul Governance o samostatnou specifikaci politik a kontrolních bodů CI/CD, včetně mapování na konkrétní auditní záznamy.
- Doporučuji vytvořit samostatné dokumenty pro Commission Engine, Matching Engine a Incident Manager, protože jde o kritické části s více stavovými přechody.
- V další fázi doporučuji sjednotit mapování mezi UX komponentami, backend službami a schema entity (např. naming conventions a validace), aby bylo možné snížit integrační rizika ve verzi 4.1.

# V. NON-FUNCTIONAL SPECIFICATION

## 1. Performance Requirements
Kritické API operace (rezervace, matching, zápis provize) musí mít odezvu do 300 ms při běžném provozu. CI/CD pipeline musí dokončit build a release do 8 minut, aby bylo možné udržet rychlou iteraci a governance gating. SLA dostupnost systému je nastavena na ≥ 99.95 % a je monitorována přes incident dashboard a auditní reporty.

## 2. Security & Data Protection
Přístupová práva jsou řízena RBAC s auditováním všech admin zásahů. Data v repozitáři i při přenosu jsou šifrována, přičemž osobní údaje jsou hashované nebo anonymizované dle GDPR pravidel. GDPR pre-anonymization a následné anonymizační běhy mají auditní záznamy včetně notifikací a evidence změn.

## 3. Reliability & Scalability
Systém musí podporovat failover, zálohování a disaster recovery procesy s definovanými RPO/RTO cíli. Databázová vrstva musí být škálovatelná a poskytovat konzistenci při zvýšeném počtu rezervací a matching requestů. Automatizované health-checky a incident alerty detekují výpadky služeb i degradaci výkonu.

## 4. Accessibility (UX Compliance)
UX komponenty musí splňovat WCAG 2.1 AA standard, včetně ARIA atributů, kontrastních barev a správné navigace z klávesnice. Focus indikátory musí být konzistentní a ověřované při každém release. A11y auditní výsledky jsou součástí QA reportů a governance review.

## 5. Monitoring & Logging
IncidentDashboard a CI/CD logy poskytují provozní přehled, zatímco AuditLogArchive uchovává auditní záznamy minimálně 180 dnů. Cron joby (GDPR, SLA, matching revalidation) generují notifikace při chybě a zapisují výsledky do auditních záznamů. Monitoring zahrnuje latency, uptime, error rate a incident trendy.

## 6. Testing & Quality Assurance
Testovací strategie zahrnuje unit, integration a E2E testy s cílovým coverage ≥ 98 %. CI/CD pipeline generuje automatické QA reporty a regresní testy se spouštějí při každém release. Výsledky testů jsou archivovány pro audit a musí být dostupné pro governance review.

## Reviewer Notes — Professional Analysis
- Doporučuji kvantifikovat reálné metriky výkonu a reliability (např. průměrná latence, RPO/RTO) a doplnit je do provozních reportů.
- Chybí explicitní load test scénáře a limitní hodnoty databáze (max TPS, velikost batchů, limit cron jobů).
- Bylo by vhodné vytvořit samostatné přílohy: Performance Benchmark Report, Security Policy a Load Test Plan.
- Doporučuji zavést pravidelné audity ne-funkčních požadavků v CI/CD pipeline a promítnout je do IncidentDashboard.
- V další verzi doporučuji doplnit detailní popis secrets managementu, klíčové rotace a postupů pro breach response.

# VI. DATA MODEL & DATABASE DESIGN

## 1. Entity Overview
Datový model SystemCore je postaven na canonical entitách definovaných ve `SystemCoreSchema.ts`. Klíčové entity zahrnují **Project** (investiční projekt), **Ticket** (publikovaná investiční nabídka), **Reservation** (rezervační záznam investora), **CommissionTracking** a **CommissionFinance** (procesní a finanční část provizí), **Investor** a **User** (primární subjekty), **AuditLog** (auditní stopa), **SystemIncident** (incident management) a **Notification** (notifikace a alerty). Vztahy odpovídají ERD modelu, kde Project generuje Tickets, Ticket je rezervován přes Reservation a Reservation spouští Commission workflow.

## 2. Relationships & Constraints
Vazby jsou primárně **1:N** (Project → Tickets, Ticket → Reservations, Reservation → CommissionTracking) a **N:M** přes spojovací entity pro matching nebo multi-assign logiku. Každá entita má PRIMARY KEY a referenční vazby jsou zajištěny FOREIGN KEY constrainty. Kritické vazby jsou chráněny NOT NULL a UNIQUE pravidly (např. unikátní reservation per investor a slot). Referenční integrita je vynucena pro řetězec Reservation → Ticket → Project → Investor, aby bylo možné auditovat celý lifecycle.

## 3. Indexes & Optimization
Indexy jsou navrženy pro klíčové dotazy: matching (investor_id, ticket_id), incidenty (severity, created_at), rezervace (ticket_id, state) a auditní dotazy (entity_id, event_type, created_at). Optimalizace zahrnuje složené indexy pro SLA reporting, rychlé vyhledávání podle stavu a časových oken a omezení full-scan operací na auditní tabulky.

## 4. Data Integrity & Validation
Validace dat probíhá na úrovni schema (VALIDATION_RULES), TypeScript typů a databázových constraintů. Migrace obsahují kontrolní skripty pro konzistenci a cron joby validují kritické entity (matching relevance, SLA expirace). QA validace zahrnuje kontrolu integrity vazeb, referenční konzistenci a auditní stopu pro všechny změny.

## 5. Retention & Archiving
Auditní data jsou archivována do **AuditLogArchive** s retencí 180 dnů. GDPR anonymizace se aplikuje na investory a brokery dle Appendixu, včetně auditních záznamů o anonymizačních bězích. Notifikace a incidenty mají vlastní retenční politiku s možností archivace nebo purge po uzavření incidentu.

## 6. Migration & Versioning
Verzování schématu je řízeno přes manifest (schema_version) a release plán. Migrace probíhají s backup/rollback procedurou a musí obsahovat auditní záznamy o provedení. Každý release vyžaduje ověření integrity dat po migraci a zápis výsledků do auditního reportu.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit ER diagram a tabulkový přehled entit s explicitními sloupci, typy a constrainty.
- Chybí detailní SQL migrační postupy a benchmarky výkonu (index selectivity, query plans).
- Datový model je konzistentní pro audit a GDPR, ale měl by být rozšířen o agregované auditní pohledy a historické snapshoty.
- V další verzi doporučuji zvážit time-series logging pro SLA a incidenty, případně data warehousing pro reporting.
- Je vhodné detailněji dokumentovat datové toky mezi backendem, frontendem a governance vrstvou v samostatné kapitole nebo příloze.

# VII. UI/UX DESIGN SPECIFICATION

## 1. UI Architecture Overview
UI architektura je postavena na komponentách v `SystemCoreUXLibrary.tsx`, které mapují canonical data do jednotných vizuálních bloků. **ProjectCard** a **TicketCard** zobrazují investiční nabídky, napojují se na matching výsledky a statusy rezervací. **Dashboardy** (Admin, Incident, CI/CD) poskytují agregované metriky, auditní stav a SLA countdown. **IncidentManagement UI** podporuje triage, eskalaci a uzavírání incidentů s auditním logem a notifikacemi.

## 2. Design System & Visual Identity
Design systém definuje jednotnou paletu barev, typografii, spacing a responsivní chování. Kontrastní poměry a typografické hierarchie jsou navrženy tak, aby odpovídaly WCAG 2.1 AA. Komponenty používají standardizované velikosti, stavy a varianty, které zajišťují konzistenci mezi moduly a podporují rychlou orientaci uživatelů.

## 3. UX Principles
UX je navržen s důrazem na jednoduchost, přehlednost a konzistenci. Navigace zachovává hierarchii informací od přehledu projektů až po detail rezervace a provize. Interakční vzory (tlačítka, modály, tabulky) jsou sjednocené napříč moduly, aby bylo možné minimalizovat kognitivní zátěž a zrychlit orientaci.

## 4. Accessibility Standards
Požadavky z `SystemCoreAppendix_Accessibility.tsx` zahrnují ARIA atributy, focus indikátory a ověřené kontrastní barvy. Všechny interaktivní prvky jsou ovladatelné z klávesnice a obsahují vizuální potvrzení stavu. Accessibility audit je součástí release procesu a výsledky se promítají do QA reportů.

## 5. User Flows & Interaction Patterns
Klíčový user flow vede investora od projektu přes ticket k rezervaci a následné provizi. Modály slouží pro potvrzení rezervací, tabulky pro auditní a incidentní přehledy a notifikace informují o změnách stavu. Tlačítka a call-to-action prvky mají jasnou hierarchii a jsou napojeny na auditní eventy při změnách stavu.

## 6. Design System Governance
Design systém je verzován spolu s dokumentací a podléhá governance schvalování. Změny UI komponent musí projít QA a accessibility audit a jsou publikovány přes CI/CD pipeline. Governance rámec zajišťuje, že všechny UX změny mají auditní stopu a jsou konzistentní s datovým modelem.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit design tokens, detailní interakční stavy a definice pro tmavý režim a mobilní rozhraní.
- Chybí komponentové diagramy a flow mapy, které by vizualizovaly vazby mezi UX, daty a auditními procesy.
- Bylo by vhodné rozšířit UX dokumentaci o mikroanimace a systém notifikací včetně priorit a timing pravidel.
- Doporučuji zlepšit viditelnost auditních a governance informací v UI (např. transparentní audit trail pro rezervace).
- V další fázi doporučuji posílit integraci Figma → kód a definovat CI/CD kontroly pro design consistency.

# VIII. DEVOPS & DEPLOYMENT

## 1. Development & Build Process
Build proces následuje pipeline sekvenci **lint → test → compile → artifact → deploy**. CI/CD běhy jsou řízeny přes GitHub Actions a Docker, kde každý build ukládá metriky (čas, coverage, status, commit hash) do auditních záznamů. Artifacty jsou verzované a označené podle manifestu, aby bylo možné dohledat odpovídající release.

## 2. Testing & QA
Testovací strategie pokrývá unit, integration a E2E testy s povinnou QA review. Výstupy z testů generují QA reporty, které jsou archivovány a zapisovány do AuditLog pro compliance. QA review ověřuje správnost datových mapování, UI konzistenci a dostupnostní výsledky.

## 3. Deployment Pipeline
Nasazení probíhá ve fázích **staging → pre-production → production**. Každá fáze vyžaduje governance schválení a auditní checkpoint. Rollback plán je součástí release procesu a aktivuje se při kritických incidentech nebo při překročení SLA limitů.

## 4. Monitoring & Logging
IncidentDashboard a CI/CD dashboard z UX knihovny vizualizují stav deployů, SLA a incidentů. Monitoring sleduje error rate, latency, cron joby a auditní eventy. Logy jsou ukládány do AuditLogArchive a použity pro review a post-release validaci.

## 5. Alerting & Recovery
Notifikace při selhání pipeline, cron jobů nebo SLA breach se posílají přes email/Slack a vytvářejí incident záznam. SLA countdown spouští auto-escalation a pokud se problém nevyřeší v definovaném čase, systém aktivuje rollback. Recovery workflow zahrnuje auditní záznamy a post-incident review.

## 6. Continuous Integration Governance
CI/CD je integrováno do governance procesů prostřednictvím auditních logů, release schvalování a manifestu verzí. Každý release ukládá výsledky testů a auditů do changelogu. Versioning je řízen přes systemcore_version_manifest.json a auditní výstupy jsou archivovány pro compliance.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit konkrétní rollback test scénáře a prahové hodnoty alertů (latency, error rate, SLA breach).
- Chybí pipeline diagram nebo YAML příklady, které by vývojářům ukázaly detailní kroky CI/CD.
- Bylo by vhodné rozšířit dokumentaci o release tagging strategii a pravidla pro hotfix nasazení.
- Slabým místem může být absence orchestrace kontejnerů a self-healing strategií pro kritické služby.
- V další fázi doporučuji posílit automatizaci recovery (např. automatické restartování služeb, canary deploys).

# IX. GOVERNANCE & COMPLIANCE FRAMEWORK

## 1. Governance Structure
Governance struktura definuje role **Admin**, **Compliance Officer**, **DPO**, **QA Lead** a **DevOps Lead** včetně jejich odpovědností. Schvalovací procesy jsou řízené přes RBA a CRL, přičemž každé rozhodnutí generuje auditní záznam. Lifecycle governance pokrývá plánování změn, review, schválení release a následný audit výsledků.

## 2. Audit Framework
Auditní rámec se opírá o **AuditLog**, **SystemIncident** a **AuditLogArchive** s retencí 180 dní. Každý auditní event má severity a typ, aby bylo možné zpětně dohledat rozhodnutí i incidenty. Audit trail je archivován a pravidelně kontrolován během governance review cycle.

## 3. GDPR Compliance
GDPR procesy zahrnují pre-anonymizaci spuštěnou cron jobem v 09:00 CET s notifikací uživatelů. Implementace reflektuje čl. 13, 17, 30 a 32 a generuje auditní logy pro každé anonymizační rozhodnutí. Anonymizace investorů a brokerů je evidována v auditních záznamech a podléhá pravidelnému review.

## 4. Accessibility Compliance (WCAG 2.1 AA)
UX komponenty obsahují ARIA atributy, kontrastní barvy a focus indikátory v souladu s WCAG 2.1 AA. Compliance score je součástí QA reportů a auditních záznamů. Accessibility výsledky jsou využívány při governance review.

## 5. Security & Access Control
Security vrstva zahrnuje RBAC model, Admin Canonical Input práva a auditní logování manuálních zásahů. API je chráněno validací tokenů a bezpečnostními pravidly pro přístup k datům. Každý přístup k citlivým datům generuje auditní stopu.

## 6. Governance Reporting & Monitoring
Governance reporting sleduje compliance rate, audit closure rate a trend incidentů. Governance dashboardy vizualizují výsledky auditů a SLA metrik. Review cykly vyhodnocují plnění kontrolních bodů a generují doporučení pro další iterace.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit přesné governance metriky a frekvenci revizí (měsíční, kvartální) včetně SLA pro audit closure.
- Chybí explicitní mapování mezi RBA rozhodnutími a konkrétními auditními eventy v technické implementaci.
- Bylo by vhodné rozšířit framework o schvalovací workflow a interní governance API pro transparentní auditní kontrolu.
- Doporučuji zpřesnit incident evidence (kritéria klasifikace, eskalace, re-audit) a jejich vazbu na SLA.
- V další fázi doporučuji zavést compliance gating v CI/CD (pre-deploy kontrola GDPR/A11y) a detailnější propojení s DevOps procesy.

# X. TESTING & VALIDATION REPORTS

## 1. Testing Framework Overview
Testovací rámec zahrnuje unit, integration, E2E a regression testy. Automatizované QA běhy v CI/CD reportují coverage, test_duration_seconds a test_status, které jsou ukládány do auditních záznamů a používány pro release rozhodnutí. Testovací matice pokrývá klíčové entity (Project, Ticket, Reservation, Commission) a UI kritické cesty.

## 2. Validation Workflow
Deployment Validation Checklist ověřuje build, audit, security a governance readiness před nasazením. Post-Release Validation Report shrnuje dosažené KPI a potvrzuje stabilitu po release, včetně odchylek a doporučení. Validace je postavená na formálních checklist položkách a auditních výstupech z pipeline.

## 3. Audit & Compliance Validation
Auditní kontrola zahrnuje AuditLog review, GDPR anonymizaci a WCAG audit. Governance review cyklus vyhodnocuje compliance metriky, schvalovací kroky a dostupnost dokumentace. Výstupy z auditů jsou archivované v AuditLogArchive a používány pro governance reporting.

## 4. Incident & SLA Testing
SLA countdown a alerting testy ověřují správnou eskalaci a auto-resolve logiku incidentů. IncidentDashboard sleduje trend incidentů, response time a auditní evidenci. Každý incident má dokumentovanou časovou osu a vazbu na SLA pravidla.

## 5. QA Results Summary
QA výsledky shrnují coverage (cílově ≥ 95 %), stabilitu buildů a průměrné test duration. Test failures jsou kategorizovány a reflektované v incident logu. QA reporty jsou součástí release evidence a slouží jako podklad pro governance schválení.

## 6. Validation Metrics
KPI zahrnují SLA uptime, error rate, audit closure rate a incident response time. Trendy jsou prezentovány v reportech a slouží pro post-release validaci. Metriky se využívají pro rozhodnutí o stabilitě a případné re-audity.

## Reviewer Notes — Professional Analysis
- Doporučuji doplnit konkrétní testovací data, reporty a grafy pro coverage, výkon a incident trend.
- Chybí performance, load a penetration testing jako součást standardního QA rámce.
- Bylo by vhodné zavést automatizované compliance testy (GDPR/A11y) jako CI/CD gate.
- Doporučuji rozšířit validaci o testy rollback scénářů a disaster recovery.
- V další fázi doporučuji vytvořit přílohy: QA Report, Incident Summary a Audit Validation Log.

# XI. PROJECT CLOSURE & MAINTENANCE PLAN

## 1. Project Closure Summary
SystemCore v4.0 uzavírá vývojový cyklus a potvrzuje dokončení hlavních modulů (Data, Logic, Governance, UX, CI/CD, Security). Auditní výsledky a KPI z Post-Release Validation Reportu potvrzují stabilitu a připravenost systému na dlouhodobý provoz. Dokumentace uzavírá projekt s jasně definovaným provozním rámcem a governance procesy.

## 2. Governance Sign-Off & Audit Approval
Závěrečné schválení proběhlo na základě governance review a auditních výstupů. Sign-off matice obsahuje role Admin, Compliance Officer a DevOps Lead s potvrzením schválení a datem. Každé schválení je evidováno v AuditLog a archivováno pro compliance.

## 3. Maintenance Strategy
Údržba systému zahrnuje minor verze 4.0.x pro opravy a optimalizace a plánované větší aktualizace v4.1+. Periodicita auditů, QA review a governance refresh je nastavena na měsíční a kvartální cyklus, s ročním compliance review. Roadmapa údržby je synchronizována s governance kalendářem.

## 4. Change Management
Nové požadavky jsou spravovány přes Change Request Lifecycle a RBA proces. Každý change request musí mít auditní záznam, schvalovací stopu a definované dopady na data, UX a governance. Evidované změny jsou součástí release dokumentace a mají vlastní ID.

## 5. System Health & Monitoring Plan
Výkon, SLA, auditní metriky a incidenty jsou dlouhodobě monitorovány přes IncidentDashboard a CI/CD dashboard. DevOps tým zajišťuje provozní monitoring a rollback readiness, QA tým provádí kontinuální validaci a reporting. Monitoring data slouží jako vstup pro governance review.

## 6. Future Development Outlook
Pro v4.1 se doporučuje zaměřit na performance optimalizace, zjednodušení UI a rozšíření integračních API. Prioritou je snížení technického dluhu a rozšíření automatizovaných governance kontrol. Další vývoj musí být propojen s auditními metrikami a výsledky provozních review.

## Reviewer Notes — Professional Analysis
- Doporučuji rozpracovat SLA reporting, CI/CD review a governance auditní kalendář do samostatné přílohy.
- Chybí detailní dokumentace schvalovacích procesů a evidence change requestů včetně odpovědností.
- Bylo by vhodné připravit auditní checklisty a interní školení pro udržení procesní zralosti po 12 měsících provozu.
- Rizikem dlouhodobého provozu je technický dluh, závislost na klíčových osobách a možné legislativní změny.
- Doporučuji zavést pravidelné retrospektivy a aktualizaci maintenance plánu podle provozních metrik.

### CHANGELOG

| Verze | Datum | Typ | Popis | Modul | Schválil |
|---|---|---|---|---|---|
| 3.8.1 | 2026-03-12 | PATCH | UX Accessibility Compliance Implemented (WCAG 2.1 AA) | UXLibrary.tsx / Appendix.tsx | UX Lead |
| 3.8.1 | 2026-03-12 | PATCH | GDPR Pre-Anonymization Notice Implemented (Email & In-App Notification) | Appendix.tsx | DPO |
| 3.8.1 | 2026-03-12 | PATCH | CI/CD Dashboard Integrated with Pipeline Run Logs (DevOps visibility) | Appendix.tsx / UXLibrary.tsx | DevOps Lead |
| 3.8.1 | 2026-03-12 | PATCH | Incident Dashboard Extended with SLA Countdown Timer | Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.1 | 2026-03-12 | PATCH | Investor Matching UI Connected to Real API Endpoint | Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.1 | 2026-03-12 | PATCH | Securities Validation Enhanced (MIME check & file size limit) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.1 | 2026-03-11 | AUDIT | SystemCore Module Checklist & Missing Modules Review Generated | Figma AI | Governance Review |
| 3.8.1 | 2026-03-10 | PATCH | GDPR Anonymization Monthly Report Implemented (JSON export evidence) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.1 | 2026-03-10 | PATCH | Incident Severity Mapping Implemented (SLA response times & alert priorities) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.1 | 2026-03-10 | PATCH | Auto-Resolve Incident System Implemented (automatic resolution after module validation) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.0 | 2026-03-01 | PATCH | Version Manifest Enhanced with Dynamic Build Hash & Deployment Log | Appendix.tsx / Documentation.tsx | DevOps Lead |
| 3.8.0 | 2026-03-01 | PATCH | Self-Billing Enhanced with Digital Signature and SHA256 Hash Validation | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.0 | 2026-03-01 | PATCH | TicketCard connected to real investor matching API endpoint | Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.0 | 2026-03-01 | PATCH | GDPR Anonymization Implemented (Investors & Brokers) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.0 | 2026-03-01 | PATCH | AuditLog Automatic Archive & Purge Implemented (180-day retention, JSON export) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.8.0 | 2026-03-01 | MINOR | Commission entity split into CommissionTracking & CommissionFinance modules | Schema.ts / Appendix.tsx | Admin |
| 3.7.8 | 2026-02-18 | PATCH | SystemCore Version Manifest Implemented (centralized version control & CI/CD integration) | Appendix.tsx / Documentation.tsx | Admin |
| 3.7.8 | 2026-02-18 | PATCH | Access Control Extended with Admin Subroles (Finance, Legal, Compliance) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.7.8 | 2026-02-18 | PATCH | Multilanguage Localization Implemented (CZ/EN support across notifications & UI) | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.7.8 | 2026-02-18 | PATCH | Audit system extended with severity levels and centralized incident logging | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
| 3.7.8 | 2026-02-18 | PATCH | Broker Watchdog extended with frequency settings and ignore list | Schema.ts / Appendix.tsx / UXLibrary.tsx | Admin |
@@ -1575,27 +1922,25 @@ Změny jsou auditovány a zaznamenány do AuditLog pod eventem SLA_VALUE_UPDATED
- Auditní eventy:
  - `DESIGN_SYSTEM_APPROVED`
  - `DESIGN_SYSTEM_LOCKED`
  - `BRAND_UI_VALIDATION_COMPLETED`
- Archivace: Auditní záznamy 10 let.
- Schválení proběhlo podle §1.13 (Governance Framework).
- Odpovědné role: Admin (Platform Owner), UX Lead Designer, Brand Manager.

### 4️⃣ Výkon a SLA
| Metoda | SLA | Výsledek |
|---------|------|-----------|
| Render komponenty | <200 ms | ✅ |
| Načtení UI tokenů | <100 ms | ✅ |
| Načtení UX knihovny | <300 ms | ✅ |
| Auditní kontrola konzistence | 1× měsíčně | ✅ |

### 5️⃣ Závěr

✅ Vizuální a designový systém Tipari.cz (SystemCore v3.7.1) je plně implementován,
konzistentní s brand identitou a uzamčen pro produkční použití.

✅ UX knihovna, UI manifest a brand manuál jsou provázané a auditovatelné.
✅ Governance a auditní systém zajišťují dlouhodobou konzistenci a udržitelnost.

> „Design je nyní systémový, auditovaný a stabilní — je to páteř vizuální identity Tipari.cz.“
