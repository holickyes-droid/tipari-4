import React from 'react';
import { 
  Building2, 
  MapPin, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  FileCheck,
  ShieldCheck,
  ChevronRight,
  Users,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  GitBranch,
  ExternalLink
} from 'lucide-react';

// Imported Types (assuming from Schema)
import type { Project, Ticket } from './SystemCoreSchema';

// Governance Note: Visual risk indicators removed from UI — CR-2026-02-15-012 (v3.7.5)

/**
 * ================================================================
 * SYSTEM CORE UX LIBRARY
 * Canonical UI Components for Tipari.cz
 * ================================================================
 */

/**
 * ProjectCard
 * Displays project summary without risk indicators.
 */
export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Building2 className="size-6 text-gray-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="size-3" />
              <span>{project.location}</span>
            </div>
          </div>
        </div>
        {/* Risk Badge REMOVED - CR-2026-02-15-012 */}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Typ projektu</span>
          <span className="font-medium text-gray-900">{project.project_type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Výnos p.a.</span>
          <span className="font-medium text-blue-600">{project.yield_pa}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cílová částka</span>
          <span className="font-medium text-gray-900">{project.target_amount.toLocaleString()} CZK</span>
        </div>
      </div>

      <button className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200">
        Zobrazit detail
      </button>
    </div>
  );
};

/**
 * TicketCard
 * Displays individual investment ticket opportunity.
 * Governance Note: Investor Matching visualization added — v3.7.6
 * Governance Note: Real API integration added — v3.8.1
 */

interface InvestorMatch {
  investor_id: string;
  investor_name: string;
  investor_email?: string;
  match_score: number;
  match_quality: 'excellent' | 'good' | 'fair' | 'poor';
  matched_attributes: string[];
  preference_alignment: number;
  created_at: string;
}

