import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { SectionHeading } from '../Shared/SectionHeading';

interface ExecutiveSummaryHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  exportLabel: string;
  exportingLabel: string;
  timelineLabel: string;
  isExporting: boolean;
  onExport: () => void;
  onTimeline: () => void;
}

export const ExecutiveSummaryHeader: React.FC<ExecutiveSummaryHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  exportLabel,
  exportingLabel,
  timelineLabel,
  isExporting,
  onExport,
  onTimeline,
}) => (
  <SectionHeading
    icon={<Briefcase className="w-5 h-5 text-gray-400" />}
    eyebrow={eyebrow}
    title={title}
    subtitle={subtitle}
    actions={[
      <button
        key="export"
        onClick={onExport}
        disabled={isExporting}
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-accent-blue/40 bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? exportingLabel : exportLabel}
      </button>,
      <button
        key="timeline"
        onClick={onTimeline}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30 transition-colors inline-flex items-center gap-2"
      >
        <span>{timelineLabel}</span>
        <ArrowRight className="w-3 h-3" />
      </button>,
    ]}
  />
);
