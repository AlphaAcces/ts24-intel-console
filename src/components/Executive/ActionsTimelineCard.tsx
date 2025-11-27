import React from 'react';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { ExecutiveCard } from './ExecutiveCard';
import { Tag } from '../Shared/Tag';
import type { ActionsCardViewModel } from '../../domains/executive/types';

interface ActionsTimelineCardProps {
  data: ActionsCardViewModel;
}

export const ActionsTimelineCard: React.FC<ActionsTimelineCardProps> = ({ data }) => (
  <ExecutiveCard
    icon={<CalendarClock className="w-5 h-5" />}
    title={data.title}
    subtitle={data.subtitle}
    tone="warning"
    meta={
      <button
        onClick={data.onViewActions}
        className="text-xs text-accent-green hover:text-accent-green/80 inline-flex items-center gap-1"
      >
        {data.actionsCtaLabel} <ArrowRight className="w-3 h-3" />
      </button>
    }
    delay={2}
  >
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">
          {data.sectionLabels.upcomingDeadlines}
        </p>
        {data.sections.upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 text-xs">{data.noDeadlinesLabel}</p>
        ) : (
          <ul className="space-y-2">
            {data.sections.upcomingDeadlines.map(item => (
              <li key={item.id} className="bg-gray-900/40 border border-border-dark/40 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-medium">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <Tag label={item.priorityTag.label} color={item.priorityTag.color} />
                    {item.horizonTag && <Tag label={item.horizonTag.label} color={item.horizonTag.color} />}
                  </div>
                </div>
                {item.metaLine && <p className="text-xs text-gray-500">{item.metaLine}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">
          {data.sectionLabels.criticalEvents}
        </p>
        <ul className="space-y-2">
          {data.sections.criticalEvents.map(item => (
            <li key={item.id} className="bg-gray-900/40 border border-border-dark/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-200 font-medium">{item.title}</span>
                {item.dateLabel && <span className="text-[11px] font-mono text-red-300">{item.dateLabel}</span>}
              </div>
              {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">
          {data.sectionLabels.boardActionables}
        </p>
        <ul className="space-y-2">
          {data.sections.boardActionables.map(item => (
            <li key={item.id} className="bg-gray-900/40 border border-border-dark/40 rounded-lg p-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-200">{item.title}</p>
                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                {item.metaLine && <p className="text-xs text-gray-500 mt-2">{item.metaLine}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Tag label={item.priorityTag.label} color={item.priorityTag.color} />
                {item.horizonTag && <Tag label={item.horizonTag.label} color={item.horizonTag.color} />}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {data.sections.upcomingEvents.length > 0 && (
        <div className="bg-gray-900/40 border border-border-dark/50 rounded-lg p-3 text-xs text-gray-400">
          <p className="uppercase tracking-[0.18em] text-gray-500 mb-2">
            {data.sectionLabels.nextKeyEvents}
          </p>
          <ul className="space-y-2">
            {data.sections.upcomingEvents.map(item => (
              <li key={item.id} className="flex items-center justify-between">
                <span className="text-gray-300">{item.title}</span>
                {item.metaLine && <span className="font-mono text-gray-500">{item.metaLine}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </ExecutiveCard>
);
