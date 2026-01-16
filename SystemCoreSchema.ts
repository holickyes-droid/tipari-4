// Extracted from SystemCoreDocumentation.tsx
// Governance refactor 2026-01-14 (CR-BUNDLE 2026-Q1)
// Governance Note: Entities fully documented and linked — v3.7.5

export const SYSTEM_CORE_SCHEMA_VERSION = '3.8.1-schema'; // UPDATED: v3.8.1 — SecurityDocument Enhanced (MIME validation, file size limit)

/**
 * ================================================================
 * SYSTEM CORE SCHEMA — CANONICAL DATA STRUCTURES
 * Tipari.cz — B2B Investment Platform
 * ================================================================
 * 
 * This module contains ONLY:
 * - Type definitions
 * - Entity interfaces
 * - Enums
 * - Domain data structures
 * 
 * Extracted from: §3 (Entities), §4 (Domain Enums), §5 (Input Data)
 */

// ================================================================
// § 3 — CANONICAL ENTITIES
// ================================================================

/**
 * § 3.1 — PROJECT
 * @entity Project
 * @description Základní entita projektu na platformě Tipari.cz.
 * Zastřešuje investiční záměr, finanční parametry a právní rámec.
 * @relations Ticket (1:N) - Project has multiple tickets
 * @relations User (N:1) - Developer creates project
 * @relations FundAllocation (1:N) - Use of funds
 */
export interface Project {
  // Identification
  id: string;
  name: string;
  location: string;
  project_type: ProjectType; // FIXED: renamed from 'type' to 'project_type' (v3.7.5)
  
  // Developer info
  developer_name: string;
  developer_company: string;
  developer_contact: string;
  created_by: string; // User.id (Developer)
  
  // Financial parameters
  yield_pa: number; // Percentage (0-100)
  duration: number; // Months
  
  // Investment Form (Canonical v3.7.5)
  investment_form: InvestmentForm;
  custom_investment_description?: string;

  // Status
  status: 'draft' | 'published' | 'closed' | 'paused';
  
  // Security & funds
  security_forms: SecurityType[];
  use_of_funds: FundAllocation[];
  appraisal?: AppraisalReportFields;
  
  // DUAL BROKER MODEL (Additive)
  project_origin_broker_id: string | null; // User.id (BROKER role)
  project_origin_source: 'broker' | 'developer' | null;
  origin_assigned_by: string | null; // User.id (Admin)
  origin_assigned_at: string | null; // ISO timestamp
  
  // PROJECT INTAKE (Additive)
  intake_submitted_by: string | null; // User.id (Broker)
  intake_status: 'draft' | 'submitted' | 'under_review' | 'needs_changes' | 'approved' | 'rejected';
  intake_submitted_at: string | null; // ISO timestamp
  intake_reviewed_by: string | null; // User.id (Admin)
  intake_reviewed_at: string | null; // ISO timestamp
  intake_notes: string | null;
  
  // Relations
  tickets: string[]; // Ticket.id[]
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.2 — TICKET
 * @entity Ticket
 * @description Investiční tiket – nabídka investičního podílu.
 * Definuje finanční podmínky pro investora (výnos, splatnost).
 * @relations Project (N:1) - Belongs to one project
 * @relations Reservation (1:N) - Can be reserved multiple times (via Slots)
 * @relations TicketSecurity (1:N) - Linked securities
 * @relations Slot (1:N) - Capacity management
 */
export interface Ticket {
  // Identification
  id: string;
  project_id: string; // Project.id
  
  // Financial parameters
  min_investment_amount: number; // CZK (Renamed from investment_amount v3.7.5)
  expected_yield_percent: number; // Percentage (0-100) (Renamed from yield_pa v3.7.5)
  commission: number; // Percentage (0-100)
  commission_percent?: number; // ADDED v3.7.5: for commission calculations
  ltv: number; // Percentage (0-100)
  duration: number; // Months
  
  // Investment Form (Canonical v3.7.5) — inherits from Project
  investment_form: InvestmentForm;
  custom_investment_description?: string;

  // Security (Optional v3.7.5)
  forms_of_security?: SecurityType[]; // Renamed from secured_types, optional
  security_required?: boolean; // optional, default: false
  
  // Capacity
  max_reservations: number; // Default: 3
  current_reservations_count: number;
  
  // Status
  status: 'available' | 'locked_pending' | 'locked_confirmed' | 'completed';
  
  // Relations
  reservations: string[]; // Reservation.id[]
  slots: string[]; // Slot.id[]
  
  // Consistency Check
  synchronized_at: string; // ISO timestamp (last sync with Project)

  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.3 — SLOT
 * @entity Slot
 * @description Kapacitní omezení určující, kolik rezervací může být současně vytvořeno pro daný ticket.
 * SYSTÉMOVÁ ENTITA — NIKDY se needituje ručně.
 * @relations Ticket (N:1) - Belongs to a ticket
 * @relations Reservation (0:1) - Can hold one active reservation
 */
export interface Slot {
  // Identification
  id: string;
  ticket_id: string; // Ticket.id
  slot_number: 1 | 2 | 3;
  
  // Status
  status: 'AVAILABLE' | 'LOCKED_PENDING' | 'LOCKED_CONFIRMED' | 'COMPLETED';
  
  // Relations
  reservation_id: string | null; // Reservation.id (nullable)
  
  // Timestamps
  locked_at: string | null; // ISO timestamp
  confirmed_at: string | null; // ISO timestamp
  completed_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
}

/**
 * § 3.4 — RESERVATION
 * @entity Reservation
 * @description Rezervace investice vytvořená Brokerem pro Investora.
 * Řídí životní cyklus obchodu od zájmu po podpis smluv (State Machine).
 * @relations Ticket (N:1) - Reserves specific ticket
 * @relations User (N:1) - Broker who created it
 * @relations Investor (N:1) - End client
 * @relations Commission (1:1) - Generates commission upon activation
 */
export interface Reservation {
  // Identification
  id: string;
  reservation_number: string; // Auto-generated
  
  // Relations
  investor_id: string; // Investor.id
  ticket_id: string; // Ticket.id
  project_id: string; // Project.id
  broker_id: string; // User.id (BROKER role)
  slot_id: string; // Slot.id
  commission_id: string | null; // Commission.id (created when state = 'active')
  
  // State machine (CANONICAL)
  reservation_state: ReservationState;
  cancel_reason: CancelReason | null; // Only for 'cancelled' state
  
  // E-Sign Dual Signature Flow (v3.7.3)
  esign_provider?: 'Signi' | 'DocuSign' | 'AdobeSign';
  esign_link?: string;              // odkaz k podpisu
  esign_document_id?: string;       // ID dokumentu v E-Sign
  esign_document_url?: string;      // finální URL podepsané smlouvy
  investor_signed_at?: string;      // ISO timestamp
  developer_signed_at?: string;     // ISO timestamp
  esign_completed_at?: string;      // ISO timestamp
  activated_at?: string;            // ISO timestamp (v3.7.3 rename from both_signed_at)

  // DEPRECATED (planned removal v3.0.0)
  phase?: string; // Use reservation_state instead
  
  // Slot status
  slot_status: string;
  
  // Meeting & notes
  meeting_scheduled_date: string | null; // ISO timestamp
  outcome_notes: string | null;
  
  // WAITING & RESPONSIBILITY (Additive)
  waiting_on: WaitingOnEntity;
  waiting_reason: ReservationWaitingReason | null;
  termination_reason: ReservationTerminationReason | null; // IMMUTABLE after set
  termination_reason_details: string | null;
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  expires_at: string; // ISO timestamp
}

/**
 * § 3.5 — COMMISSION (DEPRECATED v3.8.0)
 * @entity Commission
 * @description Provize generovaná aktivací rezervace.
 * Sleduje nárok (entitlement), fakturaci a výplatu odměn.
 * @relations Reservation (1:1) - Originating trade
 * @relations User (N:1) - Broker receiving commission
 * @relations CommissionSplitRule (0:1) - Applicable split rule
 * 
 * ⚠️ DEPRECATED v3.8.0:
 * - Commission entity je rozdělena na CommissionTracking + CommissionFinance
 * - Tato definice je zachována pouze pro backward compatibility
 * - Pro nový kód použij CommissionTracking a CommissionFinance (viz § 3.5B, § 3.5C)
 * 
 * KRITICKÉ:
 * - Commission RECORD vzniká při reservation_state = 'active' (oba podpisy dokončeny)
 * - Commission ENTITLEMENT (nárok) vzniká až po realizaci investice (investment_confirmed_at)
 * 
 * ENHANCED v3.7.8:
 * - status_history: Časová osa všech změn stavu provize
 * - Sleduje kdo, kdy a proč změnil stav provize
 * - Propojení s AuditLog přes audit_run_id
 * 
 * @deprecated Use CommissionTracking + CommissionFinance instead (v3.8.0+)
 */
export interface Commission {
  // Identification
  id: string;
  reservation_id: string; // Reservation.id
  broker_id: string; // User.id (BROKER role)
  
  // Financial
  commission_amount: number; // CZK (investment_amount × commission_percent / 100)
  commission_percent: number; // Percentage (0-100) from ticket
  investment_form: InvestmentForm; // v3.7.5 for reporting
  
  // Status
  status: 'pending' | 'confirmed' | 'paid';
  confirmed_by: string | null; // User.id (Admin)
  confirmed_at: string | null; // ISO timestamp
  approved_by_admin: boolean; // MEDIUM FIX v3.7.5: unified admin approval tracking
  payment_date: string | null; // ISO timestamp
  payment_reference: string | null;
  
  // DUAL BROKER MODEL (Additive)
  commission_recipients: CommissionRecipient[];
  commission_split_rule_id: string | null; // CommissionSplitRule.id
  platform_fee_amount: number | null; // CZK
  recipient_amounts_by_user_id: Record<string, number>; // user_id → amount (CZK)
  
  // DUAL BROKER SPLIT LIFECYCLE (Additive)
  split_status: CommissionSplitStatus;
  split_calculated_at: string | null; // ISO timestamp
  split_confirmed_at: string | null; // ISO timestamp
  split_overridden_at: string | null; // ISO timestamp
  split_override_reason: string | null;
  
  // COMMISSION ENTITLEMENT & PAYMENT PHASES (Additive)
  entitlement_phase: CommissionEntitlementPhase;
  payment_phase: CommissionPaymentPhase | null; // null if negotiation/platform_entitled
  investment_confirmed_at: string | null; // ISO timestamp
  platform_paid_at: string | null; // ISO timestamp
  broker_payout_prepared_at: string | null; // ISO timestamp
  paid_at: string | null; // ISO timestamp
  negotiation_deadline: string | null; // ISO timestamp (default: +90d from active)
  platform_payment_deadline: string | null; // ISO timestamp (default: +30d from investment_confirmed_at)
  broker_payout_deadline: string | null; // ISO timestamp (default: +3d from platform_paid_at)
  