export const TicketCard: React.FC<{ ticket: Ticket & { matching_investors_count?: number } }> = ({ ticket }) => {
  const [showMatchingModal, setShowMatchingModal] = React.useState(false);
  const [investors, setInvestors] = React.useState<InvestorMatch[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const matchingCount = ticket.matching_investors_count || 0;
  
  // Load matching investors when modal opens (v3.8.1)
  React.useEffect(() => {
    if (showMatchingModal) {
      loadMatchingInvestors();
    }
  }, [showMatchingModal]);
  
  async function loadMatchingInvestors() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/investor-matching/${ticket.id}`);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      const data: InvestorMatch[] = await res.json();
      setInvestors(data);
      
    } catch (err) {
      console.error('Error fetching matching investors:', err);
      setError('Nepodařilo se načíst investory. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  }
  
  function getMatchQualityColor(quality: string): string {
    const colors = {
      excellent: 'bg-green-100 text-green-700',
      good: 'bg-blue-100 text-blue-700',
      fair: 'bg-yellow-100 text-yellow-700',
      poor: 'bg-gray-100 text-gray-700',
    };
    return colors[quality] || 'bg-gray-100 text-gray-700';
  }
  
  function formatAttributeName(attr: string): string {
    return attr
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tiket #{ticket.id.slice(0, 8)}
          </span>
          {/* Status indicator uses neutral colors for non-critical states */}
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
            {ticket.state}
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900 mb-1">{ticket.amount.toLocaleString()} CZK</h4>
          <p className="text-sm text-gray-500">Minimální investice</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-gray-400" />
            <span>{ticket.expected_yield_percent}% p.a.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-gray-400" />
            <span>{ticket.duration_months} měsíců</span>
          </div>
        </div>
        
        {/* Risk Level Visualization REMOVED */}
        
        {/* Investor Matching Visualization (v3.7.6) */}
        {matchingCount > 0 && (
          <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-3">
            <div className="text-sm text-blue-700 flex items-center gap-1.5">
              <Users className="size-4" />
              <span>Shoda s <strong>{matchingCount}</strong> investory</span>
            </div>
            <button 
              onClick={() => setShowMatchingModal(true)}
              className="text-blue-600 text-xs hover:underline font-medium"
            >
              Zobrazit investory
            </button>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button className="flex items-center gap-1 text-sm text-gray-700 font-medium hover:text-gray-900">
            Detail tiketu <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Matching Investors Modal */}
      {showMatchingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Shoda s investory</h3>
                <p className="text-sm text-gray-500">Tiket #{ticket.id.slice(0, 8)}</p>
              </div>
              <button 
                onClick={() => setShowMatchingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body — REAL DATA v3.8.1 */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Načítám investory...</p>
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <button 
                    onClick={loadMatchingInvestors}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                  >
                    Zkusit znovu
                  </button>
                </div>
              )}
              
              {/* Empty State */}
              {!loading && !error && investors.length === 0 && (
                <div className="text-center py-12">
                  <Users className="size-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Žádní investoři nebyli nalezeni.</p>
                </div>
              )}
              
              {/* Real Data — Investor List */}
              {!loading && !error && investors.length > 0 && (
                <div className="space-y-3">
                  {investors.map((inv) => (
                    <div key={inv.investor_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{inv.investor_name}</h4>
                          <p className="text-xs text-gray-500">ID: {inv.investor_id.slice(0, 12)}...</p>
                          {inv.investor_email && (
                            <p className="text-xs text-gray-500 mt-0.5">{inv.investor_email}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={`flex items-center gap-1 ${getMatchQualityColor(inv.match_quality)} px-2 py-1 rounded text-xs font-semibold`}>
                            Match: {inv.match_score}%
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {inv.match_quality}
                          </span>
                        </div>
                      </div>
                      
                      {/* Matched Attributes */}
                      {inv.matched_attributes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {inv.matched_attributes.map((attr) => (
                            <span 
                              key={attr}
                              className="px-2 py-1 bg-white border border-gray-200 text-xs text-gray-600 rounded"
                            >
                              ✓ {formatAttributeName(attr)}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Additional Metrics */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>Preference:</span>
                          <span className="font-medium text-gray-700">{inv.preference_alignment}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Calculated:</span>
                          <span className="font-medium text-gray-700">
                            {new Date(inv.created_at).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowMatchingModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Zavřít
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Exportovat seznam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * ProjectDetailHeader
 * Header component for project detail view.
 */
export const ProjectDetailHeader: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="bg-white border-b border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                {project.project_type}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">{project.location}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
          
          <div className="flex gap-3">
             {/* Actions */}
          </div>
        </div>
        
        {/* Key Metrics - No Risk Indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div>
             <span className="text-sm text-gray-500 block mb-1">Objem</span>
             <span className="text-xl font-bold text-gray-900">{project.target_amount.toLocaleString()}</span>
          </div>
          <div>
             <span className="text-sm text-gray-500 block mb-1">Výnos</span>
             <span className="text-xl font-bold text-gray-900">{project.yield_pa}% p.a.</span>
          </div>
          <div>
             <span className="text-sm text-gray-500 block mb-1">Doba</span>
             <span className="text-xl font-bold text-gray-900">24-36 měsíců</span>
          </div>
          <div>
             <span className="text-sm text-gray-500 block mb-1">Zajištění</span>
             <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <ShieldCheck className="size-5 text-gray-400" />
               Vícestupňové
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TicketDetail
 * Detail view for a ticket.
 */
export const TicketDetail: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Parametry tiketu</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">ID Tiketu</span>
            <span className="font-mono text-gray-900">{ticket.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Stav</span>
            <span className="font-medium text-gray-700">{ticket.state}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Úrok</span>
            <span className="font-medium text-gray-900">{ticket.expected_yield_percent}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Splatnost</span>
            <span className="font-medium text-gray-900">{ticket.duration_months} měsíců</span>
          </div>
        </div>
        
        {/* Risk Analysis Section REMOVED */}
      </div>
    </div>
  );
};

/**
 * ================================================================
 * INCIDENT MANAGEMENT COMPONENTS
 * ================================================================
 */

/**
 * SystemIncident Type (from Schema)
 */
interface SystemIncident {
  id: string;
  module_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
  description: string;
  created_at: string;
  sla_resolution_hours: number;
  sla_response_hours: number;
  auto_resolve_enabled: boolean;
}

/**
 * SLA Status Type
 */
interface SLAStatus {
  hoursLeft: number;
  minutesLeft: number;
  statusColor: string;
  isOverdue: boolean;
  deadline: Date;
  percentRemaining: number;
}

/**
 * Calculate SLA Status for Incident (v3.8.1)
 * Governance Note: SLA countdown timer calculation added — v3.8.1
 */
function calculateSLAStatus(incident: SystemIncident): SLAStatus {
  const now = new Date();
  const created = new Date(incident.created_at);
  const slaHours = incident.sla_resolution_hours || 24;
  
  const deadline = new Date(created.getTime() + slaHours * 3600000);
  const diffMs = deadline.getTime() - now.getTime();
  const hoursLeft = Math.floor(diffMs / 3600000);
  const minutesLeft = Math.floor((diffMs % 3600000) / 60000);
  
  const isOverdue = diffMs < 0;
  const totalSlaMs = slaHours * 3600000;
  const percentRemaining = Math.max(0, Math.min(100, (diffMs / totalSlaMs) * 100));
  
  let statusColor: string;
  
  if (isOverdue) {
    statusColor = 'text-red-600 bg-red-50 border-red-200';
  } else if (hoursLeft < 1) {
    statusColor = 'text-red-600';
  } else if (percentRemaining < 50) {
    statusColor = 'text-yellow-600';
  } else {
    statusColor = 'text-green-600';
  }
  
  return {
    hoursLeft: Math.max(0, hoursLeft),
    minutesLeft: Math.max(0, minutesLeft),
    statusColor,
    isOverdue,
    deadline,
    percentRemaining,
  };
}

/**
 * Format SLA Time Display
 */
function formatSLATime(sla: SLAStatus): string {
  if (sla.isOverdue) {
    return '⚠️ OVERDUE';
  }
  
  if (sla.hoursLeft === 0) {
    return `🔥 ${sla.minutesLeft}m`;
  }
  
  if (sla.hoursLeft < 24) {
    return `⏱️ ${sla.hoursLeft}h`;
  }
  
  const days = Math.floor(sla.hoursLeft / 24);
  const hours = sla.hoursLeft % 24;
  return `📅 ${days}d ${hours}h`;
}

/**
 * IncidentDashboard Component (v3.8.1)
 * Administrative dashboard displaying system incidents with real-time SLA countdown.
 * Governance Note: SLA countdown timer added — v3.8.1
 */
export const IncidentDashboard: React.FC = () => {
  const [incidents, setIncidents] = React.useState<SystemIncident[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  
  React.useEffect(() => {
    fetchIncidents();
  }, []);
  
  React.useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchIncidents();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  async function fetchIncidents() {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents?status=open,acknowledged,investigating');
      const data = await res.json();
      
      const sorted = data.sort((a: SystemIncident, b: SystemIncident) => {
        const slaA = calculateSLAStatus(a);
        const slaB = calculateSLAStatus(b);
        
        if (slaA.isOverdue && !slaB.isOverdue) return -1;
        if (!slaA.isOverdue && slaB.isOverdue) return 1;
        
        return slaA.hoursLeft - slaB.hoursLeft;
      });
      
      setIncidents(sorted);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function getSeverityColor(severity: string): string {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  }
  
  function getStatusIcon(status: string) {
    const icons = {
      open: <AlertCircle className="size-4 text-red-600" />,
      acknowledged: <Clock className="size-4 text-yellow-600" />,
      investigating: <RefreshCw className="size-4 text-blue-600" />,
      resolved: <CheckCircle2 className="size-4 text-green-600" />,
      closed: <XCircle className="size-4 text-gray-600" />,
    };
    return icons[status] || icons.open;
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">System Incidents</h2>
            <p className="text-sm text-gray-500 mt-1">
              {incidents.length} open incident{incidents.length !== 1 ? 's' : ''} • 
              Last refresh: {lastRefresh.toLocaleTimeString('cs-CZ')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-refresh (60s)
            </label>
            
            <button
              onClick={fetchIncidents}
              disabled={loading}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Incidents Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SLA Zbývá</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="size-12 text-green-500" />
                    <p className="text-sm text-gray-500">No open incidents</p>
                    <p className="text-xs text-gray-400">All systems operational</p>
                  </div>
                </td>
              </tr>
            ) : (
              incidents.map((incident) => {
                const sla = calculateSLAStatus(incident);
                
                return (
                  <tr 
                    key={incident.id}
                    className={`hover:bg-gray-50 transition-colors ${sla.isOverdue ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-900">{incident.id.slice(0, 8)}...</span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{incident.module_name}</span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <span className="text-sm text-gray-700 capitalize">{incident.status}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-semibold ${sla.statusColor}`}>
                          {formatSLATime(sla)}
                        </span>
                        {!sla.isOverdue && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                sla.percentRemaining < 25 ? 'bg-red-600' :
                                sla.percentRemaining < 50 ? 'bg-yellow-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${sla.percentRemaining}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 line-clamp-2">{incident.description}</span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {new Date(incident.created_at).toLocaleString('cs-CZ')}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Stats */}
      {incidents.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {incidents.filter(i => calculateSLAStatus(i).isOverdue).length}
              </div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {incidents.filter(i => {
                  const sla = calculateSLAStatus(i);
                  return !sla.isOverdue && sla.hoursLeft < 1;
                }).length}
              </div>
              <div className="text-xs text-gray-600">Critical (&lt;1h)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {incidents.filter(i => {
                  const sla = calculateSLAStatus(i);
                  return !sla.isOverdue && sla.percentRemaining < 50 && sla.hoursLeft >= 1;
                }).length}
              </div>
              <div className="text-xs text-gray-600">Warning (&lt;50%)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {incidents.filter(i => {
                  const sla = calculateSLAStatus(i);
                  return !sla.isOverdue && sla.percentRemaining >= 50;
                }).length}
              </div>
              <div className="text-xs text-gray-600">OK (&gt;50%)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ================================================================
 * CI/CD DASHBOARD COMPONENTS
 * ================================================================
 */

/**
 * CICDRunLog Type (from Schema)
 */
interface CICDRunLog {
  id: string;
  build_id: string;
  branch: string;
  commit_hash: string;
  commit_message: string;
  status: 'success' | 'failed' | 'in_progress' | 'cancelled';
  build_time: number;
  started_at: string;
  finished_at: string;
  deployed_by: string;
  environment: 'production' | 'staging' | 'development';
  version: string;
  logs_url?: string;
}

/**
 * CICDDashboard Component (v3.8.1)
 * Administrative dashboard displaying CI/CD pipeline runs with build status.
 * Governance Note: CI/CD run logs integration added — v3.8.1
 */
export const CICDDashboard: React.FC = () => {
  const [runs, setRuns] = React.useState<CICDRunLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [branchFilter, setBranchFilter] = React.useState<string>('all');
  
  React.useEffect(() => {
    fetchRuns();
  }, [branchFilter]);
  
  React.useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchRuns();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, branchFilter]);
  
  async function fetchRuns() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '10' });
      if (branchFilter !== 'all') {
        params.append('branch', branchFilter);
      }
      
      const res = await fetch(`/api/cicd-runs?${params}`);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      setRuns(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch CI/CD runs:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function getStatusColor(status: string): string {
    const colors = {
      success: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }
  
  function getStatusIcon(status: string) {
    const icons = {
      success: <CheckCircle2 className="size-4 text-green-600" />,
      failed: <XCircle className="size-4 text-red-600" />,
      in_progress: <Clock className="size-4 text-yellow-600 animate-pulse" />,
      cancelled: <XCircle className="size-4 text-gray-600" />,
    };
    return icons[status] || icons.in_progress;
  }
  
  function getEnvironmentBadge(env: string): string {
    const badges = {
      production: 'bg-blue-100 text-blue-700 border-blue-200',
      staging: 'bg-purple-100 text-purple-700 border-purple-200',
      development: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return badges[env] || 'bg-gray-100 text-gray-700';
  }
  
  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">CI/CD Pipeline Runs</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {runs.length} recent deployment{runs.length !== 1 ? 's' : ''} • 
              Last refresh: {lastRefresh.toLocaleTimeString('cs-CZ')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All branches</option>
              <option value="main">main</option>
              <option value="staging">staging</option>
              <option value="development">development</option>
            </select>
            
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-refresh
            </label>
            
            <button
              onClick={fetchRuns}
              disabled={loading}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Build ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Environment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Version</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Finished</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {loading && runs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="size-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500">Loading CI/CD runs...</p>
                  </div>
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="size-12 text-gray-400" />
                    <p className="text-sm text-gray-500">No CI/CD runs found</p>
                  </div>
                </td>
              </tr>
            ) : (
              runs.map((run, idx) => (
                <tr 
                  key={run.id}
                  className={`hover:bg-gray-50 transition-colors ${idx === 0 ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">{run.build_id}</span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="size-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{run.branch}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-mono text-gray-900">{run.commit_hash}</span>
                      <span className="text-xs text-gray-500 line-clamp-1">{run.commit_message}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(run.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(run.status)}`}>
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getEnvironmentBadge(run.environment)}`}>
                      {run.environment}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{formatDuration(run.build_time)}</span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{run.version}</span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {new Date(run.finished_at).toLocaleString('cs-CZ')}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    {run.logs_url && (
                      <a
                        href={run.logs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        <ExternalLink className="size-4" />
                        Logs
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {runs.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {runs.filter(r => r.status === 'success').length}
              </div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {runs.filter(r => r.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {runs.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {runs.length > 0 
                  ? Math.round(runs.reduce((sum, r) => sum + r.build_time, 0) / runs.length)
                  : 0}s
              </div>
              <div className="text-xs text-gray-600">Avg Build Time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
