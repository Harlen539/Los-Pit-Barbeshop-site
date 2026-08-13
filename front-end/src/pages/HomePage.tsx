import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock3, Copy, CreditCard, MapPin, Navigation, UsersRound, X } from 'lucide-react';
import { api } from '../lib/api';
import { currency, duration, phoneMask } from '../lib/format';
import type { Professional, Service, Settings } from '../types';
import { initialServices, galleryAssets } from '../data/defaults';
import { serviceIconFor } from '../data/serviceIcons';
import { useBooking } from '../context/BookingContext';
import { Footer } from '../components/Footer';

const businessAddress = 'Av. Presidente Delfim Moreira, 922 - 58035-260 Bessa - João Pessoa/PB';
const businessMapsUrl = 'https://maps.app.goo.gl/oK61cbnYgZJ4Licr5';
const businessHours = [
  { weekday: 0, label: 'Domingo', times: ['09:30 - 13:30'] },
  { weekday: 1, label: 'Segunda-feira', times: ['09:30 - 13:00', '15:00 - 19:00'] },
  { weekday: 2, label: 'Terça-feira', times: ['09:00 - 13:00', '15:00 - 19:00'] },
  { weekday: 3, label: 'Quarta-feira', times: ['09:00 - 13:00', '15:00 - 19:00'] },
  { weekday: 4, label: 'Quinta-feira', times: ['09:00 - 13:00', '15:00 - 19:00'] },
  { weekday: 5, label: 'Sexta-feira', times: ['09:00 - 12:00', '15:00 - 19:00'] },
  { weekday: 6, label: 'Sábado', times: ['08:30 - 12:30', '14:30 - 19:00'] }
] as const;

function weekdayInTimezone(timezone: string) {
  try {
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(new Date());
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  } catch {
    return new Date().getDay();
  }
}

function Lightbox({ index, close, move }: { index: number; close: () => void; move: (delta: number) => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowLeft') move(-1); };
    document.addEventListener('keydown', onKey); document.body.classList.add('menu-open');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('menu-open'); };
  }, [close, move]);
  const item = galleryAssets[index]; if (!item) return null;
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visualização da galeria" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <button ref={closeButton} className="lightbox-close" onClick={close} aria-label="Fechar"><X /></button>
    <button onClick={() => move(-1)} aria-label="Imagem anterior"><ChevronLeft /></button>
    <figure><img src={item.src} alt={item.alt} /></figure>
    <button onClick={() => move(1)} aria-label="Próxima imagem"><ChevronRight /></button>
  </div>;
}

