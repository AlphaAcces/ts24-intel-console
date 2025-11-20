import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from '../LanguageToggle';
import i18n from '../../../i18n';

describe('LanguageToggle', () => {
  beforeEach(() => {
    i18n.changeLanguage('da');
  });

  it('toggles language between da and en', async () => {
    render(<LanguageToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('DA');
    await userEvent.click(btn);
    expect(i18n.language === 'en' || i18n.language.startsWith('en')).toBeTruthy();
    expect(btn).toHaveTextContent('EN');
  });
});