  // WAITING & RESPONSIBILITY (Additive)
  waiting_on: WaitingOnEntity;
  waiting_reason: CommissionWaitingReason | null;
  termination_reason: CommissionTerminationReason | null; // IMMUTABLE after set
  termination_reason_details: string | null;
  
  // COLLECTABILITY (System-computed field)
  commission_collectability: CommissionCollectability;
  
  // ✨ BILLING MODULE (v3.7.7) — Commission Invoicing
  invoice_url?: string;                   // URL nahrané faktury (PDF)
  invoice_uploaded?: boolean;             // true = broker nahrál fakturu manuálně
  invoice_generated?: boolean;            // true = faktura vystavena platformou (self-billing)
  invoice_number?: string;                // číslo faktury (např. SB-2026-02-0012)
  invoice_confirmed_by_admin?: boolean;   // potvrzení o přijetí adminem
  invoice_confirmed_at?: string;          // ISO timestamp potvrzení
  
  // ✨ INVOICE METADATA (v3.7.8) — Accounting & Tax Integration
  invoice_amount?: number;                // fakturovaná částka (s DPH nebo bez dle invoice_amount_type)
  invoice_currency?: 'CZK' | 'EUR' | 'USD'; // měna faktury
  invoice_vat_rate?: number;              // sazba DPH v % (např. 21, 15, 0)
  invoice_amount_type?: 'with_vat' | 'without_vat'; // typ částky (s DPH nebo bez DPH)
  invoice_due_date?: string;              // ISO timestamp splatnosti faktury
  invoice_issued_at?: string;             // ISO timestamp vystavení faktury
  
  // ✨ TIMELINE & HISTORY (v3.7.8) — Status Change Tracking
  status_history?: CommissionStatusHistory[];  // Časová osa všech změn stavu
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.5A — COMMISSION STATUS HISTORY (v3.7.8)
 * @interface CommissionStatusHistory
 * @description Záznam změny stavu provize v časové ose.
 * Uchovává kompletní historii lifecycle provize pro audit a reporting.
 * 
 * USE CASES:
 * - Admin timeline zobrazení
 * - Audit compliance (kdo a kdy změnil stav)
 * - Reporting (průměrná doba mezi stavy)
 * - Debugging workflow issues
 */
export interface CommissionStatusHistory {
  status: 'pending' | 'confirmed' | 'paid';  // Nový stav provize
  changed_at: string;                         // ISO timestamp změny
  changed_by: string;                         // User.id nebo 'SYSTEM'
  note?: string;                              // Doplňující komentář (např. "Admin confirmed after invoice verification")
  audit_run_id?: string;                      // Propojení s AuditLog.run_id (např. "CommissionCron#45")
  
  // CONTEXTUAL DATA (v3.7.8)
  entitlement_phase?: CommissionEntitlementPhase;  // Snapshot entitlement phase v době změny
  payment_phase?: CommissionPaymentPhase | null;   // Snapshot payment phase v době změny
  commission_amount?: number;                       // Snapshot částky (pokud se změnila)
}

/**
 * § 3.5B — COMMISSION TRACKING (v3.8.0)
 * @entity CommissionTracking
 * @description Sleduje proces a nárok provize (business logic).
 * Odd

ěleno od fakturačních dat pro čistotu datového modelu.
 * @relations Reservation (1:1) - Originating trade
 * @relations User (N:1) - Broker receiving commission
 * @relations CommissionSplitRule (0:1) - Applicable split rule
 * @relations CommissionFinance (1:1) - Billing & accounting data
 * 
 * KRITICKÉ:
 * - CommissionTracking vzniká při reservation_state = 'active' (oba podpisy dokončeny)
 * - Commission ENTITLEMENT (nárok) vzniká až po realizaci investice (investment_confirmed_at)
 * 
 * SCOPE:
 * - Business process tracking (statusy, phases, deadlines)
 * - Entitlement & collectability logic
 * - Dual broker split tracking
 * - Timeline & audit trail
 */
export interface CommissionTracking {
  // Identification
  id: string;
  reservation_id: string;                           // Reservation.id
  broker_id: string;                                // User.id (BROKER role)
  
  // Financial Calculation (readonly after creation)
  commission_amount: number;                        // CZK (investment_amount × commission_percent / 100)
  commission_percent: number;                       // Percentage (0-100) from ticket
  investment_form: InvestmentForm;                  // For reporting
  
  // Process Status & Phases
  status: CommissionTrackingStatus;                 // pending → entitled → payable → paid → written_off
  entitlement_phase: CommissionEntitlementPhase;
  payment_phase: CommissionPaymentPhase | null;
  collectability: CommissionCollectability;
  
  // Admin Approval & Confirmation
  approved_by_admin: boolean;
  confirmed_by: string | null;                      // User.id (Admin)
  confirmed_at: string | null;                      // ISO timestamp
  
  // Lifecycle Timestamps
  investment_confirmed_at: string | null;           // ISO timestamp
  platform_paid_at: string | null;                  // ISO timestamp
  broker_payout_prepared_at: string | null;         // ISO timestamp
  paid_at: string | null;                           // ISO timestamp
  
  // Deadlines
  negotiation_deadline: string | null;              // ISO timestamp (default: +90d from active)
  platform_payment_deadline: string | null;         // ISO timestamp (default: +30d from investment_confirmed_at)
  broker_payout_deadline: string | null;            // ISO timestamp (default: +3d from platform_paid_at)
  
  // DUAL BROKER MODEL
  commission_recipients: CommissionRecipient[];
  commission_split_rule_id: string | null;          // CommissionSplitRule.id
  platform_fee_amount: number | null;               // CZK
  recipient_amounts_by_user_id: Record<string, number>; // user_id → amount (CZK)
  
  // DUAL BROKER SPLIT LIFECYCLE
  split_status: CommissionSplitStatus;
  split_calculated_at: string | null;
  split_confirmed_at: string | null;
  split_overridden_at: string | null;
  split_override_reason: string | null;
  
  // WAITING & RESPONSIBILITY
  waiting_on: WaitingOnEntity;
  waiting_reason: CommissionWaitingReason | null;
  termination_reason: CommissionTerminationReason | null;
  termination_reason_details: string | null;
  
  // TIMELINE & HISTORY
  status_history?: CommissionStatusHistory[];       // Časová osa všech změn stavu
  
  // Timestamps
  created_at: string;                               // ISO timestamp
  updated_at: string;                               // ISO timestamp
}

/**
 * § 3.5C — COMMISSION FINANCE (v3.8.0)
 * @entity CommissionFinance
 * @description Spravuje fakturační a účetní data provize.
 * Odděleno od tracking logiky pro čistotu a připravenost na accounting API integrace.
 * @relations CommissionTracking (1:1) - Parent tracking record
 * 
 * SCOPE:
 * - Invoice management (upload, generation, confirmation)
 * - Invoice metadata (amount, VAT, currency, dates)
 * - Payment tracking (reference, date)
 * - Accounting integration data
 * 
 * KRITICKÉ:
 * - CommissionFinance vzniká automaticky při vytvoření CommissionTracking
 * - Všechna pole jsou optional (postupně se plní během lifecycle)
 * - invoice_amount může být jiná než commission_amount (DPH, zaokrouhlení)
 */
export interface CommissionFinance {
  // Identification
  id: string;
  commission_id: string;                            // CommissionTracking.id (FOREIGN KEY)
  
  // Invoice Upload/Generation
  invoice_url?: string;                             // URL nahrané faktury (PDF)
  invoice_uploaded?: boolean;                       // true = broker nahrál fakturu manuálně
  invoice_generated?: boolean;                      // true = faktura vystavena platformou (self-billing)
  invoice_number?: string;                          // číslo faktury (např. SB-2026-02-0012)
  
  // Invoice Confirmation
  invoice_confirmed_by_admin?: boolean;             // potvrzení o přijetí adminem
  invoice_confirmed_at?: string;                    // ISO timestamp potvrzení
  invoice_confirmed_by?: string;                    // User.id (Admin who confirmed)
  
  // Invoice Metadata (Accounting & Tax)
  invoice_amount?: number;                          // fakturovaná částka (s DPH nebo bez dle invoice_amount_type)
  invoice_currency?: 'CZK' | 'EUR' | 'USD';        // měna faktury
  invoice_vat_rate?: number;                        // sazba DPH v % (např. 21, 15, 0)
  invoice_amount_type?: 'with_vat' | 'without_vat'; // typ částky
  invoice_due_date?: string;                        // ISO timestamp splatnosti faktury
  invoice_issued_at?: string;                       // ISO timestamp vystavení faktury
  
  // Payment Tracking
  payment_reference?: string;                       // Bankovní reference platby
  payment_date?: string;                            // ISO timestamp platby
  payment_confirmed_at?: string;                    // ISO timestamp potvrzení platby
  payout_date?: string;                             // ISO timestamp výplaty brokerovi
  
  // Accounting Integration (future v3.8.1+)
  accounting_system_id?: string;                    // ID v účetním systému (např. Pohoda, Money S3)
  accounting_synced_at?: string;                    // ISO timestamp poslední synchronizace
  accounting_sync_status?: 'pending' | 'synced' | 'error';
  accounting_sync_error?: string;                   // Chybová zpráva při sync
  
  // ISDOC Export (Czech accounting standard)
  isdoc_generated?: boolean;                        // true = ISDOC XML vygenerován
  isdoc_url?: string;                               // URL k ISDOC XML souboru
  isdoc_generated_at?: string;                      // ISO timestamp generování
  
  // ✨ DIGITAL SIGNATURE & HASH (v3.8.0)
  invoice_hash?: string;                            // SHA256 hash PDF faktury
  invoice_hash_algorithm?: HashAlgorithm;           // Hash algoritmus (default: sha256)
  
  invoice_signed?: boolean;                         // Faktura elektronicky podepsána
  invoice_signature_url?: string;                   // URL k .p7s souboru (detached signature)
  invoice_signature_algorithm?: string;             // Algoritmus podpisu (např. "RSA-SHA256")
  invoice_signature_format?: SignatureFormat;       // Formát podpisu (PAdES / XAdES / CAdES)
  
  invoice_certificate_thumbprint?: string;          // Thumbprint certifikátu (SHA1)
  invoice_certificate_issuer?: string;              // Vydavatel certifikátu
  invoice_certificate_subject?: string;             // Subjekt certifikátu (CN)
  invoice_certificate_valid_from?: string;          // Platnost certifikátu od
  invoice_certificate_valid_to?: string;            // Platnost certifikátu do
  
