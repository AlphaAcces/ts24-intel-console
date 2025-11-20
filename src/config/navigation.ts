import React from 'react';
import { LayoutDashboard, User, Building2, BarChart3, TestTube2, Banknote, Factory, GanttChart, ShieldAlert, ListChecks, Users, Route } from 'lucide-react';
import { NavItemConfig } from '../types';

// FIX: Replaced JSX syntax with React.createElement to be valid in a .ts file.
// The original code used <Icon className="..." />, which is only supported in .tsx files.
export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard',  label: 'Dashboard',  i18nKey: 'nav.dashboard',  icon: React.createElement(LayoutDashboard, { className: "h-5 w-5" }), showFor: ['tsl', 'umit'] },
  { id: 'business',   label: 'Erhverv',    i18nKey: 'nav.business',   icon: React.createElement(BarChart3, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'personal',   label: 'Privat',     i18nKey: 'nav.personal',   icon: React.createElement(User, { className: "h-5 w-5" }),            showFor: ['umit'] },
  { id: 'executive',  label: 'Executive Summary', i18nKey: 'nav.executive', icon: React.createElement(LayoutDashboard, { className: "h-5 w-5" }), showFor: ['tsl'] },
  { id: 'person',     label: 'Person & Network', i18nKey: 'nav.person', icon: React.createElement(User, { className: "h-5 w-5" }),            showFor: ['tsl', 'umit'] },
  { id: 'companies',  label: 'Companies',  i18nKey: 'nav.companies',  icon: React.createElement(Building2, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'financials', label: 'Financials', i18nKey: 'nav.financials', icon: React.createElement(BarChart3, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'hypotheses', label: 'Hypotheses', i18nKey: 'nav.hypotheses', icon: React.createElement(TestTube2, { className: "h-5 w-5" }),       showFor: ['tsl'] },
  { id: 'cashflow',   label: 'Cashflow & DSO', i18nKey: 'nav.cashflow', icon: React.createElement(Banknote, { className: "h-5 w-5" }),        showFor: ['tsl'] },
  { id: 'sector',     label: 'Sector Analysis', i18nKey: 'nav.sector', icon: React.createElement(Factory, { className: "h-5 w-5" }),         showFor: ['tsl'] },
  { id: 'counterparties', label: 'Modparter', i18nKey: 'nav.counterparties', icon: React.createElement(Users, { className: "h-5 w-5" }),           showFor: ['tsl'] },
  { id: 'scenarios',  label: 'Scenarier',  i18nKey: 'nav.scenarios', icon: React.createElement(Route, { className: "h-5 w-5" }),           showFor: ['tsl'] },
  { id: 'timeline',   label: 'Timeline',    i18nKey: 'nav.timeline', icon: React.createElement(GanttChart, { className: "h-5 w-5" }),      showFor: ['tsl', 'umit'] },
  { id: 'risk',       label: 'Risk Heatmap', i18nKey: 'nav.risk', icon: React.createElement(ShieldAlert, { className: "h-5 w-5" }),     showFor: ['tsl', 'umit'] },
  { id: 'actions',    label: 'Actionables', i18nKey: 'nav.actions', icon: React.createElement(ListChecks, { className: "h-5 w-5" }),      showFor: ['tsl', 'umit'] },
  { id: 'saved-views', label: 'Saved Views', i18nKey: 'nav.savedViews', icon: React.createElement(Users, { className: "h-5 w-5" }), showFor: ['tsl', 'umit'] },
];
