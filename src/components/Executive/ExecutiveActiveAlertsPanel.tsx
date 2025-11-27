import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Tag } from '../Shared/Tag';
import type { ExecutiveAlertViewModel, TagColor } from '../../domains/executive/types';

interface ExecutiveActiveAlertsPanelProps {
  title: string;
  alerts: ExecutiveAlertViewModel[];
}

const severityIconClasses: Record<ExecutiveAlertViewModel['severity'], string> = {
  critical: 'text-red-400',
  error: 'text-orange-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

const tagColorMap: Record<TagColor, TagColor> = {
  red: 'red',
  yellow: 'yellow',
  blue: 'blue',
  green: 'green',
  gray: 'gray',
};

export const ExecutiveActiveAlertsPanel: React.FC<ExecutiveActiveAlertsPanelProps> = ({ title, alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
      <div className="flex items-center gap-2 font-semibold text-red-200 mb-3">
        <AlertTriangle className="w-5 h-5" />
        {title}
      </div>
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-start gap-3 bg-gray-900/40 border border-red-700/20 rounded-lg p-3">
            <div className={`flex-shrink-0 mt-0.5 ${severityIconClasses[alert.severity]}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-gray-100">{alert.title}</p>
              <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <Tag label={alert.severityLabel} color={tagColorMap[alert.severityColor]} />
                <Tag label={alert.categoryLabel} color="gray" />
                <span className="text-[10px] text-gray-500 font-mono">{alert.timestampLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