  signed_at?: string;                               // ISO timestamp podpisu
  signed_by?: string;                               // Kdo podepsal ("SYSTEM" nebo User.id)
  
  signature_verified_at?: string;                   // Timestamp poslední verifikace
  signature_valid?: boolean;                        // Výsledek poslední verifikace
  signature_verification_errors?: string[];         // Chyby při verifikaci
  
  // Timestamps
  created_at: string;                               // ISO timestamp
  updated_at?: string;                              // ISO timestamp
}

/**
 * § 3.6 — USER
 * @entity User
 * @description Uživatel platformy s konkrétní rolí (Broker, Developer, Admin).
 * Slouží pro autentizaci a autorizaci operací.
 * @relations Investor (1:N) - Broker manages investors
 * @relations Project (1:N) - Developer manages projects
 * @relations Reservation (1:N) - Broker creates reservations
 * 
 * ENHANCED v3.7.8:
 * - language_preference: Jazyk uživatele pro UI a notifikace (cs/en)
 * - admin_subrole: Specializace role admina (Finance, Legal, Compliance)
 * - permissions: Custom oprávnění pro fine-grained access control
 */
export interface User {
  // Identification
  id: string;
  name: string;
  email: string;
  phone: string;
  
  // Role & tier
  role: UserRole;
  tipar_level: TiparLevel | null; // Only for BROKER role
  
  // ✨ RBAC ENHANCEMENT (v3.7.8) — Admin Subroles & Permissions
  admin_subrole?: AdminSubrole;         // Specializace role admina (pouze pokud role = 'ADMIN')
  permissions?: PermissionAction[];     // Custom oprávnění (optional override pro role-based permissions)
  
  // Status
  active: boolean;
  status: 'pending_approval' | 'active' | 'inactive';
  
  // ✨ LOCALIZATION (v3.7.8)
  language_preference?: 'cs' | 'en';  // Preferovaný jazyk uživatele (default: 'cs')
  
  // ✨ GDPR & ANONYMIZATION (v3.8.0) — FOR BROKERS ONLY
  anonymized_at?: string | null;                 // ISO timestamp anonymizace (pouze role BROKER)
  anonymized_by?: string | null;                 // User.id kdo anonymizoval
  anonymization_reason?: AnonymizationReason;    // Důvod anonymizace
  
  // ✨ DATA RETENTION (v3.8.0)
  data_retention_until?: string;                 // ISO timestamp do kdy musí být data uchována
  data_retention_reason?: string;                // Důvod retention
  
  // ✨ GDPR CONSENT (v3.8.0)
  gdpr_consent_at?: string;                      // ISO timestamp souhlasu
  gdpr_consent_withdrawn_at?: string;            // ISO timestamp odvolání souhlasu
  gdpr_consent_version?: string;                 // Verze consent textu
  
  // ✨ LIFECYCLE STATE (v3.8.0)
  state?: 'active' | 'archived' | 'deleted' | 'anonymized';  // Lifecycle state
  archived_at?: string;                          // ISO timestamp archivace
  deleted_at?: string;                           // ISO timestamp soft delete
  
  // Relations
  created_investors: string[]; // Investor.id[] (if role = BROKER)
  created_projects: string[]; // Project.id[] (if role = DEVELOPER)
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.7 — INVESTOR
 * @entity Investor
 * @description Fyzická/právnická osoba, která investuje do projektů.
 * NENÍ uživatel platformy, nemá login (Managed by Broker).
 * @relations User (N:1) - Managed by Broker
 * @relations Reservation (1:N) - Makes reservations
 */
export interface Investor {
  // Identification
  id: string;
  name: string;                                  // → "ANONYMIZED_INVESTOR_<id>" po anonymizaci
  email: string | null;                          // → null po anonymizaci
  phone: string | null;                          // → null po anonymizaci
  
  // Type
  type: InvestorType;
  
  // Company info (if type = PO | Family_Office | Institution)
  company_name: string | null;
  ico: string | null;
  address: string | null;                        // → null po anonymizaci
  
  // Relations
  created_by: string; // User.id (BROKER role)
  reservations: string[]; // Reservation.id[]
  
  // DEPRECATED
  tipar_level?: TiparLevel; // Legacy field, no functional impact
  
  // ✨ GDPR & ANONYMIZATION (v3.8.0)
  anonymized_at?: string | null;                 // ISO timestamp anonymizace (null = není anonymizován)
  anonymized_by?: string | null;                 // User.id kdo anonymizoval (nebo 'SYSTEM')
  anonymization_reason?: AnonymizationReason;    // Důvod anonymizace
  
  // ✨ DATA RETENTION (v3.8.0)
  data_retention_until?: string;                 // ISO timestamp do kdy musí být data uchována
  data_retention_reason?: string;                // Důvod retention (např. "Accounting records until 2035")
  
  // ✨ GDPR CONSENT (v3.8.0)
  gdpr_consent_at?: string;                      // ISO timestamp souhlasu
  gdpr_consent_withdrawn_at?: string;            // ISO timestamp odvolání souhlasu
  gdpr_consent_version?: string;                 // Verze consent textu (např. "v1.2.0")
  
  // ✨ LIFECYCLE STATE (v3.8.0)
  state?: InvestorState;                         // 'active' | 'archived' | 'deleted' | 'anonymized'
  archived_at?: string;                          // ISO timestamp archivace
  deleted_at?: string;                           // ISO timestamp soft delete
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.8 — COMPANY
 * @entity Company
 * @description Právnická osoba spojená s Investorem nebo Developerem.
 * Obsahuje fakturační a právní údaje.
 * @relations Investor (0:1)
 * @relations User (0:1) - Developer's company
 */
export interface Company {
  // Identification
  id: string;
  name: string;
  ico: string;
  address: string;
  
  // Relations
  investor_id: string | null; // Investor.id (nullable)
  developer_id: string | null; // User.id (nullable)
  
  // Timestamps
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.9 — DOCUMENT
 * @entity Document
 * @description Právní nebo systémový soubor (smlouva, posudek, výpis).
 * @relations Project (N:1) - Project documents
 * @relations Reservation (N:1) - Contracts
 * @relations User (N:1) - Uploaded by
 */
export interface Document {
  // Identification
  id: string;
  name: string;
  type: DocumentType;
  
  // Relations
  entity_type: string; // 'project' | 'reservation' | 'user'
  entity_id: string;
  uploaded_by: string; // User.id
  
  // File info
  file_url: string;
  mime_type: string;
  size: number; // bytes
  
  // Status
  status: 'draft' | 'signed' | 'archived';
  
  // Timestamps
  uploaded_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * § 3.10 — NOTIFICATION
 * @entity Notification
 * @description Systémová notifikace pro uživatele.
 * @relations User (N:1) - Recipient
 */
export interface Notification {
  // Identification
  id: string;
  user_id: string; // User.id
  type: string;
  title: string;
  message: string;
  
  // Relations
  entity_type: string;
  entity_id: string;
  
  // Status
  read: boolean;
  
  // Timestamps
  created_at: string; // ISO timestamp
}

/**
 * § 3.11 — AUDIT_LOG
 * @entity AuditLog
 * @description Neměnný záznam všech významných systémových událostí.
 * IMMUTABLE — NIKDY se nesmaže. Slouží pro compliance a debugging.
 * @relations User (N:1) - Performer of action
 * 
 * ENHANCED v3.7.8:
 * - run_id: Identifikace běhu auditu/procesu (např. IntegrityRun#324, WatchdogRun#58)
 * - session_id: Vazba na relaci uživatele pro zpětné trasování
 * - severity: Kategorizace závažnosti události (info/warning/error/critical)
 */
export interface AuditLog {
  // Identification
  id: string;
  user_id: string; // User.id (who performed action)
  action: AuditAction;
  
  // Relations
  entity_type: string;
  entity_id: string;
  
  // State change
  old_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  
  // Details
  reason: string;
  metadata: Record<string, any>; // MEDIUM FIX v3.7.5: supports investor_id for investor event tracking
  
  // ✨ AUDIT CONTEXT (v3.7.8) — Run ID & Session Tracking
  run_id?: string;          // ID běhu auditu/procesu (např. "IntegrityRun#324", "WatchdogRun#58")
  session_id?: string;      // ID relace uživatele pro zpětné trasování
  severity?: 'info' | 'warning' | 'error' | 'critical';  // Závažnost události
  
  // Timestamps
  created_at: string; // ISO timestamp
}

/**
 * § 3.11A — SYSTEM_INCIDENT (v3.7.8)
 * @entity SystemIncident
 * @description Centrální evidence systémových incidentů a kritických chyb.
 * Automaticky vytvářena při severity = error nebo critical v AuditLog.
 * @relations AuditLog (N:1) - Originating audit event
 * @relations User (N:1) - Assigned admin/developer
 * 
 * USE CASES:
 * - Sledování kritických chyb vyžadujících zásah (error/critical)
 * - Incident management workflow (open → resolved → closed)
 * - SLA tracking pro resolution time
 * - Compliance reporting (critical incidents must be addressed within 24h)
 * 
 * WORKFLOW:
 * 1. System detects error/critical event
 * 2. SystemIncident automatically created
 * 3. Admin/compliance team notified (email + in-app)
 * 4. Incident assigned to developer/admin
 * 5. Investigation & resolution
 * 6. Incident closed with resolution notes
 */
export interface SystemIncident {
  // Identification
  id: string;
  audit_log_id: string;             // AuditLog.id (originating event)
  incident_number: string;          // Auto-generated (e.g., "INC-2026-02-0042")
  
  // Severity & Classification
  severity: 'warning' | 'error' | 'critical';
  module: string;                   // Modul kde incident nastal (např. "Investor Matching", "Billing", "Watchdog")
  category?: IncidentCategory;      // Kategorie incidentu (data_integrity, payment, security, etc.)
  
  // Description
  title: string;                    // Krátký popis (např. "Missing investment_confirmed_at timestamp")
  description: string;              // Detailní popis problému
  
  // Status & Assignment
  status: IncidentStatus;
  assigned_to?: string;             // User.id (Admin nebo Developer)
  assigned_at?: string;             // ISO timestamp přiřazení
  
  // Resolution
  resolution_notes?: string;        // Poznámky k řešení
  resolved_by?: string;             // User.id kdo vyřešil
  resolved_at?: string;             // ISO timestamp vyřešení
  
