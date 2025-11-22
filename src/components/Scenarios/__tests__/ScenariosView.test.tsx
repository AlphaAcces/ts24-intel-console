import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import ScenariosView from '../ScenariosView';
import '../../../i18n';
import type { Scenario, ActionItem } from '../../../types';

vi.mock('../../../context/DataContext', () => {
  const scenariosData: Scenario[] = [
    {
      id: 'test-scenario',
      name: 'Best Case',
      category: 'Best',
      description: 'desc',
      assumptions: ['A'],
      expectedOutcome: 'Outcome',
      probability: 'Middel',
      impact: 'Høj',
      linkedActions: ['A1'],
    },
  ];

  const actionsData: ActionItem[] = [
    {
      id: 'A1',
      title: 'Do thing',
      category: 'Finansiel',
      priority: 'Høj',
      description: 'Desc',
      evidenceType: 'Memo',
      status: 'Ikke startet',
    },
  ];

  return {
    useCaseData: () => ({ scenariosData, actionsData }),
  };
});

const { generateGeminiContentMock, getGeminiApiKeyMock } = vi.hoisted(() => ({
  generateGeminiContentMock: vi.fn(),
  getGeminiApiKeyMock: vi.fn(),
}));

vi.mock('../../../lib/ai', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/ai')>('../../../lib/ai');
  return {
    ...actual,
    getGeminiApiKey: getGeminiApiKeyMock,
    generateGeminiContent: (...args: Parameters<typeof actual.generateGeminiContent>) =>
      generateGeminiContentMock(...args),
  };
});

describe('ScenariosView AI fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows fallback message when API key is missing', async () => {
    getGeminiApiKeyMock.mockReturnValue(undefined);
    render(<ScenariosView />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /kør ai-analyse/i }));
    });

    expect(await screen.findByText(/AI-modulet er ikke aktiveret/i)).toBeInTheDocument();
    expect(generateGeminiContentMock).not.toHaveBeenCalled();
  });

  it('runs analysis when API key exists', async () => {
    getGeminiApiKeyMock.mockReturnValue('fake-key');
    generateGeminiContentMock.mockResolvedValue('analysis result');
    render(<ScenariosView />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /kør ai-analyse/i }));
    });

    await waitFor(() => {
      expect(generateGeminiContentMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/analysis result/i)).toBeInTheDocument();
  });
});
