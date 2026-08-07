import type { AppConfig } from '@shared/appConfig';
import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { SetupWizard } from './pages/SetupWizard';

function isElectronShell(): boolean {
  return /\bElectron\b/i.test(navigator.userAgent);
}

function Shell() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const api = window.posapp;
    if (!api) return;
    void api.getConfig().then(setConfig);
  }, []);

  if (!isElectronShell()) {
    return (
      <div className="page">
        <div className="card">
          <p>
            <strong>Siz brauzerda Vite sahifasini ochgansiz</strong> (masalan, localhost:5173).
          </p>
          <p className="muted">
            Bu yerda <code>window.posapp</code> bo‘lmaydi. Terminalda <code>npm run dev</code> ni ishga tushirib,
            ochilgan <strong>Electron (desktop)</strong> oynasidan foydalaning — havolani brauzerda emas.
          </p>
        </div>
      </div>
    );
  }

  if (!window.posapp) {
    return (
      <div className="page">
        <div className="card">
          <p>
            <strong>Electron ochilgan, lekin preload API ulanmagan.</strong>
          </p>
          <p className="muted">
            Terminalda xatolik bormi (preload yo‘li) tekshiring. Loyihani qayta build qiling:{' '}
            <code>npm run build</code>, keyin <code>npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="page">
        <p>Yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/setup"
          element={
            <SetupWizard
              initial={config}
              onSaved={(c) => {
                setConfig(c);
              }}
            />
          }
        />
        <Route
          path="/"
          element={
            config.setupCompleted ? (
              <HomePage config={config} />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            config.setupCompleted ? (
              <SettingsPage />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export function App() {
  return <Shell />;
}