  // SLA & Priority
  priority?: 'low' | 'medium' | 'high' | 'urgent';  // Urgency (auto-set based on severity)
  sla_deadline?: string;            // ISO timestamp (calculated: critical = +24h, error = +72h, warning = +7d)
  sla_breached?: boolean;           // true pokud resolved_at > sla_deadline
  
  // Context & Metadata
  affected_entities?: Array<{       // Entity impacted by incident
    entity_type: string;
    entity_id: string;
  }>;
  metadata?: Record<string, any>;   // Additional context (error stack, user_id, etc.)
  
  // Timestamps
  created_at: string;               // ISO timestamp
  updated_at: string;               // ISO timestamp
  closed_at?: string;               // ISO timestamp uzavření
}

/**
 * § 3.9 — AUDIT_LOG_ARCHIVE (v3.8.0)
 * @entity AuditLogArchive
 * @description Metadata o archivovaných auditních lozích.
 * Sleduje exportované JSON soubory s historickými audit logy.
 * @relations None (archival metadata only)
 * 
 * KRITICKÉ:
 * - AuditLogArchive vzniká při každém běhu archivačního procesu
 * - Obsahuje checksum pro validaci integrity archivu
 * - Archive files jsou read-only po vytvoření
 * 
 * SCOPE:
 * - Archive metadata tracking
 * - Integrity validation (SHA-256 checksum)
 * - Compliance & audit trail
 * - Recovery support
 */
export interface AuditLogArchive {
  // Identification
  id: string;
  archive_run_id: string;                    // Unique run ID (např. "ArchiveCron#12")
  
  // Archive File Info
  file_path: string;                         // Relativní cesta k JSON souboru (např. "/archives/auditlog_2026-03-01.json")
  file_size_bytes: number;                   // Velikost souboru v bytech
  file_url?: string;                         // URL pro download (pokud v cloud storage)
  
  // Archive Content
  record_count: number;                      // Počet archivovaných záznamů
  date_from: string;                         // ISO timestamp nejstaršího záznamu
  date_to: string;                           // ISO timestamp nejnovějšího záznamu
  
  // Integrity & Validation
  checksum: string;                          // SHA-256 hash JSON souboru
  checksum_algorithm: 'sha256';              // Použitý algoritmus
  validated_at?: string;                     // ISO timestamp poslední validace
  
  // Metadata
  archived_at: string;                       // ISO timestamp vytvoření archivu
  archived_by: string;                       // User.id nebo 'SYSTEM'
  purged_at?: string;                        // ISO timestamp smazání původních záznamů
  
  // Status
  status: ArchiveStatus;                     // 'pending' | 'completed' | 'failed' | 'corrupted'
  error_message?: string;                    // Chybová zpráva pokud status = 'failed'
  
  // Storage
  storage_type: 'local' | 's3' | 'gcs';     // Typ úložiště
  storage_location?: string;                 // Dodatečné info o lokaci (bucket, region)
  
  // Retention
  retention_until?: string;                  // ISO timestamp do kdy archiv uchovat (null = navždy)
  
  // Timestamps
  created_at: string;                        // ISO timestamp
  updated_at?: string;                       // ISO timestamp
}

/**
 * § 3.11B — INCIDENT CATEGORY (v3.7.8)
 * @enum IncidentCategory
 * @description Kategorizace systémových incidentů pro reporting a prioritizaci.
 */
export type IncidentCategory =
  | 'data_integrity'        // Data consistency issues
  | 'payment'               // Payment/billing failures
  | 'security'              // Security breaches or vulnerabilities
  | 'performance'           // Performance degradation
  | 'integration'           // External API/service failures
  | 'validation'            // Validation rule violations
  | 'workflow'              // State machine or workflow errors
  | 'notification'          // Email/notification failures
  | 'audit'                 // Audit trail issues
  | 'compliance'            // Compliance violations
  | 'other';                // Uncategorized

/**
 * § 3.11C — INCIDENT STATUS (v3.7.8)
 * @enum IncidentStatus
 * @description Lifecycle states incidentu.
 */
export type IncidentStatus =
  | 'open'                  // Nově vytvořen, čeká na přiřazení
  | 'assigned'              // Přiřazen adminovi/developerovi
  | 'investigating'         // Probíhá vyšetřování
  | 'resolved'              // Vyřešen, čeká na verifikaci
  | 'closed'                // Uzavřen, verifikováno
  | 'wont_fix';             // Nebude řešen (false positive, deprecated feature)

/**
 * § 4.9 — ARCHIVE_STATUS (v3.8.0)
 * @enum ArchiveStatus
 * @description Status archivního procesu pro AuditLogArchive.
 */
export type ArchiveStatus =
  | 'pending'       // Archivace probíhá
  | 'completed'     // Archivace dokončena a validována
  | 'failed'        // Archivace selhala
  | 'corrupted';    // Archiv je poškozen (checksum mismatch)

/**
 * § 4.10 — ANONYMIZATION_REASON (v3.8.0)
 * @enum AnonymizationReason
 * @description Důvod anonymizace osobních dat (GDPR compliance).
 */
export type AnonymizationReason =
  | 'retention_expired'      // Data retention period vypršel (automatic)
  | 'right_to_erasure'       // Žádost o výmaz dle Art. 17 GDPR (manual)
  | 'consent_withdrawn'      // Odvolán souhlas se zpracováním (manual)
  | 'account_closure'        // Uzavření účtu (manual)
  | 'inactivity'             // Dlouhodobá nečinnost (automatic)
  | 'admin_decision';        // Rozhodnutí admina (manual)

/**
 * § 4.2A — INVESTOR_STATE (v3.8.0)
 * @enum InvestorState
 * @description Lifecycle stav investora s GDPR anonymization support.
 */
export type InvestorState =
  | 'active'                 // Aktivní investor
  | 'archived'               // Archivován (neaktivní, ale osobní data zachována)
  | 'deleted'                // Soft delete (recovery možná do 30 dnů)
  | 'anonymized';            // Anonymizován (GDPR compliance, nelze obnovit)

/**
 * § 4.11 — SIGNATURE_FORMAT (v3.8.0)
 * @enum SignatureFormat
 * @description Formát elektronického podpisu.
 */
export type SignatureFormat =
  | 'PAdES'      // PDF Advanced Electronic Signatures (recommended for invoices)
  | 'XAdES'      // XML Advanced Electronic Signatures
  | 'CAdES';     // CMS Advanced Electronic Signatures

/**
 * § 4.12 — HASH_ALGORITHM (v3.8.0)
 * @enum HashAlgorithm
 * @description Hash algoritmus pro kontrolu integrity.
 */
export type HashAlgorithm =
  | 'sha256'     // SHA-256 (recommended)
  | 'sha512';    // SHA-512 (stronger, but slower)

/**
 * § 4.13 — SIGNATURE_VERIFICATION_STATUS (v3.8.0)
 * @enum SignatureVerificationStatus
 * @description Status verifikace elektronického podpisu.
 */
export type SignatureVerificationStatus =
  | 'valid'              // Podpis platný
  | 'invalid'            // Podpis neplatný
  | 'expired'            // Certifikát vypršel
  | 'revoked'            // Certifikát zrušen
  | 'not_verified';      // Ještě neověřeno

/**
 * § 3.12 — COMMISSION_SPLIT_RULE
 * @entity CommissionSplitRule
 * @description Pravidlo pro rozdělení provize (Split Rule).
 * Definuje poměry mezi platformou, origin brokerem a reservation brokerem.
 * @relations Commission (1:N) - Applied to commissions
 * @relations Project (0:1) - Can be project specific override
 */
export interface CommissionSplitRule {
  // Identification
  id: string;
  name: string; // Human-readable (e.g., "Default Dual Broker 10/40/50")
  
  // Scope
  scope: 'global_default' | 'project_override';
  project_id: string | null; // REQUIRED if scope = 'project_override'
  
  // Split percentages (MUST sum to 100)
  // CR-2026-01-14-001: All percent fields use integer values (0–100)
  platform_fee_percent: number; // 0-100 (e.g., 10)
  origin_broker_percent: number; // 0-100 (e.g., 40)
  reservation_broker_percent: number; // 0-100 (e.g., 50)
  
  // Activation
  is_active: boolean; // true = active, false = deactivated (archived)
  valid_from: string; // ISO timestamp
  
