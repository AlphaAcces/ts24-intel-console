import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { removeView, clearSavedViews } from '../../store/userPreferencesSlice';

export const SavedViewsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const saved = useSelector((s: RootState) => s.userPreferences.savedViews);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gemte visninger</h2>
      {saved.length === 0 ? (
        <p className="text-gray-400">Ingen gemte visninger.</p>
      ) : (
        <ul className="space-y-2">
          {saved.map(sv => (
            <li key={sv.id} className="flex items-center justify-between p-3 bg-component-dark/60 rounded">
              <div>
                <div className="font-medium">{sv.payload.label ?? sv.payload.view}</div>
                <div className="text-sm text-gray-400">{(sv.payload.breadcrumbs || []).join(' › ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => dispatch(removeView(sv.id))} className="text-sm px-2 py-1 rounded bg-red-600/80">Slet</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {saved.length > 0 && (
        <div className="mt-4">
          <button onClick={() => dispatch(clearSavedViews())} className="px-3 py-2 rounded bg-red-700">Slet alle</button>
        </div>
      )}
    </div>
  );
};

export default SavedViewsPage;
