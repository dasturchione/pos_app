import type { HardwareSettingsV1 } from '@shared/hardwareSettings';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

export function SettingsPage() {
  const api = window.posapp!;
  const [hw, setHw] = useState<HardwareSettingsV1 | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void api.getHardwareSettings().then(setHw);
  }, [api]);

  if (!hw) {
    return (
      <>
        <nav className="nav">
          <NavLink to="/">Bosh sahifa</NavLink>
          <NavLink to="/settings" className="active">
            Sozlamalar
          </NavLink>
        </nav>
        <div className="page">
          <p>Yuklanmoqda…</p>
        </div>
      </>
    );
  }

  async function save() {
    await api.saveHardwareSettings(hw);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <nav className="nav">
        <NavLink to="/">Bosh sahifa</NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          Sozlamalar
        </NavLink>
      </nav>
      <div className="page">
        <h1>Sozlamalar</h1>
        {saved && <p className="muted">Saqlandi.</p>}

        <div className="card">
          <h2>Printer (thermal / X printer)</h2>
          <div className="stack">
            <label>
              <input
                type="checkbox"
                checked={hw.printer.enabled}
                onChange={(e) =>
                  setHw({ ...hw, printer: { ...hw.printer, enabled: e.target.checked } })
                }
              />{' '}
              Yoqilgan
            </label>
          </div>
          <div className="stack">
            <label htmlFor="pname">Nomi</label>
            <input
              id="pname"
              className="field"
              value={hw.printer.name}
              onChange={(e) => setHw({ ...hw, printer: { ...hw.printer, name: e.target.value } })}
            />
          </div>
          <div className="stack">
            <label htmlFor="pconn">Ulanish</label>
            <select
              id="pconn"
              className="field"
              value={hw.printer.connection}
              onChange={(e) =>
                setHw({
                  ...hw,
                  printer: {
                    ...hw.printer,
                    connection: e.target.value as HardwareSettingsV1['printer']['connection'],
                  },
                })
              }
            >
              <option value="usb">USB</option>
              <option value="network">Tarmoq (IP:port)</option>
              <option value="com">COM</option>
            </select>
          </div>
          <div className="stack">
            <label htmlFor="paddr">Manzil (COM yoki IP:port)</label>
            <input
              id="paddr"
              className="field"
              value={hw.printer.address}
              onChange={(e) => setHw({ ...hw, printer: { ...hw.printer, address: e.target.value } })}
            />
          </div>
          <div className="stack">
            <label htmlFor="pwidth">Qog‘oz kengligi (mm)</label>
            <input
              id="pwidth"
              className="field"
              type="number"
              value={hw.printer.paperWidthMm}
              onChange={(e) =>
                setHw({ ...hw, printer: { ...hw.printer, paperWidthMm: Number(e.target.value) } })
              }
            />
          </div>
        </div>

        <div className="card">
          <h2>Lazer skaner</h2>
          <div className="stack">
            <label>
              <input
                type="checkbox"
                checked={hw.scanner.enabled}
                onChange={(e) =>
                  setHw({ ...hw, scanner: { ...hw.scanner, enabled: e.target.checked } })
                }
              />{' '}
              Yoqilgan
            </label>
          </div>
          <div className="stack">
            <label htmlFor="smode">Rejim</label>
            <select
              id="smode"
              className="field"
              value={hw.scanner.mode}
              onChange={(e) =>
                setHw({
                  ...hw,
                  scanner: {
                    ...hw.scanner,
                    mode: e.target.value as HardwareSettingsV1['scanner']['mode'],
                  },
                })
              }
            >
              <option value="keyboard_wedge">Klaviatura (keyboard wedge)</option>
              <option value="serial">Serial / COM</option>
              <option value="camera">Kamera</option>
            </select>
          </div>
          {hw.scanner.mode === 'serial' && (
            <>
              <div className="stack">
                <label htmlFor="sport">COM port</label>
                <input
                  id="sport"
                  className="field"
                  value={hw.scanner.comPort ?? ''}
                  onChange={(e) =>
                    setHw({ ...hw, scanner: { ...hw.scanner, comPort: e.target.value } })
                  }
                />
              </div>
              <div className="stack">
                <label htmlFor="sbaud">Baud rate</label>
                <input
                  id="sbaud"
                  className="field"
                  type="number"
                  value={hw.scanner.baudRate ?? 9600}
                  onChange={(e) =>
                    setHw({ ...hw, scanner: { ...hw.scanner, baudRate: Number(e.target.value) } })
                  }
                />
              </div>
            </>
          )}
          {hw.scanner.mode === 'camera' && (
            <>
              <div className="stack">
                <label htmlFor="sfps">Frame rate (FPS)</label>
                <input
                  id="sfps"
                  className="field"
                  type="number"
                  value={hw.scanner.cameraFrameRate ?? 30}
                  onChange={(e) =>
                    setHw({
                      ...hw,
                      scanner: { ...hw.scanner, cameraFrameRate: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="stack">
                <label htmlFor="sres">Ruxsat (masalan 1280x720)</label>
                <input
                  id="sres"
                  className="field"
                  value={hw.scanner.cameraResolution ?? ''}
                  onChange={(e) =>
                    setHw({ ...hw, scanner: { ...hw.scanner, cameraResolution: e.target.value } })
                  }
                />
              </div>
            </>
          )}
          <div className="stack">
            <label htmlFor="sterm">Terminator (serial)</label>
            <input
              id="sterm"
              className="field"
              value={hw.scanner.terminator ?? ''}
              onChange={(e) =>
                setHw({ ...hw, scanner: { ...hw.scanner, terminator: e.target.value } })
              }
            />
          </div>
        </div>

        <div className="card">
          <h2>Tarozilar</h2>
          <div className="stack">
            <label>
              <input
                type="checkbox"
                checked={hw.scale.enabled}
                onChange={(e) => setHw({ ...hw, scale: { ...hw.scale, enabled: e.target.checked } })}
              />{' '}
              Yoqilgan
            </label>
          </div>
          <div className="stack">
            <label htmlFor="scmodel">Model</label>
            <input
              id="scmodel"
              className="field"
              value={hw.scale.model}
              onChange={(e) => setHw({ ...hw, scale: { ...hw.scale, model: e.target.value } })}
            />
          </div>
          <div className="stack">
            <label htmlFor="scport">COM port</label>
            <input
              id="scport"
              className="field"
              value={hw.scale.comPort}
              onChange={(e) => setHw({ ...hw, scale: { ...hw.scale, comPort: e.target.value } })}
            />
          </div>
          <div className="stack">
            <label htmlFor="scbaud">Baud rate</label>
            <input
              id="scbaud"
              className="field"
              type="number"
              value={hw.scale.baudRate}
              onChange={(e) =>
                setHw({ ...hw, scale: { ...hw.scale, baudRate: Number(e.target.value) } })
              }
            />
          </div>
          <div className="stack">
            <label htmlFor="prefix">Prefix</label>
            <input
              id="prefix"
              className="field"
              value={hw.scale.prefix}
              onChange={(e) => setHw({ ...hw, scale: { ...hw.scale, prefix: e.target.value } })}
            />
          </div>
          <div className="stack">
            <label htmlFor="suffix">Suffix</label>
            <input
              id="suffix"
              className="field"
              value={hw.scale.suffix}
              onChange={(e) => setHw({ ...hw, scale: { ...hw.scale, suffix: e.target.value } })}
            />
          </div>
          <div className="stack">
            <label htmlFor="unit">Birlik</label>
            <select
              id="unit"
              className="field"
              value={hw.scale.unit}
              onChange={(e) =>
                setHw({
                  ...hw,
                  scale: { ...hw.scale, unit: e.target.value as HardwareSettingsV1['scale']['unit'] },
                })
              }
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => void save()}>
          Saqlash
        </button>
      </div>
    </>
  );
}
