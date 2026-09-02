import { Toaster } from "sonner";
import AppRoutes from './routes/AppRoutes';
import type { AppDispatch, RootState } from './store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { hydrateFromStorage, fetchSystemSettings } from '@store/systemSettingsSlice';
import { SetupStatusProvider } from '@context/SetupStatusContext';

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage())
      .unwrap()
      .catch(() => null)
      .then(() => {
        if (token) {
          return dispatch(fetchSystemSettings(token)).unwrap().catch(() => null);
        }
      })
      .finally(() => {
        setHydrated(true);
      });
  }, [dispatch, token]);

  // Render branded loader while hydrating
  if (!hydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-200 border-t-purple-600" />
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">SAPAR ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SetupStatusProvider>
        <AppRoutes />
      </SetupStatusProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
