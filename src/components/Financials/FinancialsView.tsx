import React from 'react';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCaseData } from '../../context/DataContext';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../domains/settings/hooks';
import { palette } from '../../theme/palette';

const ChartCard: React.FC<{ title: string; children: React.ReactElement; }> = ({ title, children }) => (
  <div className="bg-component-dark p-6 rounded-lg border border-border-dark">
    <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

export const FinancialsView: React.FC = () => {
  const { financialData } = useCaseData();
  const { t } = useTranslation();
  const { formatCurrency, formatNumber, formatCompactNumber, formatPercent } = useFormatters();

  const thousandAbbrev = t('financials.units.thousandAbbrev');
  const naLabel = t('common.naShort');

  const formatCompactValue = (value: number) => {
    if (!Number.isFinite(value)) return naLabel;
    if (Math.abs(value) >= 1000) {
      return formatCompactNumber(value, { maximumFractionDigits: 1 });
    }
    return formatNumber(Math.round(value), { maximumFractionDigits: 0 });
  };

  const formatCurrencyValue = (value: number) => formatCurrency(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const formatNumberValue = (value: number) => formatNumber(value, { maximumFractionDigits: 0 });
  const formatPercentValue = (value: number) => formatPercent(value / 100, { maximumFractionDigits: 1 });

  const chartColors = {
    grid: 'var(--color-border-subtle)',
    axis: palette.textMuted,
    tooltipBg: 'var(--color-surface)',
    tooltipBorder: '1px solid var(--color-border)',
    grossProfit: palette.info,
    ebit: palette.warning,
    netResult: palette.success,
    equity: palette.info,
    solidity: palette.gold,
    productivity: palette.warning,
  } as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('financials.table.title')}</h2>
        <div className="bg-component-dark border border-border-dark rounded-lg overflow-x-auto scrollbar-hidden">
          <table className="min-w-full divide-y divide-border-dark">
            <thead style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.year')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.grossProfit')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.ebit')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.netResult')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.equity')}</th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.staff')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.ebitMargin')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.netMargin')}</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">{t('financials.table.headers.resultPerEmployee')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark font-mono">
              {financialData.map((d) => (
                <tr key={d.year} className="hover:bg-[var(--color-surface-hover)]">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text)]">{d.year}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-text-muted">{formatNumberValue(d.revenueOrGrossProfit)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-[var(--color-warning)]">{d.ebit ? formatNumberValue(d.ebit) : naLabel}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-[var(--color-success)]">{formatNumberValue(d.profitAfterTax)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-[var(--color-info)]">{formatNumberValue(d.equityEndOfYear)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-text-muted">{d.staffCount}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-[var(--color-warning)]">{d.ebitMargin ? formatPercentValue(d.ebitMargin) : naLabel}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-[var(--color-success)]">{d.netMargin ? formatPercentValue(d.netMargin) : naLabel}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-text-muted">{d.profitPerEmployee ? formatNumberValue(d.profitPerEmployee) : naLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">{t('financials.charts.sectionTitle')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title={t('financials.charts.result.title')}>
            <AreaChart data={financialData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="year" stroke={chartColors.axis} />
              <YAxis tickFormatter={formatCompactValue} stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: chartColors.tooltipBg, border: chartColors.tooltipBorder, color: palette.text }}
                formatter={(value: number) => formatCurrencyValue(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenueOrGrossProfit"
                name={t('financials.charts.result.series.grossProfit')}
                stroke={chartColors.grossProfit}
                fill={chartColors.grossProfit}
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="ebit"
                name={t('financials.charts.result.series.ebit')}
                stroke={chartColors.ebit}
                fill={chartColors.ebit}
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="profitAfterTax"
                name={t('financials.charts.result.series.netResult')}
                stroke={chartColors.netResult}
                fill={chartColors.netResult}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartCard>

          <ChartCard title={t('financials.charts.equity.title')}>
            <AreaChart data={financialData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="year" stroke={chartColors.axis} />
              <YAxis yAxisId="left" tickFormatter={formatCompactValue} stroke={chartColors.axis} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value: number) => formatPercentValue(value)} stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{ backgroundColor: chartColors.tooltipBg, border: chartColors.tooltipBorder, color: palette.text }}
                formatter={(value: number, _name: string, entry) => (entry && (entry as { dataKey?: string }).dataKey === 'solidity' ? formatPercentValue(value) : formatCurrencyValue(value))}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="equityEndOfYear"
                name={t('financials.charts.equity.series.equity')}
                stroke={chartColors.equity}
                fill={chartColors.equity}
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="solidity"
                name={t('financials.charts.equity.series.solidity')}
                stroke={chartColors.solidity}
                strokeWidth={2}
                dot={{ r: 4, fill: chartColors.solidity, stroke: palette.background }}
              />
            </AreaChart>
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title={t('financials.charts.productivity.title')}>
              <BarChart data={financialData.filter(d => d.staffCount > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="year" stroke={chartColors.axis} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)} ${thousandAbbrev}`} stroke={chartColors.axis} />
                <Tooltip
                  contentStyle={{ backgroundColor: chartColors.tooltipBg, border: chartColors.tooltipBorder, color: palette.text }}
                  formatter={(value: number) => formatCurrencyValue(value)}
                />
                <Legend />
                <Bar dataKey="profitPerEmployee" name={t('financials.charts.productivity.series.profitPerEmployee')} fill={chartColors.productivity} />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      </div>

      <div className="bg-component-dark p-6 rounded-lg border border-border-dark">
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{t('financials.analysis.title')}</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-muted">
          <li><span className="font-semibold text-[var(--color-warning)]">{t('financials.analysis.points.marginPressure.title')}</span> {t('financials.analysis.points.marginPressure.body')}</li>
          <li><span className="font-semibold text-[var(--color-danger)]">{t('financials.analysis.points.productivityDrop.title')}</span> {t('financials.analysis.points.productivityDrop.body')}</li>
          <li><span className="font-semibold text-[var(--color-success)]">{t('financials.analysis.points.capitalization.title')}</span> {t('financials.analysis.points.capitalization.body')}</li>
          <li><span className="font-semibold text-accent-gold">{t('financials.analysis.points.liquidityRisk.title')}</span> {t('financials.analysis.points.liquidityRisk.body')}</li>
        </ul>
      </div>
    </div>
  );
};
