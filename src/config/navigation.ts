import React from 'react';
import {
  LayoutDashboard,
  User,
  Building2,
  BarChart3,
  TestTube2,
  Banknote,
  Factory,
  GanttChart,
  ShieldAlert,
  ListChecks,
  Users,
  Route,
  FileText,
  Network,
  FolderLock,
  KeyRound,
  Briefcase,
  Globe,
  AlertTriangle,
  Database
} from 'lucide-react';
import { NavItemConfig, Subject, View } from '../types';

/**
 * Navigation Configuration - Intel24 Redesign
 *
 * Business (Company) Menu Structure:
 * - CORE: Dashboard, Executive Summary
 * - ANALYSIS: Person & Network, Companies, Financials, Hypotheses, Cashflow & DSO, Sector Analysis
 * - OPERATIONS: Counterparties, Scenarios
 * - RISK & ACTIONS: Timeline, Risk Heatmap, Actions
 * - INTEL: Intel Vault
 * - ADMIN: Access Requests
 *
 * Personal Menu Structure:
 * - CORE: Dashboard, Personal Profile
 * - ANALYSIS: Person & Network
 * - RISK & ACTIONS: Timeline, Risk Heatmap, Actions
 * - INTEL: Intel Vault
 */

export interface NavSection {
  key: string;
  label?: string;
  i18nKey?: string;
  items: View[];
  collapsible?: boolean;
}

export interface PlaceholderItem {
  id: string;
  label: string;
  i18nKey?: string;
  icon: React.ReactElement;
  showFor: Subject[];
  section: string;
}

// Section definitions per subject type
export const NAV_SECTIONS: Record<Subject, NavSection[]> = {
  tsl: [
    { key: 'core', items: ['dashboard', 'executive'] },
    { key: 'analysis', label: 'ANALYSIS', i18nKey: 'nav.sections.analysis', items: ['person', 'companies', 'financials', 'hypotheses', 'cashflow', 'sector'], collapsible: true },
    { key: 'operations', label: 'OPERATIONS', i18nKey: 'nav.sections.operations', items: ['counterparties', 'scenarios'], collapsible: true },
    { key: 'riskActions', label: 'RISK & ACTIONS', i18nKey: 'nav.sections.riskActions', items: ['timeline', 'risk', 'actions'], collapsible: true },
    { key: 'intel', label: 'INTEL', i18nKey: 'nav.sections.intel', items: ['vault'], collapsible: false },
    { key: 'admin', label: 'ADMIN', i18nKey: 'nav.sections.admin', items: ['accessRequests'], collapsible: false },
  ],
  umit: [
    { key: 'core', items: ['dashboard', 'personal'] },
    { key: 'analysis', label: 'ANALYSIS', i18nKey: 'nav.sections.analysis', items: ['person'], collapsible: true },
    { key: 'riskActions', label: 'RISK & ACTIONS', i18nKey: 'nav.sections.riskActions', items: ['timeline', 'risk', 'actions'], collapsible: true },
    { key: 'intel', label: 'INTEL', i18nKey: 'nav.sections.intel', items: ['vault'], collapsible: false },
    { key: 'admin', label: 'ADMIN', i18nKey: 'nav.sections.admin', items: ['accessRequests'], collapsible: false },
  ],
};

// Placeholder items for features coming soon
export const PLACEHOLDER_ITEMS: PlaceholderItem[] = [
  {
    id: 'marketIntel',
    label: 'Market Intelligence',
    i18nKey: 'nav.placeholders.marketIntel',
    icon: React.createElement(Globe, { className: "h-5 w-5" }),
    showFor: ['tsl'],
    section: 'analysis'
  },
  {
    id: 'portfolioAnalysis',
    label: 'Portfolio Analysis',
    i18nKey: 'nav.placeholders.portfolioAnalysis',
    icon: React.createElement(Briefcase, { className: "h-5 w-5" }),
    showFor: ['tsl'],
    section: 'analysis'
  },
  {
    id: 'alertCenter',
    label: 'Alert Center',
    i18nKey: 'nav.placeholders.alertCenter',
    icon: React.createElement(AlertTriangle, { className: "h-5 w-5" }),
    showFor: ['tsl', 'umit'],
    section: 'riskActions'
  },
  {
    id: 'dataExports',
    label: 'Data Exports',
    i18nKey: 'nav.placeholders.dataExports',
    icon: React.createElement(Database, { className: "h-5 w-5" }),
    showFor: ['tsl', 'umit'],
    section: 'intel'
  },
];

