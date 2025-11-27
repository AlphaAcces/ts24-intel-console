import React from 'react';
import { ShieldAlert, AlertTriangle, Landmark } from 'lucide-react';
import { ExecutiveCard } from './ExecutiveCard';
import { Tag } from '../Shared/Tag';
import type { RiskCardViewModel } from '../../domains/executive/types';

interface RiskOverviewCardProps {
  data: RiskCardViewModel;
}

export const RiskOverviewCard: React.FC<RiskOverviewCardProps> = ({ data }) => (
  <ExecutiveCard
    icon={<ShieldAlert className="w-5 h-5" />}
    title={data.title}
    subtitle={data.subtitle}
    tone="critical"
    meta={<Tag label={data.metaTag.label} color={data.metaTag.color} />}
    delay={1}
  >
    <div className="bg-gray-900/40 border border-border-dark/50 rounded-lg p-4 space-y-3 text-sm text-gray-300">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <div>
          <p className="font-semibold text-gray-100">{data.taxCaseLabel}</p>
          <p className="text-xs text-gray-400">{data.taxCaseValue}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Landmark className="w-4 h-4 text-yellow-400" />
        <div>
          <p className="font-semibold text-gray-100">{data.complianceLabel}</p>
          <p className="text-xs text-gray-400">{data.compliance}</p>
        </div>
      </div>
      {data.redFlags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-[0.18em] mb-1">{data.metaTag.label}</p>
          <ul className="space-y-2 text-xs text-gray-400 list-disc list-inside">
            {data.redFlags.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {data.riskScores.length > 0 && (
      <div className="grid grid-cols-1 gap-3 mt-4">
        {data.riskScores.map(score => (
          <div
            key={score.category}
            className="flex items-start justify-between bg-gray-900/40 border border-border-dark/50 rounded-lg p-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-100">{score.category}</p>
              <p className="text-xs text-gray-400 mt-1">{score.justification}</p>
            </div>
            <Tag label={score.tag.label} color={score.tag.color} />
          </div>
        ))}
      </div>
    )}
  </ExecutiveCard>
);
