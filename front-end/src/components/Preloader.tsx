import { useEffect, useState } from 'react';

export function Preloader() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('los-pit-loaded'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    let minimumTimeElapsed = false;
    let heroLoaded = false;
    const image = new Image();
    image.src = '/assets/los-pit/hero/hero-team.webp';
    const finish = () => {
      if (disposed || !minimumTimeElapsed || !heroLoaded) return;
      setReady(true);
      sessionStorage.setItem('los-pit-loaded', '1');
    };
    const imageFinished = () => { heroLoaded = true; finish(); };
    const minimumTimer = window.setTimeout(() => { minimumTimeElapsed = true; finish(); }, 1200);
    if (image.complete) imageFinished(); else { image.onload = imageFinished; image.onerror = imageFinished; }
    return () => {
      disposed = true;
      window.clearTimeout(minimumTimer);
      image.onload = null;
      image.onerror = null;
    };
  }, [visible]);
  useEffect(() => { if (ready) { const id = window.setTimeout(() => setVisible(false), 420); return () => window.clearTimeout(id); } }, [ready]);
  if (!visible) return null;
  return <div className={`preloader ${ready ? 'is-ready' : ''}`} aria-live="polite" aria-label="Carregando Los Pit">
    <img src="/assets/los-pit/logo/logo-los-pit.png" alt="" />
    <div className="preloader-line"><span /></div>
  </div>;
}
