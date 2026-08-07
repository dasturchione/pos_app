import type { AppConfig } from '@shared/appConfig';
import { NavLink } from 'react-router-dom';

interface Props {
  config: AppConfig;
}

export function HomePage({ config }: Props) {
  return (
    <>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Bosh sahifa
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          Sozlamalar
        </NavLink>
      </nav>
      <div className="page">
        <h1>PosApp</h1>
        <div className="card">
          <p>
            <strong>Rejim:</strong>{' '}
            {config.mode === 'SERVER_AND_POS' ? 'Kassa + server' : 'Faqat kassa'}
          </p>
          {config.mode === 'SERVER_AND_POS' && (
            <p className="muted">
              Lokal API: <code>http://127.0.0.1:{config.serverPort}</code> (health: /api/health)
            </p>
          )}
          {config.mode === 'POS_ONLY' && (
            <p className="muted">
              Ulangan server: <code>{config.serverHostUrl}</code>
            </p>
          )}
        </div>
        <div className="card">
          <p className="muted">Sinxron test: navbatga yozish va yuborish</p>
          <div className="row">
            <button
              type="button"
              className="btn"
              onClick={() => void window.posapp?.enqueueTestOutbox()}
            >
              Test outbox qo‘shish
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void window.posapp?.syncNow()}
            >
              Sinxronlashtirish
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
