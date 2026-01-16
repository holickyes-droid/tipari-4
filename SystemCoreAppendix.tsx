// Extracted from SystemCoreDocumentation.tsx
// Governance refactor 2026-01-14 (CR-BUNDLE 2026-Q1)

/**
 * SystemCoreAppendix — Pseudocode and Audit Framework
 * Version: 3.8.1
 * Last Updated: 2026-03-13
 * Maintainer: Backend Team
 * Governance Marker: SystemCoreAppendix v3.8.1 — Aligned with Manifest
 */
export const SYSTEM_CORE_APPENDIX_VERSION = "3.8.1";

/**
 * ================================================================
 * SYSTEM CORE APPENDIX — MAPPINGS & CALCULATIONS
 * Tipari.cz — B2B Investment Platform
 * ================================================================
 * 
 * This module contains:
 * - Mapping tables (state → metadata, enums → labels)
 * - Pseudocode examples
 * - Calculation formulas
 * - Implementation examples
 * 
 * Extracted from: §8 (Commission Logic), §10 (SLA), §11 (Events)
 */

import { useState } from 'react';
import { Code, Calculator, Table, GitBranch, Clock, Users } from 'lucide-react';

// ================================================================
// § 8 — COMMISSION LOGIC & CALCULATIONS
// ================================================================

/**
 * § 8.1 — Commission Creation Trigger
 * 
 * CANONICAL RULE:
 * Commission RECORD vzniká VÝHRADNĚ při reservation.state → 'active'
 */
export const COMMISSION_CREATION_PSEUDOCODE = `
// Backend — Reservation State Transition Handler
async function transitionReservationState(
  reservationId: string,
  newState: ReservationState
) {
  // ... existing validation logic ...
  
  // COMMISSION RECORD CREATION RULE — SINGLE TRIGGER
  if (newState === 'active') {
    // ✅ Commission RECORD je vytvořen POUZE zde
    // ⚠️ ENTITLEMENT nevzniká! Pouze tracking začíná.
    const commission = await createCommission({
      reservation_id: reservationId,
      broker_id: reservation.broker_id,
      status: 'pending',
      entitlement_phase: 'negotiation',  // NOT entitled yet
      commission_amount: calculateCommissionAmount(reservation),
      commission_percent: reservation.ticket.commission,
      // ... další pole podle kapitoly 3.5 ...
    });
    
    await logAuditEvent('commission_created', {
      reservation_id: reservationId,
      commission_id: commission.id,
      note: 'Tracking started, entitlement pending investment realization'
    });
  }
  
  // ... rest of transition logic ...
}
`;

/**
 * § 8.2 — Commission Amount Calculation
 * 
 * Formula: commission_amount = investment_amount × (commission_percent / 100)
 */
export function calculateCommissionAmount(
  investmentAmount: number,
  commissionPercent: number
): number {
  // CR-2026-01-14-001: All percent fields use integer values (0–100)
  return investmentAmount * (commissionPercent / 100);
}

export const COMMISSION_CALCULATION_EXAMPLE = `
// Example Calculation:

Investment Amount: 10,000,000 CZK
Commission %:      2% (stored as integer: 2)

Calculation:
commission_amount = 10,000,000 × (2 / 100)
                  = 10,000,000 × 0.02
                  = 200,000 CZK

✅ Commission Amount: 200,000 CZK
`;

/**
 * § 8.6 — Dual Broker Commission Split
 * 
 * CANONICAL RULE:
 * Commission je rozdělena mezi:
 * 1. Platform (platform_fee_percent)
 * 2. Origin Broker (origin_broker_percent)
 * 3. Reservation Broker (reservation_broker_percent)
 * 
 * SUM MUST EQUAL 100%
 */
export interface CommissionSplitCalculation {
  total_commission: number;
  platform_fee_amount: number;
  origin_broker_amount: number;
  reservation_broker_amount: number;
  
  platform_fee_percent: number;
  origin_broker_percent: number;
  reservation_broker_percent: number;
}

export function calculateCommissionSplit(
  commissionAmount: number,
  splitRule: {
    platform_fee_percent: number;      // 0-100
    origin_broker_percent: number;     // 0-100
    reservation_broker_percent: number; // 0-100
  }
): CommissionSplitCalculation {
  // CR-2026-01-14-001: Validation — sum must equal 100
  const sum = splitRule.platform_fee_percent + 
              splitRule.origin_broker_percent + 
              splitRule.reservation_broker_percent;
              
  if (sum !== 100) {
    throw new Error('ERR_INVALID_COMMISSION_SPLIT_SUM: Sum must equal 100%');
  }
  
  return {
    total_commission: commissionAmount,
    platform_fee_amount: Number((commissionAmount * (splitRule.platform_fee_percent / 100)).toFixed(2)),
    origin_broker_amount: Number((commissionAmount * (splitRule.origin_broker_percent / 100)).toFixed(2)),
    reservation_broker_amount: Number((commissionAmount * (splitRule.reservation_broker_percent / 100)).toFixed(2)),
    
    platform_fee_percent: splitRule.platform_fee_percent,
    origin_broker_percent: splitRule.origin_broker_percent,
    reservation_broker_percent: splitRule.reservation_broker_percent,
  };
}

