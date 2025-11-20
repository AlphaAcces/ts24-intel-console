import React from 'react';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import userPreferencesReducer, { saveView } from '../../../store/userPreferencesSlice';
import SavedViewsPage from '../SavedViewsPage';

describe('SavedViewsPage', () => {
  it('shows saved views and allows delete', async () => {
    const store = configureStore({ reducer: { userPreferences: userPreferencesReducer } });
    store.dispatch(saveView({ id: 'v1', payload: { view: 'dashboard', breadcrumbs: ['Dashboard'], label: 'My view' } }));

    render(
      <Provider store={store}>
        <SavedViewsPage />
      </Provider>
    );

    expect(screen.getByText('My view')).toBeInTheDocument();

    const deleteBtn = screen.getByText('Slet');
    await userEvent.click(deleteBtn);
    expect(screen.queryByText('My view')).not.toBeInTheDocument();
  });
});
