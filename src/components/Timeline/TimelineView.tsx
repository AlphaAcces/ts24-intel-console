import React, { useEffect, useMemo, useState } from 'react';
import { useEnrichedCaseData, useCaseData } from '../../context/DataContext';
import { TimelineEvent, Scenario } from '../../types';
import { TimelineEventCard } from './TimelineEventCard';
import { useTranslation } from 'react-i18next';
import { fetchScenarioAnalysisRealtime } from '../../domains/scenarios/api/scenarioAnalysisApi';
import {
    subscribeToScenarioAnalysis,
    type ScenarioAnalysisResult,
} from '../../domains/scenarios/services/aiScenarioAnalysisService';

const FILTER_CONFIG = [
    { key: 'all', eventTypes: [] as TimelineEvent['type'][] },
    { key: 'structure', eventTypes: ['Etablering', 'Struktur'] as TimelineEvent['type'][] },
    { key: 'financial', eventTypes: ['Finansiel', 'Regnskab'] as TimelineEvent['type'][] },
    { key: 'address', eventTypes: ['Adresse'] as TimelineEvent['type'][] },
    { key: 'operational', eventTypes: ['Operationel'] as TimelineEvent['type'][] },
    { key: 'compliance', eventTypes: ['Compliance'] as TimelineEvent['type'][] },
] as const;

type FilterKey = typeof FILTER_CONFIG[number]['key'];

const AI_TIMELINE_SOURCE = 'AI Scenario Engine';