export const COMMISSION_SPLIT_EXAMPLE = `
// Example: Dual Broker Commission Split

Total Commission:     200,000 CZK
Split Rule:           Default 10/40/50

Split Percentages:
- Platform Fee:          10% (stored as integer: 10)
- Origin Broker:         40% (stored as integer: 40)
- Reservation Broker:    50% (stored as integer: 50)

Calculation:
platform_fee_amount       = 200,000 × (10 / 100) = 20,000 CZK
origin_broker_amount      = 200,000 × (40 / 100) = 80,000 CZK
reservation_broker_amount = 200,000 × (50 / 100) = 100,000 CZK

Verification:
20,000 + 80,000 + 100,000 = 200,000 ✅

✅ Platform Fee:          20,000 CZK
✅ Origin Broker:         80,000 CZK
✅ Reservation Broker:    100,000 CZK
`;

/**
 * § 8.6.4 — Commission Split Rule Lookup
 * 
 * PRIORITY:
 * 1. Project-specific override (if exists and active)
 * 2. Global default (if exists and active)
 * 3. Hardcoded fallback (10/40/50)
 */
export const COMMISSION_SPLIT_RULE_LOOKUP_PSEUDOCODE = `
// Backend — Commission Split Rule Lookup
async function getApplicableSplitRule(projectId: string) {
  // PRIORITY 1: Project-specific override
  const projectOverride = await getSplitRule({
    scope: 'project_override',
    project_id: projectId,
    is_active: true
  });
  
  if (projectOverride) {
    return projectOverride;
  }
  
  // PRIORITY 2: Global default
  const globalDefault = await getSplitRule({
    scope: 'global_default',
    is_active: true
  });
  
  if (globalDefault) {
    return globalDefault;
  }
  
  // PRIORITY 3: Hardcoded fallback
  return {
    id: 'HARDCODED_FALLBACK',
    name: 'Hardcoded Default 10/40/50',
    scope: 'global_default',
    platform_fee_percent: 10,
    origin_broker_percent: 40,
    reservation_broker_percent: 50,
    is_active: true,
    created_at: null,
    created_by: 'SYSTEM'
  };
}
`;

/**
 * § 8.6.11 — Commission Collectability State Machine
 * 
 * AUTOMATIC TRANSITIONS:
 * - not_collectable → collectable (when investment_confirmed_at set)
 * - collectable → in_collection (when platform_payment_deadline exceeded)
 * 
 * MANUAL TRANSITIONS (Admin-only):
 * - in_collection → written_off (audit required)
 */
export const COMMISSION_COLLECTABILITY_STATE_MACHINE = `
┌─────────────────┐
│ not_collectable  │ (negotiation phase)
└────────┬─────────┘
         │ investment_confirmed_at set (AUTOMATIC)
         ↓
┌──────────────────┐
│   collectable    │ (platform_entitled phase)
└────────┬─────────┘
         │ platform_payment_deadline exceeded (AUTOMATIC)
         ↓
┌──────────────────┐
│  in_collection   │ (developer neplatí včas)
└────────┬─────────┘
         │ admin manual action (AUDIT REQUIRED)
         ↓
┌──────────────────┐
│   written_off    │ (provize nevymahatelná)
└──────────────────┘

KRITICKÉ:
- written_off je VÝHRADNĚ admin manual action
- Každý přechod → written_off MUSÍ mít audit log
- Automatické procesy NIKDY nestaví written_off
`;