  // Audit
  created_by: string; // User.id (Admin)
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  
  // Admin notes
  notes: string | null;
}

// ================================================================
// § 4 — DOMAIN ENUMS & TYPES
// ================================================================

/**
 * § 4.1 — Investment Forms (CANONICAL v3.7.5)
 * REMOVED old definition (senior_loan, junior_loan, etc.)
 * New canonical definition below in § 4.3
 */

/**
 * § 4.2 — Project Types
 */
export type ProjectType =
  | 'residential_development'      // Rezidenční development
  | 'residential_reconstruction'   // Rekonstrukce rezidenční
  | 'commercial_development'       // Komerční výstavba
  | 'buy_and_hold'                 // Nákup a držení (Buy & Hold)
  | 'refinancing'                  // Refinancování projektu
  | 'bridge_financing'             // Krátkodobé (bridge) financování
  | 'land_development'             // Development pozemků
  | 'brownfield_redevelopment'     // Brownfield obnova
  | 'joint_venture'                // Joint Venture projekt
  | 'special_real_estate';         // Speciální realitní projekt

/**
 * § 7C — Project Classification Model
 */
// export type ProjectRiskLevel = 'low' | 'medium' | 'high' | 'very_high'; // REMOVED v3.7.5

export interface ProjectClassification {
  project_type: ProjectType;
  ux_display_name: string;
  // risk_level: ProjectRiskLevel; // REMOVED v3.7.5
  typical_duration_months: [number, number];
  typical_securities: string[];
  ux_icon?: string;
  description?: string;
}

export const PROJECT_CLASSIFICATIONS: Record<ProjectType, ProjectClassification> = {
  residential_development: {
    project_type: 'residential_development',
    ux_display_name: 'Rezidenční development',
    // risk_level: 'medium',
    typical_duration_months: [18, 36],
    typical_securities: ['real_estate_mortgage', 'corporate_guarantee'],
    ux_icon: 'Building2'
  },
  residential_reconstruction: {
    project_type: 'residential_reconstruction',
    ux_display_name: 'Rezidenční rekonstrukce',
    // risk_level: 'low',
    typical_duration_months: [12, 24],
    typical_securities: ['real_estate_mortgage'],
    ux_icon: 'Hammer'
  },
  commercial_development: {
    project_type: 'commercial_development',
    ux_display_name: 'Komerční development',
    // risk_level: 'medium',
    typical_duration_months: [24, 48],
    typical_securities: ['real_estate_mortgage', 'corporate_guarantee'],
    ux_icon: 'Building'
  },
  buy_and_hold: {
    project_type: 'buy_and_hold',
    ux_display_name: 'Nákup hotové nemovitosti (Buy & Hold)',
    // risk_level: 'low',
    typical_duration_months: [12, 60],
    typical_securities: ['real_estate_mortgage', 'cashflow_pledge'],
    ux_icon: 'Home'
  },
  refinancing: {
    project_type: 'refinancing',
    ux_display_name: 'Refinancování projektu',
    // risk_level: 'low',
    typical_duration_months: [6, 24],
    typical_securities: ['notarial_enforcement', 'real_estate_mortgage'],
    ux_icon: 'RefreshCw'
  },
  bridge_financing: {
    project_type: 'bridge_financing',
    ux_display_name: 'Bridge financování',
    // risk_level: 'medium',
    typical_duration_months: [3, 12],
    typical_securities: ['real_estate_mortgage'],
    ux_icon: 'Zap'
  },
  land_development: {
    project_type: 'land_development',
    ux_display_name: 'Land development',
    // risk_level: 'high',
    typical_duration_months: [12, 36],
    typical_securities: ['real_estate_mortgage'],
    ux_icon: 'Map'
  },
  brownfield_redevelopment: {
    project_type: 'brownfield_redevelopment',
    ux_display_name: 'Brownfield redevelopment',
    // risk_level: 'high',
    typical_duration_months: [24, 48],
    typical_securities: ['real_estate_mortgage', 'corporate_guarantee'],
    ux_icon: 'Factory'
  },
  joint_venture: {
    project_type: 'joint_venture',
    ux_display_name: 'Joint Venture projekt',
    // risk_level: 'high',
    typical_duration_months: [24, 60],
    typical_securities: ['share_pledge'],
    ux_icon: 'Handshake'
  },
  special_real_estate: {
    project_type: 'special_real_estate',
    ux_display_name: 'Speciální realitní projekt',
    // risk_level: 'high',
    typical_duration_months: [12, 60],
    typical_securities: [],
    ux_icon: 'Star'
  }
};

/**
 * § 4.3 — Security Forms
 */
export type SecurityType =
  | 'real_estate_mortgage'      // zástava nemovitosti
  | 'corporate_guarantee'       // firemní ručení
  | 'personal_guarantee'        // osobní ručení
  | 'promissory_note'           // směnka
  | 'share_pledge'              // zástava obchodního podílu
  | 'notarial_enforcement'      // notářský zápis se svolením k vykonatelnosti
  | 'bank_guarantee'            // bankovní záruka
  | 'escrow_control'            // kontrolovaný účet (escrow)
  | 'insurance'                 // pojištění plnění
  | 'assignment_of_proceeds'    // postoupení výnosů
  | 'cashflow_assignment'       // postoupení cashflow
  | 'ownership_transfer'        // převod vlastnictví (např. sale & leaseback)
  | 'purchase_agreement_warranty' // záruka z kupní smlouvy
  | 'custom';                   // jiné zajištění (uživatelsky doplněné)

export type InvestmentForm =
  | 'loan'             // Zápůjčka / úvěr
  | 'mezzanine'        // Mezaninové financování
  | 'bridge'           // Překlenovací financování
  | 'project'          // Projektové financování (SPV)
  | 'refinancing'      // Refinancování projektu
  | 'joint_venture'    // Společný podnik (JV)
  | 'sale_leaseback'   // Sale & Leaseback
  | 'offer_project'    // Nabídka projektu
  | 'custom';          // Jiná forma investice (uživatelsky doplněná)

export interface InvestmentFormToSecurityMap {
  investment_form: InvestmentForm;
  typical_securities: SecurityType[];
  custom_security_description?: string; // volně vyplnitelné při výběru 'custom'
}

// Deprecated via CR-2026-02-14-002: Risk classification removed in favor of direct Investment Form mapping
// export type SecurityStrength = 'low' | 'medium' | 'high' | 'very_high';

export interface Security {
  id: string;
  type: SecurityType;
  name: string;
  description?: string;
  // strength: SecurityStrength; // Removed per CR-2026-02-14-002
  custom_security_description?: string; // For 'custom' type
  is_primary?: boolean;      // hlavní zajištění
  is_active?: boolean;       // platnost zajištění
  created_at: Date;
}

export interface TicketSecurity {
  id: string;
  ticket_id: string;
  security_id: string;
  order_rank?: number;       // pořadí (1., 2. zástava)
  ltv_percent?: number;      // optional value (Loan-to-Value poměr)
  note?: string;             // doplňující informace
  is_primary?: boolean;      // zda jde o hlavní zajištění
  created_at: Date;
}

// Governance Note: LTV optional — v3.7.5

/**
 * § 8.9.3 — SECURITY_DOCUMENT (Enhanced in v3.8.1)
 * @entity SecurityDocument
 * @description Dokumenty vztahující se k zajištění (zástavní smlouvy, znalecké posudky apod.)
 * 
 * NEW v3.8.1:
 * - MIME type validation: Only PDF, JPEG, PNG allowed
 * - File size limit: Maximum 10 MB
 * - File metadata: MIME type, size, hash, original filename
 * - Validation tracking: Timestamp and result
 * 
 * CANONICAL RULE:
 * - Allowed MIME types: application/pdf, image/jpeg, image/png
 * - Maximum file size: 10 MB (10,485,760 bytes)
 * - All uploads must pass validation before storage
 */
export interface SecurityDocument {
  id: string;
  ticket_security_id: string;
  document_type: 'valuation' | 'contract' | 'notarial_record' | 'insurance_policy' | 'cadastral_extract' | 'technical_report' | 'other';
  file_url: string;
  
  // File Metadata (NEW v3.8.1)
  mime_type: string;                           // MIME type (application/pdf, image/jpeg, image/png)
  file_size_bytes: number;                     // File size in bytes
  file_size_kb: number;                        // File size in KB (calculated)
  file_hash?: string;                          // SHA256 hash for integrity verification
  original_filename: string;                   // Original filename from upload
  
  // Validation (NEW v3.8.1)
  validated_at: string;                        // ISO timestamp when file was validated
  validation_passed: boolean;                  // true if all validations passed
  
  uploaded_at: Date;
  uploaded_by?: string;                        // User ID who uploaded (optional)
}

/**
 * § 4.4 — Use of Funds
 */
export type FundAllocationCategory =
  | 'land_purchase'         // Nákup pozemku
  | 'construction'          // Stavební práce
  | 'reconstruction'        // Rekonstrukce
  | 'technology'            // Technologie a vybavení
  | 'project_preparation'   // Příprava projektu
  | 'permits'               // Povolení a schválení
  | 'marketing'             // Marketing a prodej
  | 'fees'                  // Poplatky a honoráře
  | 'financing_costs'       // Náklady financování
  | 'reserve'               // Rezerva
  | 'taxes'                 // Daně a poplatky
  | 'other_costs';          // Ostatní náklady

export interface FundAllocation {
  category: FundAllocationCategory;
  percentage: number; // 0-100 (MUST sum to 100 ± 0.01%)
  amount?: number; // CZK (optional)
  description?: string;
}

/**
 * § 4.5 — Appraisal
 */
export interface AppraisalReportFields {
  appraised_value: number;        // CZK
  valuation_date: string;         // ISO 8601
  valuator_name: string;
  valuation_method: ValuationMethod;
  valuation_type: ValuationType;
  valid_until: string;            // ISO 8601
  ltv_calculated?: number;        // Percentage (0-100)
  document_ref?: string;
  status: AppraisalStatus;
  notes?: string;
}

export type ValuationMethod =
  | 'comparative_method'    // Porovnávací metoda
  | 'income_method'         // Výnosová metoda
  | 'cost_method'           // Nákladová metoda
  | 'market_value'          // Trní hodnota
  | 'combined_method';      // Kombinovaná metoda

export type ValuationType =
  | 'bank_valuation'        // Bankovní ocenění
  | 'market_valuation'      // Tržní ocenění
  | 'insurance_valuation'   // Pojistné ocenění
  | 'tax_valuation';        // Daňové ocenění

export type AppraisalStatus =
  | 'valid'                 // Platný
  | 'expired'               // Expirovaný
  | 'pending'               // Čeká na schválení
  | 'rejected';             // Zamítnutý

/**
 * § 4.6 — Reservation State (CANONICAL - 10 states)
 */
export type ReservationState =
  | 'pending_platform'              // 1. Čeká na schválení platformy (v3.7.3 removed available)
  | 'platform_approved'             // 2. Schváleno platformou
  | 'awaiting_investor_signature'   // 3. Čeká na podpis investora (E-Sign)
  | 'awaiting_developer_signature'  // 4. Čeká na podpis developera (E-Sign)
  | 'active'                        // 5. Aktivní (oba podpisy dokončeny)
  | 'expired'                       // 6. Vypršelo
  | 'cancelled'                     // 7. Zrušeno
  | 'completed';                    // 8. Dokončeno

/**
 * § 4.6.1 — Cancel Reason
 */
export type CancelReason =
  | 'broker_cancelled'              // Broker zrušil manuálně
  | 'admin_cancelled'               // Admin zrušil manuálně
  | 'investor_withdrew'             // Investor odstoupil
  | 'lost_race_first_to_sign'       // Prohrál v race condition
  | 'other';                        // Jiný důvod (s poznámkou)

/**
 * § 4.7A — AUDIT_ACTION (Centrální Enum)
 */
export type AuditAction =
  // User actions
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_level_changed'

  // Investor actions (v3.6.5+)
  | 'investor_created'
  | 'investor_submitted_for_verification'
  | 'investor_verified'
  | 'investor_updated'
  | 'investor_validation_passed'
  | 'investor_match_executed'
  | 'investor_match_resulted'

  // Investor Matching (v3.6.6+)
  | 'investor_match_executed'
  | 'investor_match_resulted'
  | 'investor_match_validated'
  | 'investor_match_failed'

  // Reservation actions
  | 'reservation_created'
  | 'reservation_approved'
  | 'reservation_rejected'
  | 'reservation_cancelled'
  | 'reservation_expired'
  | 'investor_signature_requested'
  | 'investor_signed_via_esign'
  | 'developer_signature_requested'
  | 'developer_signed_via_esign'
  | 'reservation_activated_after_dual_signature'
  | 'reservation_activated'
  | 'reservation_review_required'
  | 'reservation_automatically_approved'
  | 'reservation_completed'
  | 'investment_confirmed'

  // E-Sign Validation Audit (v3.7.3)
  | 'esign_validation_started'
  | 'investor_esign_link_missing'
  | 'developer_signature_before_investor'
  | 'developer_signature_missing'
  | 'missing_final_document_url'
  | 'esign_validation_completed'
  