const extractAnalysisSummary = (result: ScenarioAnalysisResult): string => {
    const sectionWithContent = result.sections.find(section => section.paragraphs.length > 0 || section.bullets.length > 0);
    if (sectionWithContent) {
        return sectionWithContent.paragraphs[0] ?? sectionWithContent.bullets[0] ?? '';
    }

    const fallbackLine = result.rawText
        .split(/\r?\n/)
        .map(line => line.replace(/^[-*•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim())
        .find(Boolean);

    return fallbackLine ?? '';
};

const mapResultToTimelineEvent = (
    scenario: Scenario,
    result: ScenarioAnalysisResult,
    translate: (key: string, options?: Record<string, unknown>) => string,
): TimelineEvent => {
    const summary = extractAnalysisSummary(result);
    const title = translate('timeline.aiAnalysis.title', {
        name: scenario.name,
        defaultValue: `AI-analyse · ${scenario.name}`,
    });

    return {
        date: result.generatedAt ?? new Date().toISOString(),
        type: 'Operationel',
        title,
        description:
            summary ||
            translate('timeline.aiAnalysis.summaryFallback', {
                defaultValue: 'AI-analysen blev opdateret.',
            }),
        source: AI_TIMELINE_SOURCE,
        sourceId: `ai-analysis-${scenario.id}`,
        isCritical: scenario.impact === 'Ekstrem' || scenario.category === 'Worst' || scenario.category === 'Exit',
        linkedViews: ['scenarios', 'timeline'],
        linkedActions: scenario.linkedActions,
    };
};

export const TimelineView: React.FC = () => {
    const { timelineData } = useEnrichedCaseData();
    const { scenariosData, actionsData } = useCaseData();
    const { t } = useTranslation();
    const [aiEventsByScenario, setAiEventsByScenario] = useState<Record<string, TimelineEvent>>({});

    useEffect(() => {
        let isCancelled = false;

        // Remove stale AI events when scenarios change
        setAiEventsByScenario(prev => {
            const next: Record<string, TimelineEvent> = {};
            scenariosData.forEach(scenario => {
                if (prev[scenario.id]) {
                    next[scenario.id] = prev[scenario.id];
                }
            });
            return next;
        });

        const loadInitialAnalyses = async () => {
            const responses = await Promise.all(
                scenariosData.map(async scenario => {
                    try {
                        const response = await fetchScenarioAnalysisRealtime(scenario, actionsData);
                        if (response.status === 200 && response.data) {
                            return { scenario, result: response.data };
                        }
                    } catch (error) {
                        console.error('AI timeline fetch failed', error);
                    }
                    return null;
                })
            );

            if (isCancelled) return;

            setAiEventsByScenario(prev => {
                const next = { ...prev };
                responses.forEach(entry => {
                    if (!entry) return;
                    next[entry.scenario.id] = mapResultToTimelineEvent(entry.scenario, entry.result, t);
                });
                return next;
            });
        };

        loadInitialAnalyses();

        const unsubscribe = subscribeToScenarioAnalysis(result => {
            if (isCancelled) return;
            const scenario = scenariosData.find(item => item.id === result.scenarioId);
            if (!scenario) return;

            setAiEventsByScenario(prev => ({
                ...prev,
                [scenario.id]: mapResultToTimelineEvent(scenario, result, t),
            }));
        });

        return () => {
            isCancelled = true;
            unsubscribe();
        };
    }, [actionsData, scenariosData, t]);

    const filters = useMemo(() => FILTER_CONFIG.map(config => ({
        ...config,
        label: t(`filters.${config.key}`),
    })), [t]);

    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    const aiTimelineEvents = useMemo(() => Object.values(aiEventsByScenario), [aiEventsByScenario]);

    const combinedTimelineEvents = useMemo(
        () => [...timelineData, ...aiTimelineEvents],
        [timelineData, aiTimelineEvents],
    );

    const filteredEvents = useMemo(() => {
        const sortedEvents = [...combinedTimelineEvents].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        if (activeFilter === 'all') return sortedEvents;
        const typesToMatch = FILTER_CONFIG.find(config => config.key === activeFilter)?.eventTypes ?? [];
        return sortedEvents.filter(event => typesToMatch.includes(event.type));
    }, [combinedTimelineEvents, activeFilter]);

    const groupedEvents = useMemo(() => {
        return filteredEvents.reduce((acc, event) => {
            const date = new Date(event.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });
            const key = `${year}-${month}`;

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(event);
            return acc;
        }, {} as Record<string, TimelineEvent[]>);
    }, [filteredEvents]);

    const sortedGroups = useMemo(() => Object.keys(groupedEvents).sort((a, b) => {
        const [yearA, monthA] = a.split('-');
        const [yearB, monthB] = b.split('-');
        const dateA = new Date(parseInt(yearA), new Date(`${monthA} 1`).getMonth());
        const dateB = new Date(parseInt(yearB), new Date(`${monthB} 1`).getMonth());
        return dateB.getTime() - dateA.getTime();
    }), [groupedEvents]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-200">{t('timeline.heading')}</h2>
                <div className="flex items-center space-x-2 bg-component-dark p-1 rounded-lg border border-border-dark self-start">
                    {filters.map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                activeFilter === filter.key
                                ? 'bg-accent-green/20 text-accent-green'
                                : 'text-gray-400 hover:bg-gray-700/50'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative border-l-2 border-border-dark ml-4">
                {sortedGroups.map(groupKey => {
                    const [year, month] = groupKey.split('-');
                    const events = groupedEvents[groupKey];
                    return (
                        <div key={groupKey} className="relative mb-8">
                            <div className="sticky top-16 z-10 -ml-[calc(1rem+1px)] mb-4">
                                <h3 className="pl-12 py-1 bg-base-dark/80 backdrop-blur-sm text-lg font-bold text-gray-300">
                                    {month} {year}
                                    <span className="text-xs font-mono text-gray-500 ml-2">{t('eventSummary', { count: events.length })}</span>
                                </h3>
                            </div>
                            <div className="pl-8 space-y-8">
                                {events.map((event, index) => (
                                    <TimelineEventCard key={`${event.date}-${index}`} event={event} />
                                ))}
                            </div>
                        </div>
                    );
                })}
                 {sortedGroups.length === 0 && (
                    <div className="pl-8 pt-4">
                        <p className="text-gray-500">{t('noEvents')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