export const COMMISSION_COLLECTABILITY_PSEUDOCODE = `
// Backend — Commission Collectability Auto-Update
async function updateCommissionCollectability(commissionId: string) {
  const commission = await getCommission(commissionId);
  
  // AUTOMATIC TRANSITION 1: not_collectable → collectable
  if (
    commission.collectability === 'not_collectable' &&
    commission.investment_confirmed_at !== null
  ) {
    await updateCommission(commissionId, {
      collectability: 'collectable',
      entitlement_phase: 'platform_entitled'
    });
    
    await logAuditEvent('COMMISSION_COLLECTABILITY_CHANGED', {
      commission_id: commissionId,
      old_state: 'not_collectable',
      new_state: 'collectable',
      trigger: 'investment_confirmed_at_set'
    });
  }
  
  // AUTOMATIC TRANSITION 2: collectable → in_collection
  if (
    commission.collectability === 'collectable' &&
    commission.platform_payment_deadline !== null &&
    new Date() > new Date(commission.platform_payment_deadline)
  ) {
    await updateCommission(commissionId, {
      collectability: 'in_collection'
    });
    
    await logAuditEvent('COMMISSION_COLLECTABILITY_CHANGED', {
      commission_id: commissionId,
      old_state: 'collectable',
      new_state: 'in_collection',
      trigger: 'platform_payment_deadline_exceeded'
    });
    
    // Notify finance team for collection
    await notifyFinanceTeam(commissionId);
  }
  
  // MANUAL TRANSITION: in_collection → written_off
  // ⚠️ ONLY callable by Admin with audit requirement
}

// Admin-only function
async function writeOffCommission(
  commissionId: string,
  adminId: string,
  reason: string
) {
  // Validation
  if (reason.length < 50) {
    throw new Error('ERR_WRITE_OFF_REASON_TOO_SHORT: Min 50 chars required');
  }
  
  const commission = await getCommission(commissionId);
  
  if (commission.collectability !== 'in_collection') {
    throw new Error('ERR_WRITE_OFF_INVALID_STATE: Can only write off from in_collection');
  }
  
  // Update collectability
  await updateCommission(commissionId, {
    collectability: 'written_off'
  });
  
  // MANDATORY AUDIT LOG
  await logAuditEvent('commission_written_off', {
    commission_id: commissionId,
    admin_id: adminId,
    old_state: 'in_collection',
    new_state: 'written_off',
    reason: reason,
    severity: 'HIGH',
    metadata: {
      collection_attempts: commission.collection_attempts,
      legal_status: commission.legal_status,
      // ... additional audit context ...
    }
  });
  
  // Notify stakeholders
  await notifyStakeholders(commissionId, 'written_off');
}
`;

/**
 * § 5.5 — Investor Matching Logic (CR-2026-02-15-007)
 */
export const INVESTOR_MATCHING_PSEUDOCODE = `
function matchInvestorToProjects(investor: Investor, projects: Project[], tickets: Ticket[]): MatchResult[] {
  const prefs = investor.preferences;
  const matches: MatchResult[] = [];

  for (const project of projects) {
    const securities = getSecuritiesByProject(project.id);
    const relatedTickets = tickets.filter(t => t.project_id === project.id);
    let score = 0;
    let matched: string[] = [];

    if (prefs.investment_forms.includes(project.investment_form)) {
      score += 0.4; matched.push('investment_form');
    }

    if (project.yield_pa >= prefs.yield_min && project.yield_pa <= prefs.yield_max) {
      score += 0.3; matched.push('yield');
    }

    const hasSecurity = securities.some(s => prefs.preferred_security_types.includes(s.type));
    if (hasSecurity) { score += 0.3; matched.push('security'); }

    if (score > 0) matches.push({ project_id: project.id, score, attributes: matched });
  }

  logAuditEvent('investor_match_executed', { investor_id: investor.id, matches_count: matches.length });
  return matches.sort((a, b) => b.score - a.score);
}
`;

// ================================================================
// § 10 — SLA & TIMEOUT CALCULATIONS
// ================================================================

/**
 * § 10.1 — Timeout Constants
 */
export const TIMEOUT_CONSTANTS = {
  RESERVATION_TIMEOUT_DAYS: { value: 30, editable: true },
  COMMISSION_NEGOTIATION_TIMEOUT_DAYS: { value: 90, editable: true },
  PLATFORM_PAYMENT_TIMEOUT_DAYS: { value: 30, editable: true },
  BROKER_PAYOUT_TIMEOUT_DAYS: { value: 3, editable: true },
} as const;

// Governance Note: TIMEOUTS centralized and cleaned — v3.7.5

/**
 * § 10.2 — Deadline Calculation Functions
 */
export function calculateReservationExpiresAt(createdAt: Date): Date {
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + TIMEOUT_CONSTANTS.RESERVATION_TIMEOUT_DAYS.value); // MEDIUM FIX v3.7.5
  return expiresAt;
}

export function calculateNegotiationDeadline(bothSignedAt: Date): Date {
  const deadline = new Date(bothSignedAt);
  deadline.setDate(deadline.getDate() + TIMEOUT_CONSTANTS.COMMISSION_NEGOTIATION_TIMEOUT_DAYS.value); // MEDIUM FIX v3.7.5
  return deadline;
}

export function calculatePlatformPaymentDeadline(investmentConfirmedAt: Date): Date {
  const deadline = new Date(investmentConfirmedAt);
  deadline.setDate(deadline.getDate() + TIMEOUT_CONSTANTS.PLATFORM_PAYMENT_TIMEOUT_DAYS.value); // MEDIUM FIX v3.7.5
  return deadline;
}

