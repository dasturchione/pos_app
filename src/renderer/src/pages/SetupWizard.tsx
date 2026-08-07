import type { AppConfig, AppMode } from '@shared/appConfig';
import { DEFAULT_SERVER_PORT } from '@shared/appConfig';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  initial: AppConfig;
  onSaved: (c: AppConfig) => void;
}

export function SetupWizard({ initial, onSaved }: Props) {
  const navigate = useNavigate();
  const api = window.posapp!;
  const [mode, setMode] = useState<AppMode>(initial.mode);
  const [shopName, setShopName] = useState(initial.shopName ?? '');
  const [serverPort, setServerPort] = useState(initial.serverPort || DEFAULT_SERVER_PORT);
  const [serverHostUrl, setServerHostUrl] = useState(
    initial.serverHostUrl || `http://127.0.0.1:${DEFAULT_SERVER_PORT}`,
  );
  const [lan, setLan] = useState<string[]>([]);
  const [fwMessage, setFwMessage] = useState<string | null>(null);

  useEffect(() => {
    void api.getLanAddresses().then(setLan);
  }, [api]);

  async function onFirewall() {
    const res = await api.applyFirewallRule(serverPort);
    setFwMessage(res.message);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: AppConfig = {
      ...initial,
      setupCompleted: true,
      mode,
      shopName,
      serverPort: Number(serverPort) || DEFAULT_SERVER_PORT,
      serverHostUrl:
        mode === 'POS_ONLY'
          ? serverHostUrl.replace(/\/$/, '')
          : `http://127.0.0.1:${Number(serverPort) || DEFAULT_SERVER_PORT}`,
    };
    await api.saveConfig(next);
    onSaved(next);
    navigate('/');
  }

  const serverUrlHint =
    lan.length > 0
      ? lan.map((ip) => `http://${ip}:${serverPort}`).join('  ·  ')
      : `http://<LAN-IP>:${serverPort}`;

  return (
    <div className="page">
      <h1>Birinchi sozlash</h1>
      <p className="muted">Kassa va server rolini tanlang. Keyin sozlamalarni o‘zgartirish mumkin.</p>

      <form className="card" onSubmit={onSubmit}>
        <div className="stack">
          <label htmlFor="shop">Do‘kon nomi (ixtiyoriy)</label>
          <input
            id="shop"
            className="field"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
        </div>

        <div className="stack">
          <span>Rejim</span>
          <div className="row">
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'SERVER_AND_POS'}
                onChange={() => setMode('SERVER_AND_POS')}
              />{' '}
              Kassa + server (master)
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'POS_ONLY'}
                onChange={() => setMode('POS_ONLY')}
              />{' '}
              Faqat kassa (serverga ulanadi)
            </label>
          </div>
        </div>

        {mode === 'SERVER_AND_POS' && (
          <>
            <div className="stack">
              <label htmlFor="port">Server port (TCP)</label>
              <input
                id="port"
                className="field"
                type="number"
                min={1024}
                max={65535}
                value={serverPort}
                onChange={(e) => setServerPort(Number(e.target.value))}
              />
              <p className="muted">Boshqa kassalar: {serverUrlHint}</p>
            </div>
            <div className="stack">
              <button type="button" className="btn" onClick={() => void onFirewall()}>
                Windows Firewall: portni ochish
              </button>
              {fwMessage && <p className="muted">{fwMessage}</p>}
              <p className="muted">
                Agar muvaffaqiyatsiz bo‘lsa, ilovani Administrator sifatida ishga tushiring yoki qo‘lda
                kiruvchi TCP qoidasini qo‘shing.
              </p>
            </div>
          </>
        )}

        {mode === 'POS_ONLY' && (
          <div className="stack">
            <label htmlFor="host">Server manzili</label>
            <input
              id="host"
              className="field"
              placeholder="http://192.168.1.10:3847"
              value={serverHostUrl}
              onChange={(e) => setServerHostUrl(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Saqlash va davom etish
        </button>
      </form>
    </div>
  );
}