  // Commission actions
  | 'commission_created'
  | 'commission_confirmed'
  | 'commission_paid'
  | 'platform_paid'
  | 'commission_split_calculated'
  | 'commission_split_overridden'
  | 'commission_split_locked'
  | 'commission_split_paid'
  | 'commission_status_changed'   // v3.7.8 — Timeline tracking
  
  // Project origin actions
  | 'project_origin_assigned'
  | 'project_origin_changed'
  | 'project_origin_removed'
  | 'project_origin_change_blocked_due_to_existing_commissions'
  | 'admin_override_project_origin_change'
  
  // Project intake actions
  | 'project_intake_submitted'
  | 'project_intake_approved'
  | 'project_intake_rejected'
  | 'project_intake_needs_changes'
  
  // Change Request actions (v3.3.9+)
  | 'change_request_initiated'
  | 'change_request_reviewed'
  | 'change_request_approved'
  | 'change_request_rejected'
  | 'change_request_implemented'
  | 'change_request_audited'

  // Broker Policy & Pool actions (v3.5.0+)
  | 'broker_level_policy_updated'
  | 'incentive_pool_updated'
  | 'incentive_pool_evaluated'
  | 'broker_pool_winner_declared'
  | 'incentive_pool_carried_over'
  | 'broker_pool_primary_winner_awarded'
  | 'broker_pool_secondary_winners_awarded'
  
  // Dashboard & Admin actions (v3.5.0+)
  | 'dashboard_metrics_refreshed'
  | 'pool_balance_updated'
  | 'audit_chain_check_completed'
  
  // Data Consistency actions (v3.6.0+)
  | 'project_data_updated'
  | 'ticket_project_sync_completed'
  | 'project_linkage_inconsistency_detected'
  | 'audit_chain_repair_request'
  
  // UI & Brand Governance (v3.6.1+)
  | 'ui_manifest_moved_to_core'
  | 'brand_manual_file_created'
  
  // UX Governance (v3.6.2+)
  | 'ux_component_rendered'
  | 'ux_interaction_recorded'

  // Investor Workflow (v3.6.5+)
  | 'investor_created'
  | 'investor_submitted_for_verification'
  | 'investor_verified'
  | 'investor_updated'
  | 'investor_match_executed'
  | 'investor_match_resulted'

  // Project Approval (v3.6.0+)
  | 'project_created'
  | 'project_submitted'
  | 'project_review_started'
  | 'project_approved'
  | 'project_published'
  | 'project_rejected'
  | 'project_documents_updated'
  | 'project_review_sla_breached'

  // Security actions (v3.7.0+)
  | 'security_added'
  | 'security_updated'
  | 'security_removed'
  | 'security_document_added'
  | 'security_document_removed'
  | 'security_validated'
  | 'securities_validation_started'
  | 'securities_validation_completed'
  | 'security_error_found'
  
  // Investment Form & Security Mapping (v3.7.4)
  | 'investment_form_selected'
  | 'custom_investment_form_entered'
  | 'custom_security_entered'
  | 'custom_security_verified'
  | 'investment_form_security_map_updated'
  | 'security_warning_found'
  
  // Refactor v3.7.5
  | 'investment_form_refactor_completed'
  | 'investment_form_used'

  // Brand & UI actions (v3.7.1)
  | 'brand_ui_validation_started'
  | 'brand_ui_validation_completed'
  | 'primary_color_mismatch'
  | 'font_mismatch'
  | 'insufficient_spacing'

  // Design System Governance (v3.7.1)
  | 'design_system_approved'
  | 'design_system_locked'

  // Project Classification (Risk Removed v3.7.5)
  | 'project_classification_added'
  | 'project_classification_updated'
  | 'project_type_validated'

  // Project Data Validation Audit (v3.7.2)
  | 'project_data_validation_started'
  | 'project_type_missing'
  | 'classification_not_found'
  | 'project_missing_securities'
  | 'unexpected_security_type'
  | 'project_data_validation_completed'

  // Investor Matching Auto Trigger (v3.7.6)
  | 'investor_match_results_updated'
  | 'investor_match_removed'
  
  // Billing Module (v3.7.7)
  | 'invoice_uploaded'
  | 'invoice_generated'
  | 'invoice_confirmed'
  | 'invoice_metadata_created'    // v3.7.8 — Invoice metadata tracking
  | 'self_billing_agreement_accepted'
  | 'self_billing_agreement_revoked'
  
  // Watchdog Module (v3.7.7)
  | 'watchdog_email_sent'
  | 'watchdog_alert_created'
  | 'watchdog_preferences_updated'
  
  // Incident Management (v3.7.8)
  | 'system_incident_created'
  | 'system_incident_assigned'
  | 'system_incident_investigating'
  | 'system_incident_resolved'
  | 'system_incident_closed'
  | 'system_incident_reopened'
  | 'system_warning'                // System warning (severity: warning)
  | 'system_error'                  // System error (severity: error)
  | 'system_critical'               // Critical system failure (severity: critical)
  
  // Localization (v3.7.8)
  | 'user_language_changed'         // User changed language preference
  
  // RBAC Enhancement (v3.7.8)
  | 'admin_subrole_assigned'        // Admin subrole was assigned to user
  | 'admin_subrole_changed'         // Admin subrole was changed
  | 'user_permissions_updated'      // Custom permissions were updated
  
  // Commission Entity Split (v3.8.0)
  | 'commission_tracking_created'          // CommissionTracking record created
  | 'commission_tracking_status_changed'   // CommissionTracking status changed
  | 'commission_tracking_updated'          // CommissionTracking field updated
  | 'commission_finance_created'           // CommissionFinance record created
  | 'commission_finance_invoice_uploaded'  // Invoice uploaded by broker
  | 'commission_finance_invoice_generated' // Invoice generated by platform
  | 'commission_finance_invoice_confirmed' // Invoice confirmed by admin
  | 'commission_finance_payment_recorded'  // Payment recorded
  | 'commission_finance_isdoc_generated'   // ISDOC XML generated
  
  // AuditLog Archive System (v3.8.0)
  | 'auditlog_archived'                    // Audit logs archived to JSON
  | 'auditlog_purged'                      // Old audit logs deleted from DB
  | 'auditlog_archive_failed'              // Archive process failed
  | 'auditlog_archive_validated'           // Archive checksum validated
  | 'auditlog_archive_downloaded'          // Archive file downloaded
  | 'auditlog_restored'                    // Logs restored from archive
  | 'auditlog_archive_triggered_manually'  // Archive manually triggered by admin
  
  // GDPR Anonymization (v3.8.0)
  | 'investor_anonymized'                  // Investor was anonymized
  | 'broker_anonymized'                    // Broker was anonymized
  | 'investor_anonymization_failed'        // Anonymization failed
  | 'broker_anonymization_failed'          // Broker anonymization failed
  | 'batch_anonymization_completed'        // Monthly batch anonymization completed
  | 'batch_anonymization_failed'           // Batch anonymization failed
  | 'manual_anonymization_requested'       // Admin requested manual anonymization
  | 'data_retention_date_set'              // Data retention date was set
  | 'gdpr_consent_withdrawn'               // User withdrew GDPR consent
  
  // Investor Matching API (v3.8.0)
  | 'investor_match_results_fetched'       // Matching results fetched via API
  | 'investor_match_list_exported'         // Investor list exported to CSV
  
  // Billing Digital Signature (v3.8.0)
  | 'invoice_hash_created'                 // Invoice hash generated
  | 'invoice_signed'                       // Invoice digitally signed
  | 'invoice_signing_failed'               // Invoice signing failed
  | 'invoice_signature_verified'           // Signature verification completed
  | 'invoice_signature_verification_failed' // Signature verification failed
  | 'invoice_hash_mismatch'                // Hash mismatch detected (tampering)
  | 'invoice_signature_downloaded'         // Signature file downloaded
  
  // Version Manifest & CI/CD (v3.8.0)
  | 'system_build_hash_generated'          // Build hash generated
  | 'system_deployment_logged'             // Deployment logged to manifest
  | 'system_build_integrity_verified'      // Build integrity verified
  | 'system_build_integrity_failed'        // Build integrity check failed
  | 'system_version_manifest_updated';     // Version manifest updated

/**
 * § 4.7B — WAITING_ON (Centrální Enum)
 */
export type WaitingOnEntity =
  | 'investor'
  | 'developer'
  | 'platform'
  | 'admin'
  | 'none';

/**
 * § 4.7C — WAITING_REASON (Split Enums)
 */

// Reservation waiting reasons
export type ReservationWaitingReason =
  | 'awaiting_platform_approval'        // State: pending_platform
  | 'awaiting_investor_signature'       // State: platform_approved
  | 'awaiting_developer_decision'       // State: investor_signed
  | 'awaiting_developer_signature'      // State: developer_confirmed
  | null;                               // Terminal states

// Reservation termination reasons
export type ReservationTerminationReason =
  | 'reservation_expired'               // SLA vypršelo
  | 'investor_withdrew'                 // Investor odstoupil
  | 'developer_rejected'                // Developer odmítl
  | 'admin_cancelled'                   // Admin zrušil
  | 'lost_race_first_to_sign'          // Jiná rezervace vyhrála
  | 'platform_rejected'                 // Platforma zamítla
  | null;

// Commission waiting reasons
export type CommissionWaitingReason =
  | 'awaiting_negotiation_completion'           // Phase: negotiation
  | 'awaiting_investor_funds'                   // Phase: negotiation
  | 'awaiting_platform_payment'                 // Phase: platform_entitled
  | 'awaiting_broker_payout_preparation'        // Phase: platform_paid
  | 'awaiting_payout_execution'                 // Phase: broker_payable
  | null;                                       // Phase: paid

// Commission termination reasons
export type CommissionTerminationReason =
  | 'negotiation_expired'               // Investice se nerealizovala
  | 'investor_withdrew'                 // Investor odstoupil
  | 'developer_withdrew'                // Developer odstoupil
  | 'admin_cancelled'                   // Admin zrušil
  | 'platform_payment_failed'           // Developer nezaplatil
  | null;

/**
 * § 4.8 — TIPAR_LEVEL (Broker Tier)
 */
export type TiparLevel =
  | 'SCOUT'
  | 'HUNTER'
  | 'ALPHA'
  | 'WOLF';

/**
 * § 4.9 — TIPAR_LEVEL → SLOT CAPACITY (CANONICAL)
 */
export const TIPAR_SLOT_CAPACITY: Record<TiparLevel, number> = {
  SCOUT: 5,
  HUNTER: 10,
  ALPHA: 20,
  WOLF: 50,
};

/**
 * User Roles
 */
export type UserRole =
  | 'ADMIN'
  | 'BROKER'
  | 'DEVELOPER'
  | 'PLATFORM_EMPLOYEE';

/**
 * § 4.1A — ADMIN_SUBROLE (v3.7.8)
 * @enum AdminSubrole
 * @description Specializace role admina pro granulární oprávnění.
 * Každá subrole má specifický set oprávnění definovaný v ROLE_PERMISSIONS.
 * 
 * USE CASES:
 * - Finance Admin: Přístup k provizím, fakturám, billing dashboardu
 * - Legal Admin: Validace smluv, e-sign, právní dokumentace
 * - Compliance Admin: Audit security, integrity reports, RBA validation
 * - Platform Admin: Full access (super admin)
 */
export type AdminSubrole =
  | 'platform_admin'        // Super admin - full access
  | 'finance_admin'         // Finance department - billing, commissions, invoices
  | 'legal_admin'           // Legal department - contracts, e-sign, legal docs
  | 'compliance_admin';     // Compliance department - audit, security, integrity

/**
 * § 4.1B — PERMISSION_ACTION (v3.7.8)
 * @enum PermissionAction
 * @description Granulární oprávnění pro access control.
 * Používá se pro fine-grained RBAC a custom permissions per user.
 * 
 * STRUCTURE:
 * - Formát: <module>_<action>
 * - Example: 'commission_approve', 'invoice_export'
 */
export type PermissionAction =
  // User Management
  | 'user_create'
  | 'user_edit'
  | 'user_delete'
  | 'user_view'
  | 'user_approve'
  