export function calculateBrokerPayoutDeadline(platformPaidAt: Date): Date {
  const deadline = new Date(platformPaidAt);
  deadline.setDate(deadline.getDate() + TIMEOUT_CONSTANTS.BROKER_PAYOUT_TIMEOUT_DAYS.value); // MEDIUM FIX v3.7.5
  return deadline;
}

export const SLA_CALCULATION_EXAMPLES = `
// Example 1: Reservation Timeout

Created At:     2026-01-14 10:00:00
Timeout Days:   30

Calculation:
expires_at = created_at + 30 days
           = 2026-01-14 + 30 days
           = 2026-02-13 10:00:00

✅ Expires At: 2026-02-13 10:00:00

---

// Example 2: Commission Negotiation Deadline

Both Signed At:       2026-01-14 10:00:00
Negotiation Timeout:  90 days

Calculation:
negotiation_deadline = both_signed_at + 90 days
                     = 2026-01-14 + 90 days
                     = 2026-04-14 10:00:00

✅ Negotiation Deadline: 2026-04-14 10:00:00

---

// Example 3: Platform Payment Deadline

Investment Confirmed At:  2026-03-01 10:00:00
Payment Timeout:          30 days

Calculation:
platform_payment_deadline = investment_confirmed_at + 30 days
                          = 2026-03-01 + 30 days
                          = 2026-03-31 10:00:00

✅ Platform Payment Deadline: 2026-03-31 10:00:00

---

// Example 4: Broker Payout Deadline

Platform Paid At:   2026-03-25 10:00:00
Payout Timeout:     3 days

Calculation:
broker_payout_deadline = platform_paid_at + 3 days
                       = 2026-03-25 + 3 days
                       = 2026-03-28 10:00:00

✅ Broker Payout Deadline: 2026-03-28 10:00:00
`;

/**
 * § 10.3 — Automatic Expiration Logic
 */
export const AUTOMATIC_EXPIRATION_PSEUDOCODE = `
// Backend — Cron Job (runs every hour)
async function processExpiredReservations() {
  const now = new Date();
  
  // Find all reservations where expires_at has passed
  const expiredReservations = await getReservations({
    state: ['pending_platform', 'platform_approved', 'investor_signed', 'waiting_developer_decision', 'developer_confirmed'],
    expires_at_before: now
  });
  
  for (const reservation of expiredReservations) {
    // Transition to expired state
    await transitionReservationState(reservation.id, 'expired', {
      termination_reason: 'reservation_expired',
      termination_reason_details: \`SLA expired at \${reservation.expires_at}\`
    });
    
    // Release slot
    await releaseSlot(reservation.slot_id);
    
    // Notify broker
    await notifyUser(reservation.broker_id, {
      type: 'reservation_expired',
      title: 'Rezervace vypršela',
      message: \`Rezervace #\${reservation.reservation_number} vypršela (SLA: 30 dní)\`,
      entity_type: 'reservation',
      entity_id: reservation.id
    });
    
    // Audit log
    await logAuditEvent('RESERVATION_EXPIRED', {
      reservation_id: reservation.id,
      expires_at: reservation.expires_at,
      trigger: 'automatic_cron_job'
    });
  }
}

// Backend — Cron Job (runs daily)
async function processExpiredCommissions() {
  const now = new Date();
  
  // Find commissions where negotiation_deadline has passed
  const expiredNegotiations = await getCommissions({
    entitlement_phase: 'negotiation',
    negotiation_deadline_before: now
  });
  
  for (const commission of expiredNegotiations) {
    // Mark as terminated
    await updateCommission(commission.id, {
      termination_reason: 'negotiation_expired',
      termination_reason_details: \`Investment not realized within 90 days\`
    });
    
    // Audit log
    await logAuditEvent('COMMISSION_NEGOTIATION_EXPIRED', {
      commission_id: commission.id,
      negotiation_deadline: commission.negotiation_deadline,
      trigger: 'automatic_cron_job'
    });
  }
  
  // Find commissions where platform_payment_deadline has passed
  const overduePayments = await getCommissions({
    collectability: 'collectable',
    platform_payment_deadline_before: now
  });
  
  for (const commission of overduePayments) {
    // Automatic transition to in_collection
    await updateCommission(commission.id, {
      collectability: 'in_collection'
    });
    
    // Notify finance team
    await notifyFinanceTeam(commission.id, 'payment_overdue');
    
    // Audit log
    await logAuditEvent('COMMISSION_PAYMENT_OVERDUE', {
      commission_id: commission.id,
      platform_payment_deadline: commission.platform_payment_deadline,
      trigger: 'automatic_cron_job'
    });
  }
}
`;

