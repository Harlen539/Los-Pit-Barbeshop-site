import { ArrowUp, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Settings } from '../types';

export function Footer({ settings }: { settings?: Settings | null }) {
  return <footer id="contato" className="site-footer">
    <div className="footer-main wrap">
      <div className="footer-brand"><img src="/assets/los-pit/logo/logo-los-pit.png" alt="Los Pit Barber Shop" /><p>Estilo de rua, precisão de rei.</p></div>
      <div><h3>Navegue</h3><a href="/#servicos">Serviços</a><a href="/#profissionais">Profissionais</a><a href="/#galeria">Galeria</a><Link to="/agendar">Agendar</Link></div>
      <div><h3>Legal</h3><Link to="/termos">Termos de Uso</Link><Link to="/privacidade">Política de Privacidade</Link></div>
      <div><h3>Localização</h3>
        {settings?.address && <p><MapPin size={16} /> {settings.address}</p>}
        {settings?.phone && <a href={`tel:${settings.phone}`}><Phone size={16} /> {settings.phone}</a>}
        {settings?.email && <a href={`mailto:${settings.email}`}><Mail size={16} /> {settings.email}</a>}
        {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>}
        {!settings?.address && !settings?.phone && !settings?.email && <p className="muted">Dados oficiais serão publicados em breve.</p>}
      </div>
    </div>
    <div className="footer-bottom wrap"><span>© {new Date().getFullYear()} Los Pit Barber Shop. Todos os direitos reservados.</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Voltar ao topo <ArrowUp size={15} /></button></div>
  </footer>;
}