  // Project Management
  | 'project_create'
  | 'project_edit'
  | 'project_approve'
  | 'project_view'
  | 'project_delete'
  
  // Investor Management
  | 'investor_create'
  | 'investor_edit'
  | 'investor_view'
  | 'investor_delete'
  
  // Reservation Management
  | 'reservation_create'
  | 'reservation_approve'
  | 'reservation_cancel'
  | 'reservation_view'
  
  // Commission Management (Finance)
  | 'commission_view'
  | 'commission_approve'
  | 'commission_edit'
  | 'commission_pay'
  | 'commission_export'
  
  // Invoice Management (Finance)
  | 'invoice_upload'
  | 'invoice_approve'
  | 'invoice_view'
  | 'invoice_export'
  | 'invoice_generate_isdoc'
  
  // Billing Management (Finance)
  | 'billing_view_dashboard'
  | 'billing_export_data'
  | 'billing_vat_report'
  
  // Contract Management (Legal)
  | 'contract_validate'
  | 'contract_approve'
  | 'contract_view'
  | 'contract_esign'
  
  // Legal Documents (Legal)
  | 'legal_doc_access'
  | 'legal_doc_upload'
  | 'legal_doc_approve'
  
  // Audit & Compliance
  | 'audit_view_logs'
  | 'audit_export'
  | 'audit_security'
  
  // Compliance & Integrity
  | 'compliance_view_reports'
  | 'compliance_run_integrity_check'
  | 'compliance_validate_rba'
  
  // System Configuration (Platform Admin)
  | 'system_configure'
  | 'system_view_incidents'
  | 'system_assign_incidents'
  
  // Incident Management
  | 'incident_view'
  | 'incident_assign'
  | 'incident_resolve'
  | 'incident_close';

/**
 * Investor Types
 */
export type InvestorType =
  | 'FO'                    // Fyzická osoba
  | 'PO'                    // Právnická osoba
  | 'Family_Office'         // Family Office
  | 'Institution';          // Instituce

/**
 * Document Types
 */
export type DocumentType =
  | 'contract'
  | 'appraisal'
  | 'identification'
  | 'financial_statement'
  | 'project_documentation'
  | 'other';

/**
 * Commission Split Status
 */
export type CommissionSplitStatus =
  | 'split_not_applicable'      // Single-broker režim
  | 'split_calculated'          // Dual-broker, čeká na admin review
  | 'split_override_pending'    // Admin změnil split, čeká na confirm
  | 'split_locked'              // Admin potvrdil, immutable
  | 'split_paid';               // Provize vyplacena

/**
 * Commission Entitlement Phase
 */
export type CommissionEntitlementPhase =
  | 'negotiation'           // Čeká se na realizaci investice
  | 'platform_entitled'     // Investice realizována, platforma má nárok
  | 'platform_paid'         // Developer zaplatil platformě
  | 'broker_payable'        // Admin připravil payout pro brokery
  | 'paid';                 // Provize vyplacena brokerům

/**
 * Commission Payment Phase
 */
export type CommissionPaymentPhase =
  | 'platform_paid'
  | 'broker_payable'
  | 'paid';

/**
 * § 4.5A — COMMISSION_TRACKING_STATUS (v3.8.0)
 * @enum CommissionTrackingStatus
 * @description Rozšířené statusy pro CommissionTracking.
 * Přidává 'entitled' a 'written_off' pro lepší granularitu.
 * 
 * ORIGINAL (v3.7.8):
 * - pending → confirmed → paid
 * 
 * NEW (v3.8.0):
 * - pending → entitled → payable → paid → written_off
 */
export type CommissionTrackingStatus =
  | 'pending'        // Čeká na entitlement (investice ještě nebyla potvrzena)
  | 'entitled'       // Nárok vznikl (investice potvrzena), čeká na payable
  | 'payable'        // Platitelná (platforma zaplatila developerovi)
  | 'paid'           // Vyplaceno brokerovi
  | 'written_off';   // Odpis (nekollektabilní)

/**
 * Commission Collectability
 * System-computed field derived from entitlement_phase
 */
export type CommissionCollectability =
  | 'not_collectable'       // Před platform_entitled
  | 'collectable'           // platform_entitled nebo později
  | 'in_collection'         // Po překročení platform_payment_deadline (automatic)
  | 'written_off';          // Admin-only manual action (audit required)

/**
 * Commission Recipient
 */
export interface CommissionRecipient {
  user_id: string; // User.id
  amount: number; // CZK
  percentage: number; // 0-100
  recipient_type: 'platform' | 'origin_broker' | 'reservation_broker';
}

// ================================================================
// § 5 — INPUT DATA STRUCTURES
// ================================================================

/**
 * § 5.1 — Investor Input Data (Externí entita)
 */
export interface InvestorInputData {
  id?: string;
  investor_type: 'individual' | 'corporate';     // FO / PO
  full_name: string;
  company_name?: string;
  ico?: string;
  dic?: string;
  nationality?: string;
  tax_residency?: string;
  address: string;
  correspondence_address?: string;
  email_hash: string;
  phone_hash?: string;
  source_broker_id: string;                      // kdo investora zapsal
  created_at: string; // ISO timestamp (Date in prompt, mapped to string for consistency)
  investor_preferences?: InvestorPreferences;
  communication_settings?: CommunicationSettings;
  compliance_status?: ComplianceStatus;
}

/**
 * § 5.1A — Investor Preferences (Matching kritéria)
 */
export interface InvestorPreferences {
  investment_min: number;
  investment_max: number;
  preferred_currency: 'CZK' | 'EUR';
  preferred_yield_min: number;
  preferred_yield_max: number;
  max_investment_duration: { value: number; unit: 'months' | 'years' };
  payout_type: 'one_time' | 'periodic' | 'mixed';
  requires_security: boolean;
  preferred_security_types: string[];
  max_ltv?: number;
  preferred_project_types: string[];
  preferred_project_phases: string[];
  preferred_regions: string[];
  willing_spv: boolean;
  willing_subordination: 'yes' | 'no' | 'case_by_case';
  willing_bank_cofinancing: boolean;
}

/**
 * § 5.1B — Communication Settings
 */
export interface CommunicationSettings {
  contact_method: 'phone' | 'email' | 'in_person' | 'combo';
  contact_frequency: 'immediate' | 'on_offer' | 'periodic';
}

/**
 * § 5.1C — Compliance Status
 */
export interface ComplianceStatus {
  pep: boolean;
  sanctions: 'none' | 'found';
  funds_source: 'business' | 'employment' | 'investments' | 'inheritance' | 'other';
  annual_investment_estimate: number;
  kyc_verified: boolean;
  aml_verified: boolean;
  documents_verified: boolean;
}

/**
 * § 5.2 — Developer Input Data
 */
export interface DeveloperInputData {
  // Basic info
  name: string;
  email: string;
  phone: string;
  
  // Company info
  company_name?: string;
  ico?: string;
  address?: string;
}

/**
 * § 5.3 — Registration Broker / Developer
 */
export interface UserRegistrationData {
  name: string;
  email: string;
  phone: string;
  role: 'BROKER' | 'DEVELOPER';
  
  // Company info (optional)
  company_name?: string;
  ico?: string;
  address?: string;
}

/**
 * § 5.3A.1 — Broker Watchdog Preferences (v3.7.7)
 * @description Automatické sledování nových tiketů odpovídajících preferencím brokera.
 * Systém odesílá upozornění e-mailem i in-app při nových shodách.
 * 
 * ENHANCED v3.7.8:
 * - ignore_projects: Seznam projektů/tiketů, které broker nechce sledovat
 * - frequency: Frekvence odesílání upozornění (daily/weekly/monthly)
 * - last_notified_at: Timestamp poslední odeslané notifikace
 */
export interface BrokerWatchdogPreferences {
  enabled: boolean;                     // Watchdog zapnutý/vypnutý
  investment_forms: InvestmentForm[];  // např. ['loan', 'mezzanine', 'bridge']
  yield_min?: number;                   // % p.a.
  yield_max?: number;                   // % p.a.
  amount_min?: number;                  // CZK
  amount_max?: number;                  // CZK
  regions?: string[];                   // např. ['Praha', 'Brno', 'Plzeň']
  project_types?: ProjectType[];        // např. ['residential_development', 'commercial_development']
  
  // ✨ FREQUENCY & IGNORE LIST (v3.7.8)
  ignore_projects?: string[];           // ID projektů, které broker nechce sledovat (blacklist)
  ignore_tickets?: string[];            // ID tiketů, které broker nechce sledovat (blacklist)
  frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly';  // Frekvence upozornění
  last_notified_at?: string;            // ISO timestamp poslední odeslané notifikace
}

/**
 * § 5.3B — Broker Profile
 */
export interface BrokerProfile {
  subject_type: 'individual' | 'corporate';
  full_name: string;
  company_name?: string;
  ico?: string;
  dic?: string;
  nationality?: string;
  tax_residency?: string;
  address: string;
  region_scope: string[];  // kraje / země působnosti
  specialization: ('reality' | 'development' | 'energy' | 'debt' | 'equity')[];
  typical_investors: ('retail' | 'hnwi' | 'institutional')[];
  average_deal_size?: number;
  cooperation_type: 'independent' | 'bound' | 'internal';
  agreements: {
    framework: boolean;
    nda: boolean;
    commission_terms: boolean;
    ethical_code: boolean;
    gdpr_consent: boolean;
  };
  