// ================================================================
// § 9 — INVESTOR MATCHING AUTO TRIGGER (v3.7.6)
// ================================================================

/**
 * § 9.1 — Automatic Matching Triggers
 * 
 * CANONICAL RULE:
 * Investor Matching se automaticky přepočítává při změnách relevantních dat.
 */
export const INVESTOR_MATCHING_AUTO_TRIGGER_PSEUDOCODE = `
// Backend — Investor Update Handler
async function onInvestorUpdate(investorId: string) {
  // Přepočítá matches pro daného investora
  await recalculateMatchesForInvestor(investorId);
  
  await logAuditEvent('investor_match_executed', {
    investor_id: investorId,
    trigger: 'investor_update'
  });
}

// Backend — Ticket Update Handler
async function onTicketUpdate(ticketId: string) {
  // Najde všechny investory a přepočítá matches pro tento tiket
  await updateInvestorMatchesForTicket(ticketId);
  
  await logAuditEvent('investor_match_results_updated', {
    ticket_id: ticketId,
    trigger: 'ticket_update'
  });
}

// Backend — Project Publish Handler
async function onProjectPublish(projectId: string) {
  const project = await getProject(projectId);
  
  if (project.status === 'published') {
    // Projekt byl publikován → přepočítej matches
    await updateInvestorMatchesForProject(projectId);
    
    await logAuditEvent('investor_match_results_updated', {
      project_id: projectId,
      trigger: 'project_published'
    });
  } else {
    // Projekt byl deaktivován → označ matches jako neaktivní
    await deactivateMatchesForProject(projectId);
    
    await logAuditEvent('investor_match_removed', {
      project_id: projectId,
      trigger: 'project_deactivated'
    });
  }
}
`;

/**
 * § 9.2 — Matching Recalculation Logic
 * 
 * CANONICAL RULE (v3.7.6+):
 * Výsledky matchingu jsou trvale uloženy a aktualizovány při změnách.
 * Zůstávají aktivní, dokud tiket i investor existují.
 */
export const INVESTOR_MATCHING_RECALCULATION_PSEUDOCODE = `
async function recalculateMatchesForInvestor(investorId: string) {
  const investor = await getInvestor(investorId);
  const prefs = investor.preferences;
  
  const availableTickets = await getTickets({
    status: ['available'],
    project_status: 'published'
  });
  
  const newMatches = [];
  
  for (const ticket of availableTickets) {
    const project = await getProject(ticket.project_id);
    const matchScore = calculateMatchScore(prefs, ticket, project);
    
    if (matchScore > 0.5) {
      newMatches.push({
        investor_id: investorId,
        ticket_id: ticket.id,
        match_score: matchScore,
        matched_attributes: getMatchedAttributes(prefs, ticket, project),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }
  
  // Uložit nové matches (přepsat existující)
  await saveInvestorMatches(investorId, newMatches);
  
  return newMatches;
}

async function updateInvestorMatchesForTicket(ticketId: string) {
  const ticket = await getTicket(ticketId);
  const project = await getProject(ticket.project_id);
  
  const allInvestors = await getInvestors({ status: 'active' });
  
  for (const investor of allInvestors) {
    const prefs = investor.preferences;
    const matchScore = calculateMatchScore(prefs, ticket, project);
    
    if (matchScore > 0.5) {
      await upsertInvestorMatch({
        investor_id: investor.id,
        ticket_id: ticketId,
        match_score: matchScore,
        matched_attributes: getMatchedAttributes(prefs, ticket, project),
        is_active: true,
        updated_at: new Date()
      });
    } else {
      // Pokud match už existuje, ale score je pod threshold → odstranit
      await removeInvestorMatch(investor.id, ticketId);
    }
  }
}
`;

/**
 * § 9.3 — Persistent Storage Logic (v3.7.6+)
 * 
 * CANONICAL RULE:
 * Výsledky jsou trvale ukládány a aktualizovány.
 * Deaktivují se pouze při ukončení tiketu nebo archivu investora.
 */