export function HomePage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copiedProfessionalId, setCopiedProfessionalId] = useState('');
  const [todayWeekday, setTodayWeekday] = useState(() => weekdayInTimezone('America/Fortaleza'));
  const [professionalsLoading, setProfessionalsLoading] = useState(true);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const { update } = useBooking(); const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      api<Service[]>('/services', { signal: controller.signal }),
      api<Professional[]>('/professionals', { signal: controller.signal }),
      api<Settings>('/settings', { signal: controller.signal })
    ]).then(([serviceResult, professionalResult, settingsResult]) => {
      if (serviceResult.status === 'fulfilled' && serviceResult.value.length) setServices(serviceResult.value);
      if (professionalResult.status === 'fulfilled') setProfessionals(professionalResult.value);
      if (settingsResult.status === 'fulfilled') setSettings(settingsResult.value);
      setProfessionalsLoading(false);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const refreshWeekday = () => setTodayWeekday(weekdayInTimezone(settings?.timezone || 'America/Fortaleza'));
    refreshWeekday();
    const timer = window.setInterval(refreshWeekday, 60_000);
    return () => window.clearInterval(timer);
  }, [settings?.timezone]);

  const startWithService = (service: Service) => { update({ serviceIds: [service.id], professionalId: '', date: '', startAt: '' }); void navigate('/agendar'); };
  const startWithProfessional = (professional: Professional) => {
    update({ serviceIds: [], professionalId: professional.id, date: '', startAt: '' });
    void navigate('/agendar', { state: { professionalSelected: true, professionalId: professional.id } });
  };
  const copyProfessionalPhone = async (professional: Professional) => {
    if (!professional.whatsappNumber) return;
    const phone = `+55 ${phoneMask(professional.whatsappNumber)}`;
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      const field = document.createElement('textarea');
      field.value = phone; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove();
    }
    setCopiedProfessionalId(professional.id);
    window.setTimeout(() => setCopiedProfessionalId((current) => current === professional.id ? '' : current), 1600);
  };
  const moveLightbox = (delta: number) => setLightbox((current) => current === null ? null : (current + delta + galleryAssets.length) % galleryAssets.length);
  const scrollGallery = (direction: -1 | 1) => {
    const track = galleryTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * .82, 850), behavior: 'smooth' });
  };

  return <main>
    <section id="inicio" className="hero">
      <div className="hero-glow" /><div className="hero-content wrap">
        <div className="hero-visual"><picture><source media="(max-width: 720px)" srcSet="/assets/los-pit/hero/hero-team-720.webp" /><img src="/assets/los-pit/hero/hero-team.webp" srcSet="/assets/los-pit/hero/hero-team-720.webp 720w, /assets/los-pit/hero/hero-team.webp 2123w" sizes="100vw" alt="Profissionais da Los Pit Barber Shop" fetchPriority="high" /></picture></div>
      </div>
    </section>

    <section id="servicos" className="section services-section wrap">
      <div className="section-heading"><span className="eyebrow">Serviços</span><h2>Escolha seu <em>estilo</em></h2><p>Precisão em cada detalhe. Selecione um ou combine serviços no agendamento.</p></div>
      <div className="featured-services">
        {services.filter((service) => service.featured).map((service, index) => <button className="service-feature" key={service.id} onClick={() => startWithService(service)}>
          <span className="service-number">0{index + 1}</span><img className="service-icon" src={serviceIconFor(service.slug)} alt="" aria-hidden="true" /><div><h3>{service.name}</h3><p>{service.description}</p><span>{duration(service.durationMin)} · <strong>{currency(service.priceCents)}</strong></span></div><span className="service-arrow">↗</span>
        </button>)}
      </div>
      {services.some((service) => !service.featured) && <div className="secondary-services">{services.filter((service) => !service.featured).map((service) => <button key={service.id} onClick={() => startWithService(service)}><span>{service.name}</span><small>{duration(service.durationMin)}</small><strong>{currency(service.priceCents)}</strong></button>)}</div>}
      <div className="section-action"><Link to="/agendar" className="text-link">Montar meu atendimento <span>→</span></Link></div>
    </section>

    <section id="profissionais" className="section professionals-section wrap">
      <div className="section-heading row"><div><span className="eyebrow">Profissionais</span><h2>Mestres do <em>estilo</em></h2></div><p>Técnica, personalidade e atenção aos detalhes em cada atendimento.</p></div>
      {professionalsLoading ? <div className="loading-line" aria-label="Carregando profissionais" /> : professionals.length === 0 ? <div className="empty-professionals"><UsersRound /><div><h3>Nossa equipe será apresentada em breve.</h3><p>Nenhum profissional está disponível no momento.</p></div><Link to="/agendar" className="button button-ghost">Consultar agenda</Link></div> :
        <div className="professional-list">{professionals.slice(0, 3).map((professional, index) => <article className="professional" key={professional.id}>
          <div className="professional-photo"><img src={professional.photoUrl || `/assets/los-pit/professionals/professional-0${index + 1}.webp`} alt={`Profissional ${professional.name}`} loading="lazy" /></div>
          <div><small>{professional.specialty || 'Profissional Los Pit'}</small><h3>{professional.name}</h3>{professional.whatsappNumber && <div className="professional-phone"><span>+55 {phoneMask(professional.whatsappNumber)}</span><button type="button" onClick={() => { void copyProfessionalPhone(professional); }} aria-label={`Copiar WhatsApp de ${professional.name}`} title="Copiar número">{copiedProfessionalId === professional.id ? <Check /> : <Copy />}</button></div>}{professional.bio && <p>{professional.bio}</p>}<button className="professional-booking-link" onClick={() => startWithProfessional(professional)}>Agendar</button></div>
        </article>)}</div>}
    </section>

    <section id="galeria" className="section gallery-section">
      <div className="section-heading gallery-heading"><h2>Galeria de Cortes</h2><p>Estilo, técnica e identidade em cada detalhe.</p></div>
      <div className="gallery-carousel">
        <button className="gallery-arrow gallery-arrow-left" onClick={() => scrollGallery(-1)} aria-label="Ver fotos anteriores"><ChevronLeft /></button>
        <div ref={galleryTrackRef} className="gallery-track">{galleryAssets.map((item, index) => <button className={item.className} key={item.src} onClick={() => setLightbox(index)} aria-label={`Abrir: ${item.alt}`}><img src={item.src} srcSet={`${item.src.replace('.webp', '-720.webp')} 720w, ${item.src} 1448w`} sizes="(max-width: 767px) 82vw, 38vw" loading="lazy" alt={item.alt} /></button>)}</div>
        <button className="gallery-arrow gallery-arrow-right" onClick={() => scrollGallery(1)} aria-label="Ver próximas fotos"><ChevronRight /></button>
      </div>
    </section>

    <section id="horarios" className="business-details-section wrap" aria-label="Horário de funcionamento e localização">
      <div className="section-heading business-details-heading"><span className="eyebrow">Informações</span><h2>Horários e <em>localização</em></h2><p>Confira nosso funcionamento, encontre a Los Pit e conheça as formas de pagamento.</p></div>
      <div className="business-details-grid">
        <div className="business-info-panel location-panel"><div className="business-info-title"><MapPin /><h3>Localização</h3></div><a className="business-address-link" href={businessMapsUrl} target="_blank" rel="noreferrer">{settings?.address || businessAddress}</a><a className="map-link" href={businessMapsUrl} target="_blank" rel="noreferrer" aria-label="Abrir localização no Google Maps"><Navigation /></a></div>
        <div className="business-info-panel hours-panel"><div className="business-info-title"><Clock3 /><h3>Horário de atendimento</h3></div><div className="business-hours-list">{businessHours.map((day) => <div className={day.weekday === todayWeekday ? 'is-today' : ''} key={day.weekday}><span>{day.label}{day.weekday === todayWeekday && <small>Hoje</small>}</span><strong>{day.times.map((time) => <span key={time}>{time}</span>)}</strong></div>)}</div></div>
        <div className="business-info-panel payment-panel"><div className="business-info-title"><CreditCard /><h3>Formas de pagamento</h3></div><div className="payment-methods"><span>Dinheiro</span><span>Crédito</span><span>Débito</span><span>Pix</span></div></div>
      </div>
    </section>

    <Footer settings={settings} />
    {lightbox !== null && <Lightbox index={lightbox} close={() => setLightbox(null)} move={moveLightbox} />}
  </main>;
}