export const NAV_ITEMS: NavItemConfig[] = [
  // Core Navigation
  { id: 'dashboard',  label: 'Dashboard',  i18nKey: 'nav.dashboard',  icon: React.createElement(LayoutDashboard, { className: "h-5 w-5" }), showFor: ['tsl', 'umit'] },
  { id: 'business',   label: 'Business Overview',    i18nKey: 'nav.business',   icon: React.createElement(BarChart3, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'personal',   label: 'Personal Profile',     i18nKey: 'nav.personal',   icon: React.createElement(User, { className: "h-5 w-5" }),            showFor: ['umit'] },
  { id: 'executive',  label: 'Executive Summary', i18nKey: 'nav.executive', icon: React.createElement(FileText, { className: "h-5 w-5" }), showFor: ['tsl'] },

  // Analysis Section (Business only)
  { id: 'person',     label: 'Person & Network', i18nKey: 'nav.person', icon: React.createElement(Network, { className: "h-5 w-5" }),            showFor: ['tsl', 'umit'] },
  { id: 'companies',  label: 'Companies',  i18nKey: 'nav.companies',  icon: React.createElement(Building2, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'financials', label: 'Financials', i18nKey: 'nav.financials', icon: React.createElement(BarChart3, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'hypotheses', label: 'Hypotheses', i18nKey: 'nav.hypotheses', icon: React.createElement(TestTube2, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'cashflow',   label: 'Cashflow & DSO', i18nKey: 'nav.cashflow', icon: React.createElement(Banknote, { className: "h-5 w-5" }),        showFor: ['tsl'] },
  { id: 'sector',     label: 'Sector Analysis', i18nKey: 'nav.sector', icon: React.createElement(Factory, { className: "h-5 w-5" }),         showFor: ['tsl'] },

  // Operations Section (Business only)
  { id: 'counterparties', label: 'Counterparties', i18nKey: 'nav.counterparties', icon: React.createElement(Users, { className: "h-5 w-5" }),           showFor: ['tsl'] },
  { id: 'scenarios',  label: 'Scenarios',  i18nKey: 'nav.scenarios', icon: React.createElement(Route, { className: "h-5 w-5" }),           showFor: ['tsl'] },

  // Risk & Actions Section (Both)
  { id: 'timeline',   label: 'Timeline',    i18nKey: 'nav.timeline', icon: React.createElement(GanttChart, { className: "h-5 w-5" }),      showFor: ['tsl', 'umit'] },
  { id: 'risk',       label: 'Risk Heatmap', i18nKey: 'nav.risk', icon: React.createElement(ShieldAlert, { className: "h-5 w-5" }),     showFor: ['tsl', 'umit'] },
  { id: 'actions',    label: 'Actions', i18nKey: 'nav.actions', icon: React.createElement(ListChecks, { className: "h-5 w-5" }),      showFor: ['tsl', 'umit'] },

  // Intel Vault (Both)
  { id: 'vault',      label: 'Intel Vault', i18nKey: 'nav.vault', icon: React.createElement(FolderLock, { className: "h-5 w-5" }),      showFor: ['tsl', 'umit'] },

  // Admin/Settings (Both)
  { id: 'accessRequests', label: 'Access Requests', i18nKey: 'nav.accessRequests', icon: React.createElement(KeyRound, { className: "h-5 w-5" }), showFor: ['tsl', 'umit'] },

];