export const INVESTOR_MATCHING_PERSISTENT_STORAGE_PSEUDOCODE = `
// Backend — Update Investor Matches (Persistent)
async function updateInvestorMatches(ticketId: string) {
  const ticket = await getTicket(ticketId);
  const investors = await getAllInvestors({ state: ['active', 'verified'] });

  for (const investor of investors) {
    const match = calculateMatch(investor, ticket);
    const exists = await getInvestorMatchingResult(investor.id, ticket.id);

    if (match.score > 0) {
      if (exists) {
        // Aktualizuj existující match
        await updateMatchingResult(exists.id, {
          match_score: match.score,
          matched_attributes: match.attributes,
          is_active: true,
          updated_at: new Date(),
        });
        
        await logAuditEvent('investor_match_results_updated', {
          match_id: exists.id,
          investor_id: investor.id,
          ticket_id: ticket.id,
          old_score: exists.match_score,
          new_score: match.score,
        });
      } else {
        // Vytvoř nový match
        const newMatch = await createMatchingResult({
          investor_id: investor.id,
          ticket_id: ticket.id,
          match_score: match.score,
          matched_attributes: match.attributes,
          is_active: true,
          created_at: new Date(),
        });
        
        await logAuditEvent('investor_match_resulted', {
          match_id: newMatch.id,
          investor_id: investor.id,
          ticket_id: ticket.id,
          score: match.score,
        });
      }
    }
  }
}

// Backend — Deactivate Matches on Ticket Closure
async function deactivateMatches(ticketId: string) {
  const matches = await getMatchesByTicket(ticketId);
  
  for (const match of matches) {
    await updateMatchingResult(match.id, { 
      is_active: false,
      updated_at: new Date()
    });
    
    await logAuditEvent('investor_match_removed', { 
      ticket_id: ticketId, 
      match_id: match.id,
      reason: 'ticket_closed'
    });
  }
}

// Backend — Trigger on Ticket State Change
async function onTicketStatusChange(ticketId: string, oldStatus: string, newStatus: string) {
  if (newStatus === 'completed' || newStatus === 'closed') {
    await deactivateMatches(ticketId);
  } else if (newStatus === 'available') {
    await updateInvestorMatches(ticketId);
  }
}
`;

/**
 * § 9.4 — Investor Matching Audit & SLA Validation (v3.7.6)
 * 
 * CANONICAL RULE:
 * Denní cron proces validuje konzistenci všech aktivních matches a aktualizuje skóre.
 * Governance Note: Investor Matching Audit & SLA Validation Implemented (v3.7.6)
 */
export const INVESTOR_MATCHING_VALIDATION_CRON_PSEUDOCODE = `
// Backend — Daily Cron Process (02:00 CET)
async function INVESTOR_MATCH_VALIDATION_CRON() {
  await logAuditEvent('investor_match_validation_started', {
    timestamp: new Date(),
  });

  const activeMatches = await getAllMatchingResults({ is_active: true });
  let updatedCount = 0;
  let removedCount = 0;

  for (const match of activeMatches) {
    const investor = await getInvestor(match.investor_id);
    const ticket = await getTicket(match.ticket_id);

    // Validace existence a stavu
    if (!investor || investor.state === 'archived' || !ticket || ticket.state === 'completed' || ticket.state === 'closed') {
      await updateMatchingResult(match.id, { 
        is_active: false,
        updated_at: new Date()
      });
      
      await logAuditEvent('investor_match_inactive_removed', {
        match_id: match.id,
        investor_id: match.investor_id,
        ticket_id: match.ticket_id,
        reason: !investor ? 'investor_deleted' : !ticket ? 'ticket_deleted' : 'state_changed',
      });
      
      removedCount++;
      continue;
    }

    // Přepočítej skóre podle aktuálních dat
    const recalculated = calculateMatch(investor, ticket);
    
    // Aktualizuj pouze pokud se skóre změnilo
    if (Math.abs(recalculated.score - match.match_score) > 0.01) {
      await updateMatchingResult(match.id, {
        match_score: recalculated.score,
        matched_attributes: recalculated.attributes,
        updated_at: new Date(),
      });
      
      await logAuditEvent('investor_match_score_updated', {
        match_id: match.id,
        investor_id: investor.id,
        ticket_id: ticket.id,
        old_score: match.match_score,
        new_score: recalculated.score,
      });
      
      updatedCount++;
    }
  }

  await logAuditEvent('investor_match_validation_completed', {
    total_matches: activeMatches.length,
    updated_count: updatedCount,
    removed_count: removedCount,
    timestamp: new Date(),
  });
}

// SLA Monitor — Check Matching Update Latency
async function validateMatchingSLA() {
  const recentChanges = await getAuditEvents({
    event_type: ['investor_updated', 'ticket_updated'],
    created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
  });

  for (const change of recentChanges) {
    const matchingUpdate = await getAuditEvent({
      event_type: 'investor_match_results_updated',
      entity_id: change.entity_id,
      created_at: { gte: change.created_at }
    });

    const latency = matchingUpdate 
      ? matchingUpdate.created_at.getTime() - change.created_at.getTime()
      : null;

    // SLA = 24 hodin
    if (!matchingUpdate || latency > 24 * 60 * 60 * 1000) {
      await logAuditEvent('investor_match_sla_violation', {
        entity_id: change.entity_id,
        entity_type: change.event_type.includes('investor') ? 'investor' : 'ticket',
        expected_sla: '24h',
        actual_latency: latency ? \`\${latency / 1000 / 60 / 60}h\` : 'not_updated',
      });
    }
  }
}
`;

