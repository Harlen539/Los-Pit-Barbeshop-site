import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  ['Início', '#inicio'], ['Serviços', '#servicos'], ['Profissionais', '#profissionais'],
  ['Galeria', '#galeria'], ['Horários', '#horarios'], ['Contato', '#contato']
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState(() => window.location.hash || '#inicio');
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler(); window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  useEffect(() => {
    if (location.pathname !== '/') return;

    let frame = 0;
    const syncActiveSection = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const marker = Math.min(window.innerHeight * 0.3, 220);
        let current = '#inicio';

        for (const [, hash] of links) {
          const section = document.getElementById(hash.slice(1));
          if (section && section.getBoundingClientRect().top <= marker) current = hash;
        }

        const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
        setActiveHash(pageBottom ? '#contato' : current);
      });
    };

    syncActiveSection();
    window.addEventListener('scroll', syncActiveSection, { passive: true });
    window.addEventListener('resize', syncActiveSection);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', syncActiveSection);
      window.removeEventListener('resize', syncActiveSection);
    };
  }, [location.pathname]);
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => { document.body.classList.remove('menu-open'); document.removeEventListener('keydown', close); };
  }, [open]);
  const homeHref = (hash: string) => location.pathname === '/' ? hash : `/${hash}`;
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="announcement-bar"><span>Atendimento com hora marcada</span><Link to="/agendar">Reserve seu horário</Link></div>
    <div className="header-inner">
      <Link to="/" className="brand" aria-label="Los Pit — início"><img src="/assets/los-pit/logo/logo-los-pit.png" alt="Los Pit Barber Shop" /></Link>
      <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Navegação principal">
        {links.map(([label, hash]) => {
          const active = location.pathname === '/' && activeHash === hash;
          return <a key={hash} href={homeHref(hash)} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>;
        })}
        <NavLink to={user ? '/conta' : '/entrar'} className="mobile-account">{user ? 'Minha conta' : 'Entrar'}</NavLink>
      </nav>
      {open && <button className="menu-scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <div className="header-actions">
        <NavLink to={user ? '/conta' : '/entrar'} className="account-link" aria-label={user ? 'Minha conta' : 'Entrar'}><UserRound size={19} /></NavLink>
        <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
  </header>;
}