  // ✨ BILLING MODULE (v3.7.7) — Self-Billing Agreement
  self_billing_agreement?: boolean;      // true = platforma vystavuje faktury jménem brokera
  self_billing_accepted_at?: Date;       // timestamp souhlasu
  
  // ✨ WATCHDOG MODULE (v3.7.7) — Broker Match Alerts
  watchdog_preferences?: BrokerWatchdogPreferences;
  
  status: 'pending' | 'verified' | 'active' | 'suspended' | 'blocked';
  verified_by?: string; // admin user_id
  created_at: Date;
  verified_at?: Date;
}

/**
 * § 5.3C — Developer Profile
 */
export interface DeveloperProfile {
  subject_type: 'corporate' | 'sole_trader';
  company_name: string;
  ico: string;
  dic?: string;
  registered_country: string;
  headquarters_address: string;
  representative: {
    full_name: string;
    position: string;
    nationality?: string;
    birth_date?: Date;
  };
  focus: ('residential' | 'commercial' | 'logistics' | 'retail' | 'energy')[];
  regions: string[];
  projects_completed?: number;
  total_volume_czk?: number;
  investment_forms_preference?: InvestmentForm[]; // v3.7.5 renamed from financing_type
  website?: string;
  agreements: {
    framework: boolean;
    authorization_declaration: boolean;
    anti_circumvention: boolean;
    gdpr_consent: boolean;
  };
  status: 'pending' | 'verified' | 'active' | 'suspended' | 'blocked';
  verified_by?: string;
  created_at: Date;
  verified_at?: Date;
}


/**
 * § 5.3A — INVESTOR REGISTRATION WORKFLOW
 * 
 * 1️⃣ Účel
 * Popisuje proces, jak broker registruje nového investora, jaká data zadává a jak probíhá jejich ověření a schválení adminem.
 * 
 * 2️⃣ Canonical Data Models
 * - InvestorInputData
 * - InvestorPreferences
 * - CommunicationSettings
 * - ComplianceStatus
 * (See SystemCoreSchema.ts for type definitions)
 * 
 * 3️⃣ Workflow & Role Assignment
 * | Fáze | Role | Akce | Audit event |
 * |------|------|------|-------------|
 * | Broker registruje investora | Broker | vyplní všechna data, preference a souhlasy | INVESTOR_CREATED |
 * | Admin kontroluje a potvrzuje | Admin | ověří a označí data jako zdroj pravdy | INVESTOR_VERIFIED |
 * | Data validována systémem | System | kontrola integrity, formátů a chybějících polí | INVESTOR_VALIDATION_PASSED |
 * | Změny nebo doplnění údajů | Broker/Admin | upraví chybějící nebo nesouladná data | INVESTOR_UPDATED |
 * 
 * 4️⃣ Governance & Compliance
 * - Investor nikdy sám nevyplňuje data → zdroj = broker.
 * - Admin vždy potvrzuje správnost a audituje změny.
 * - Každé pole má přiřazeno:
 *   - Zadává: kdo může upravit (Broker / Admin)
 *   - Zdroj pravdy: kdo je odpovědný za validitu
 *   - Vidí: kdo má přístup ke čtení
 * - Audit eventy: INVESTOR_CREATED, INVESTOR_SUBMITTED_FOR_VERIFICATION, INVESTOR_VERIFIED, INVESTOR_UPDATED
 * - Audit trail uchováván 10 let.
 * - KYC/AML údaje zůstávají mimo UX (nejsou zobrazovány brokerům).
 * 
 * 5️⃣ Matching Integration
 * InvestorPreferences data slouží jako vstupní parametry pro matching logiku s tikety a projekty.
 * - Auditní eventy: INVESTOR_MATCH_EXECUTED, INVESTOR_MATCH_RESULTED
 */

/**
 * § 5.4 — Project Origin Assignment Workflow
 */
export interface ProjectOriginAssignmentInput {
  project_id: string;
  origin_broker_id: string | null; // null = remove origin
  origin_source: 'broker' | 'developer';
  reason: string; // Min 10 chars, override min 50 chars
  assigned_by: string; // User.id (Admin)
}

/**
 * § 5.5 — Broker Level Policy
 */
export interface BrokerLevelPolicy {
  level_enum: TiparLevel;
  min_volume: number;
  max_volume?: number;
  max_reservations: number;
  negotiation_window_days: number;
  auto_renewal: boolean;
  sla_grace_hours: number;
  early_access_hours: number;
  last_modified_by: string;
  last_modified_at: string; // ISO timestamp
}

/**
 * § 5.6 — Broker Pool History
 */
export interface BrokerPoolHistory {
  id: string;
  period_start: string; // ISO timestamp
  period_end: string;   // ISO timestamp
  pool_balance_start: number;
  pool_balance_end: number;
  primary_winner_id?: string;
  secondary_winner_ids?: string[];
  carry_over_amount?: number;
  audit_reference: string;
}

/**
 * § 5.7 — Admin Dashboard Metrics
 */
export interface AdminDashboardMetrics {
  active_brokers_by_level: Record<TiparLevel, number>;
  total_investment_volume: number;
  sla_compliance_rate: number;
  open_reservations: number;
  active_tickets: number;
  incentive_pool_balance: number;
  last_pool_winners: string[];
  audit_chain_integrity_percent: number;
  last_refreshed_at: string; // ISO timestamp
}

/**
 * § 5.8 — Project Input Data (Create/Update)
 */
export interface ProjectInputData {
  project_id?: string;
  name: string;
  description: string;
  location: string;
  total_investment_amount: number;
  expected_yield_percent: number;
  project_type: 'residential' | 'commercial' | 'mixed' | 'industrial';
  forms_of_security: string[];          // např. zástava, notářský zápis, escrow
  developer_company: string;
  developer_contact: string;
  broker_recommendation?: string;
  documents: {
    legal: string[];                    // smlouvy, posudky
    financial: string[];                // výkazy, rozpočty
    marketing: string[];                // prezentace, fotky
  };
  attachments?: string[];
  created_by: 'DEVELOPER' | 'BROKER';
  created_at: string; // ISO timestamp
  state: 'draft' | 'submitted' | 'under_review' | 'approved' | 'published' | 'rejected';
}

/**
 * § 5.9 — Investor Matching Interfaces
 */
export interface InvestorMatchingInput {
  investor_id: string;
  preferences: InvestorPreferences;
}

/**
 * § 5.9A — Investor Matching Result (v3.7.6 — Auto Trigger Implementation)
 * @entity InvestorMatchingResult
 * @description Výsledek automatického matchingu investorů s tikety.
 * Systém automaticky přepočítává matches při změně investora, tiketu nebo projektu.
 * @relations Investor (N:1) - Results for specific investor
 * @relations Ticket (N:1) - Matched ticket
 * 
 * ENHANCED v3.7.8:
 * - last_validated_at: Kdy byl výsledek naposledy ověřen cronem
 * - validation_run_id: ID běhu validace (pro auditní propojení s AuditLog)
 * - recalculation_count: Kolikrát byl match přepočítán
 * - match_quality: Zjednodušený ukazatel skóre (low/medium/high) pro UX a reporting
 * 
 * @indexes
 * - idx_investor_ticket: (investor_id, ticket_id) — unique constraint
 * - idx_is_active: (is_active) — filtrování aktivních matches
 * - idx_last_validated_at: (last_validated_at) — SLA audit
 * - idx_match_quality: (match_quality) — reporting queries
 */
export interface InvestorMatchingResult {
  id: string;
  investor_id: string;
  ticket_id: string;
  match_score: number;    // 0.0–1.0
  matched_attributes: string[];
  is_active: boolean;      // false if ticket closed or investor archived
  created_at: Date;
  updated_at?: Date;
  
  // ✨ VALIDATION METRICS (v3.7.8)
  last_validated_at?: Date;        // kdy byl výsledek naposledy ověřen cronem
  validation_run_id?: string;      // ID běhu validace (např. "MatchingRun#142") — vazba na AuditLog.run_id
  recalculation_count?: number;    // kolikrát byl match přepočítán (default: 0)
  match_quality?: 'low' | 'medium' | 'high'; // zjednodušený ukazatel: high (≥0.8), medium (≥0.5), low (<0.5)
}

// ================================================================
// VALIDATION RULES & CONSTANTS
// ================================================================

/**
 * § 4.7 — Validation Rules
 */
export const VALIDATION_RULES = {
  // Appraisal
  APPRAISAL_VALIDITY_MONTHS: 12,
  
  // Timeouts
  RESERVATION_TIMEOUT_DAYS: 30,
  COMMISSION_NEGOTIATION_TIMEOUT_DAYS: 90,
  PLATFORM_PAYMENT_TIMEOUT_DAYS: 30,
  BROKER_PAYOUT_TIMEOUT_DAYS: 3,
  
  // Limits
  MAX_RESERVATIONS_PER_TICKET: 3,
  
  // Fund allocation tolerance
  FUND_ALLOCATION_SUM_TOLERANCE: 0.01, // ± 0.01%
} as const;

/**
 * § 4.10 — Tipar Level Progression (CANONICAL)
 */
export interface TiparLevelProgression {
  level: TiparLevel;
  slot_capacity: number;
  requirements: {
    min_active_reservations?: number;
    min_completed_deals?: number;
    min_total_investment_volume?: number; // CZK
  };
}

export const TIPAR_PROGRESSION: TiparLevelProgression[] = [
  {
    level: 'SCOUT',
    slot_capacity: 5,
    requirements: {},
  },
  {
    level: 'HUNTER',
    slot_capacity: 10,
    requirements: {
      min_completed_deals: 3,
      min_total_investment_volume: 10_000_000, // 10M CZK
    },
  },
  {
    level: 'ALPHA',
    slot_capacity: 20,
    requirements: {
      min_completed_deals: 10,
      min_total_investment_volume: 50_000_000, // 50M CZK
    },
  },
  {
    level: 'WOLF',
    slot_capacity: 50,
    requirements: {
      min_completed_deals: 25,
      min_total_investment_volume: 150_000_000, // 150M CZK
    },
  },
];

// ================================================================
// EXPORTS
// ================================================================

export default {
  VERSION: SYSTEM_CORE_SCHEMA_VERSION,
  VALIDATION_RULES,
  TIPAR_SLOT_CAPACITY,
  TIPAR_PROGRESSION,
} as const;