// ================================================================
// § 11 — EVENT & NOTIFICATION MAPPINGS
// ================================================================

/**
 * § 11.1 — Event Trigger Mapping
 */
export const EVENT_TRIGGER_MAP = {
  // Reservation events
  reservation_created: {
    trigger: 'Broker vytvoří rezervaci',
    notify: ['broker'],
    audit_action: 'reservation_created',
  },
  reservation_approved: {
    trigger: 'Admin schválí rezervaci',
    notify: ['broker', 'investor'],
    audit_action: 'reservation_approved',
  },
  reservation_rejected: {
    trigger: 'Admin/Developer zamítne rezervaci',
    notify: ['broker'],
    audit_action: 'reservation_rejected',
  },
  investor_signed: {
    trigger: 'Investor podepíše RA',
    notify: ['developer', 'broker'],
    audit_action: 'reservation_investor_signed',
  },
  developer_confirmed: {
    trigger: 'Developer potvrdí zájem',
    notify: ['broker'],
    audit_action: 'reservation_developer_confirmed',
  },
  developer_signed_in_dashboard: {
    trigger: 'Developer potvrzuje podpis smlouvy v dashboardu',
    notify: ['broker', 'admin'],
    audit_action: 'developer_signed_in_dashboard',
  },
  reservation_activated: {
    trigger: 'Developer podepíše → state = active',
    notify: ['broker', 'admin'],
    audit_action: 'reservation_activated',
  },
  
  // Commission events
  commission_created: {
    trigger: 'Reservation → active (automatic)',
    notify: ['broker', 'admin'],
    audit_action: 'commission_created',
  },
  commission_split_calculated: {
    trigger: 'Dual-broker split vypočten',
    notify: ['admin'],
    audit_action: 'commission_split_calculated',
  },
  investment_confirmed: {
    trigger: 'Admin potvrdí realizaci investice',
    notify: ['broker', 'admin'],
    audit_action: 'commission_investment_confirmed',
  },
  platform_paid: {
    trigger: 'Developer zaplatí platformě',
    notify: ['admin', 'finance'],
    audit_action: 'commission_platform_paid',
  },
  broker_payable: {
    trigger: 'Admin připraví payout',
    notify: ['broker'],
    audit_action: 'commission_broker_payable',
  },
  commission_paid: {
    trigger: 'Provize vyplacena brokerům',
    notify: ['broker'],
    audit_action: 'commission_paid',
  },
  
  // Project origin events
  project_origin_assigned: {
    trigger: 'Admin přiřadí origin brokera',
    notify: ['origin_broker', 'admin'],
    audit_action: 'project_origin_assigned',
  },
  
  // Change request events (v3.3.9+)
  change_request_initiated: {
    trigger: 'CR vytvořen',
    notify: ['admin', 'developer'],
    audit_action: 'change_request_initiated',
  },
  change_request_approved: {
    trigger: 'CR schválen',
    notify: ['requestor', 'admin'],
    audit_action: 'change_request_approved',
  },
  
  // Admin manual canonical input allowed — CR-2026-02-15-008
  admin_canonical_input: {
    trigger: 'Admin ručně upraví data',
    notify: ['admin'],
    audit_action: 'ADMIN_CANONICAL_INPUT',
  },
} as const;

/**
 * § 11.2 — Notification Template Generator
 */
export function generateNotificationContent(
  eventType: keyof typeof EVENT_TRIGGER_MAP,
  entityData: Record<string, any>
): { title: string; message: string } {
  switch (eventType) {
    case 'reservation_created':
      return {
        title: 'Nová rezervace vytvořena',
        message: `Rezervace #${entityData.reservation_number} byla vytvořena a čeká na schválení platformy.`,
      };
      
    case 'reservation_approved':
      return {
        title: 'Rezervace schválena',
        message: `Rezervace #${entityData.reservation_number} byla schválena. Nyní čeká na podpis investora.`,
      };
      
    case 'investor_signed':
      return {
        title: 'Investor podepsal',
        message: `Investor podepsal rezervační dohodu #${entityData.reservation_number}. Nyní čeká na rozhodnutí developera.`,
      };
      
    case 'reservation_activated':
      return {
        title: 'Rezervace aktivována',
        message: `Rezervace #${entityData.reservation_number} je aktivní. Commission tracking zahájen.`,
      };
      
    case 'commission_created':
      return {
        title: 'Provize vytvořena',
        message: `Commission #${entityData.commission_id} vytvořena. Čeká na realizaci investice (negotiation phase).`,
      };
      
    case 'investment_confirmed':
      return {
        title: 'Investice realizována',
        message: `Investice pro commission #${entityData.commission_id} byla realizována. Broker má nyní entitlement (nárok na provizi).`,
      };
      
    case 'broker_payable':
      return {
        title: 'Provize připravena k výplatě',
        message: `Commission #${entityData.commission_id} je připravena k výplatě. Amount: ${entityData.commission_amount} CZK`,
      };
      
    case 'commission_paid':
      return {
        title: 'Provize vyplacena',
        message: `Commission #${entityData.commission_id} byla vyplacena. Amount: ${entityData.commission_amount} CZK`,
      };
      
    default:
      return {
        title: 'Systémová notifikace',
        message: `Event: ${eventType}`,
      };
  }
}

// ================================================================
// REACT COMPONENT — APPENDIX VIEWER
// ================================================================

export function SystemCoreAppendix() {
  const [activeTab, setActiveTab] = useState<'commission' | 'sla' | 'events' | 'investor_matching'>('commission');
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calculator className="size-8 text-blue-600" />
            SystemCore Appendix
          </h1>
          <p className="text-gray-600">
            Mapovací tabulky, pseudokódy a calculation examples
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Version: {SYSTEM_CORE_APPENDIX_VERSION} | Extracted from SystemCoreDocumentation.tsx
          </p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('commission')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'commission'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="size-4" />
                  Commission Logic
                </div>
              </button>

              <button
                onClick={() => setActiveTab('investor_matching')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'investor_matching'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  Investor Matching
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('sla')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sla'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  SLA & Timeouts
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4" />
                  Events & Notifications
                </div>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="size-5 text-blue-600" />
                Commission Creation Pseudocode
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{COMMISSION_CREATION_PSEUDOCODE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Commission Calculation Example</h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{COMMISSION_CALCULATION_EXAMPLE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Commission Split Example</h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{COMMISSION_SPLIT_EXAMPLE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Commission Collectability State Machine</h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{COMMISSION_COLLECTABILITY_STATE_MACHINE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Collectability Pseudocode</h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{COMMISSION_COLLECTABILITY_PSEUDOCODE}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'investor_matching' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="size-5 text-blue-600" />
                Investor Matching Pseudocode (CR-2026-02-15-007)
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{INVESTOR_MATCHING_PSEUDOCODE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="size-5 text-blue-600" />
                Matching Recalculation Logic (v3.7.6+)
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{INVESTOR_MATCHING_RECALCULATION_PSEUDOCODE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="size-5 text-blue-600" />
                Persistent Storage Logic (v3.7.6+)
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{INVESTOR_MATCHING_PERSISTENT_STORAGE_PSEUDOCODE}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="size-5 text-blue-600" />
                Investor Matching Validation Cron (v3.7.6)
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{INVESTOR_MATCHING_VALIDATION_CRON_PSEUDOCODE}</code>
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === 'sla' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Timeout Constants</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(TIMEOUT_CONSTANTS).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">{key}</div>
                    <div className="text-2xl font-bold text-blue-600">{value} days</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">SLA Calculation Examples</h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{SLA_CALCULATION_EXAMPLES}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Automatic Expiration Logic</h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{AUTOMATIC_EXPIRATION_PSEUDOCODE}</code>
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Table className="size-5 text-blue-600" />
                Event Trigger Mapping
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notify</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(EVENT_TRIGGER_MAP).map(([eventType, config]) => (
                      <tr key={eventType}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{eventType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{config.trigger}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{config.notify.join(', ')}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-mono">{config.audit_action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// EXPORTS
// ================================================================

export default {
  VERSION: SYSTEM_CORE_APPENDIX_VERSION,
  
  // Commission logic
  COMMISSION_CREATION_PSEUDOCODE,
  COMMISSION_CALCULATION_EXAMPLE,
  COMMISSION_SPLIT_EXAMPLE,
  COMMISSION_COLLECTABILITY_STATE_MACHINE,
  COMMISSION_COLLECTABILITY_PSEUDOCODE,
  COMMISSION_SPLIT_RULE_LOOKUP_PSEUDOCODE,
  calculateCommissionAmount,
  calculateCommissionSplit,
  
  // Investor Matching
  INVESTOR_MATCHING_PSEUDOCODE,
  
  // SLA & Timeouts
  TIMEOUT_CONSTANTS,
  SLA_CALCULATION_EXAMPLES,
  AUTOMATIC_EXPIRATION_PSEUDOCODE,
  calculateReservationExpiresAt,
  calculateNegotiationDeadline,
  calculatePlatformPaymentDeadline,
  calculateBrokerPayoutDeadline,
  
  // Events & Notifications
  EVENT_TRIGGER_MAP,
  generateNotificationContent,
} as const;
