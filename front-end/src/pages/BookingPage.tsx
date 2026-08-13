import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, LoaderCircle, UserRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import { currency, duration, phoneDigits, phoneMask } from '../lib/format';
import { serviceIconFor } from '../data/serviceIcons';
import type { Appointment, Professional, Service } from '../types';

interface Availability { professionalId: string; professionalName: string; slots: string[]; durationMin: number; totalCents: number }
interface CreateResponse { appointment: Appointment; whatsAppUrl: string | null }
const stepNames = ['Serviços', 'Profissional', 'Data', 'Horário', 'Identificação', 'Revisão', 'Confirmado'];

export function BookingPage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<CreateResponse | null>(null);
  const { booking, update, reset } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as { professionalSelected?: boolean; professionalId?: string } | null;
  const preselectedProfessionalId = navigationState?.professionalId || '';
  const [skipProfessionalStep, setSkipProfessionalStep] = useState(() => Boolean(navigationState?.professionalSelected && preselectedProfessionalId));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    Promise.all([api<Service[]>('/services', { signal: controller.signal }), api<Professional[]>('/professionals', { signal: controller.signal })])
      .then(([serviceData, professionalData]) => { if (active) { setServices(serviceData); setProfessionals(professionalData); } })
      .catch((requestError: unknown) => { if (active && !(requestError instanceof DOMException && requestError.name === 'AbortError')) setError('Não foi possível carregar a agenda. Verifique a conexão e tente novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, []);

  useEffect(() => {
    if (user && !booking.customer.name) update({ customer: { ...booking.customer, name: user.name, phone: user.phone || '', email: user.email } });
  }, [user, booking.customer, update]);

  const selectedServices = useMemo(() => services.filter((service) => booking.serviceIds.includes(service.id)), [services, booking.serviceIds]);
  const total = useMemo(() => selectedServices.reduce((sum, service) => ({ price: sum.price + service.priceCents, minutes: sum.minutes + service.durationMin }), { price: 0, minutes: 0 }), [selectedServices]);
  const compatibleProfessionals = useMemo(() => professionals.filter((professional) => booking.serviceIds.every((id) => professional.services.some((service) => service.id === id))), [professionals, booking.serviceIds]);
  const selectedProfessional = professionals.find((item) => item.id === booking.professionalId);
  const days = useMemo(() => Array.from({ length: 21 }, (_, index) => addDays(new Date(), index)), []);
  const selectedAvailability = availability.find((item) => item.professionalId === booking.professionalId);

  const loadAvailability = useCallback(async (date: string) => {
    if (!booking.serviceIds.length || !date) return;
    setSlotsLoading(true); setError('');
    const params = new URLSearchParams({ date, serviceIds: booking.serviceIds.join(',') });
    if (booking.professionalId) params.set('professionalId', booking.professionalId);
    try {
      const data = await api<Availability[]>(`/availability?${params.toString()}`);
      setAvailability(data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao consultar os horários.'); }
    finally { setSlotsLoading(false); }
  }, [booking.serviceIds, booking.professionalId]);

  const next = async () => {
    setError('');
    if (step === 0) {
      if (!booking.serviceIds.length) return setError('Selecione ao menos um serviço.');
      const chosenProfessionalId = booking.professionalId || preselectedProfessionalId;
      if (skipProfessionalStep && chosenProfessionalId && compatibleProfessionals.some((professional) => professional.id === chosenProfessionalId)) {
        if (booking.professionalId !== chosenProfessionalId) update({ professionalId: chosenProfessionalId, date: '', startAt: '' });
        setStep(2);
        return;
      }
      setSkipProfessionalStep(false);
    }
    if (step === 1 && !booking.professionalId) return setError('Selecione um profissional.');
    if (step === 2) { if (!booking.date) return setError('Selecione uma data.'); await loadAvailability(booking.date); }
    if (step === 3 && !booking.startAt) return setError('Selecione um horário disponível.');
    if (step === 4) {
      if (booking.customer.name.trim().length < 3) return setError('Informe seu nome completo.');
      if (phoneDigits(booking.customer.phone).length < 10) return setError('Informe um WhatsApp válido.');
      if (booking.customer.email && !/^\S+@\S+\.\S+$/.test(booking.customer.email)) return setError('Informe um e-mail válido.');
    }
    setStep((current) => Math.min(current + 1, 6));
  };

  const confirm = async () => {
    setLoading(true); setError('');
    try {
      const response = await api<CreateResponse>('/appointments', { method: 'POST', body: JSON.stringify({
        professionalId: booking.professionalId, serviceIds: booking.serviceIds, startAt: booking.startAt,
        customerName: booking.customer.name.trim(), customerPhone: phoneDigits(booking.customer.phone),
        customerEmail: booking.customer.email.trim(), notes: booking.customer.notes.trim()
      }) });
      setSuccess(response); setStep(6); reset();
      if (response.whatsAppUrl) window.setTimeout(() => window.location.assign(response.whatsAppUrl!), 900);
    } catch (err) {
      setError(err instanceof ApiError && err.code === 'SLOT_TAKEN' ? 'Esse horário acabou de ser reservado. Volte e escolha outro.' : err instanceof Error ? err.message : 'Não foi possível confirmar.');
    } finally { setLoading(false); }
  };

  const cancel = () => { reset(); void navigate('/'); };

  return <main className="booking-shell">
    <header className="booking-header">
      <Link to="/" className="booking-brand"><img src="/assets/los-pit/logo/logo-los-pit.png" alt="Los Pit" /><span><strong>Los Pit</strong> Barber Shop</span></Link>
      <div className="booking-step-title"><small>Etapa {step + 1} de 7</small><strong>{stepNames[step]}</strong></div>
      <button onClick={cancel} aria-label="Cancelar e fechar"><X /></button>
      <div className="progress"><span style={{ width: `${((step + 1) / 7) * 100}%` }} /></div>
    </header>

    <div className="booking-content">
      {loading && step === 0 ? <div className="booking-loading"><LoaderCircle className="spin" /><p>Preparando a agenda...</p></div> : error && !services.length ? <div className="booking-error"><h1>Agenda indisponível</h1><p>{error}</p><button className="button" onClick={() => window.location.reload()}>Tentar novamente</button></div> : <>
        {step === 0 && <section className="booking-step"><StepHeading overline="Primeiro passo" title="Escolha seus serviços" text="Você pode combinar mais de um serviço. O tempo e o valor são calculados automaticamente." />
          <div className="select-services">{services.map((service) => { const selected = booking.serviceIds.includes(service.id); return <button key={service.id} aria-pressed={selected} className={selected ? 'selected' : ''} onClick={() => update({ serviceIds: selected ? booking.serviceIds.filter((id) => id !== service.id) : [...booking.serviceIds, service.id], professionalId: '', date: '', startAt: '' })}>
            <span className="selection-check"><img src={serviceIconFor(service.slug)} alt="" aria-hidden="true" />{selected && <Check className="selection-selected-icon" />}</span><div><h3>{service.name}</h3><p>{service.description}</p><small><Clock3 /> {duration(service.durationMin)}</small></div><strong>{currency(service.priceCents)}</strong>
          </button>; })}</div>
        </section>}

        {step === 1 && <section className="booking-step"><StepHeading overline="Quem vai cuidar de você" title="Selecione um profissional" text="Mostramos apenas profissionais compatíveis com todos os serviços escolhidos." />
          {compatibleProfessionals.length === 0 ? <div className="inline-empty"><UserRound /><h3>Nenhum profissional está disponível no momento.</h3><p>Altere os serviços ou tente novamente mais tarde.</p><button className="button button-ghost" onClick={() => setStep(0)}>Alterar serviços</button></div> : <div className="select-professionals">
            {compatibleProfessionals.map((professional) => <button key={professional.id} className={booking.professionalId === professional.id ? 'selected' : ''} onClick={() => { setSkipProfessionalStep(false); update({ professionalId: professional.id, date: '', startAt: '' }); }}>
              <h3>{professional.name}</h3>{booking.professionalId === professional.id && <Check />}
            </button>)}</div>}
        </section>}

        {step === 2 && <section className="booking-step"><StepHeading overline="Escolha o dia" title="Quando você vem?" text="As datas sem expediente ou sem janela suficiente não terão horários na próxima etapa." />
          <div className="date-picker-header"><button aria-label="Dias anteriores" disabled><ChevronLeft /></button><strong><CalendarDays /> Próximos dias</strong><button aria-label="Próximos dias"><ChevronRight /></button></div>
          <div className="date-strip">{days.map((date) => { const value = format(date, 'yyyy-MM-dd'); const selected = booking.date === value; return <button key={value} className={selected ? 'selected' : ''} onClick={() => update({ date: value, startAt: '' })}><small>{format(date, 'EEE', { locale: ptBR }).replace('.', '')}</small><strong>{format(date, 'dd')}</strong><span>{format(date, 'MMM', { locale: ptBR }).replace('.', '')}</span></button>; })}</div>
          <label className="calendar-field"><span>Ou escolha no calendário</span><input type="date" min={format(new Date(), 'yyyy-MM-dd')} max={format(addDays(new Date(), 60), 'yyyy-MM-dd')} value={booking.date} onChange={(event) => update({ date: event.target.value, startAt: '' })} /></label>
        </section>}

        {step === 3 && <section className="booking-step"><StepHeading overline={booking.date ? format(new Date(`${booking.date}T12:00:00`), "EEEE, d 'de' MMMM", { locale: ptBR }) : 'Horários'} title="Escolha o horário" text={`A duração total do atendimento é de ${duration(total.minutes)}.`} />
          {slotsLoading ? <div className="slots-loading"><LoaderCircle className="spin" /> Consultando a agenda em tempo real...</div> : !selectedAvailability?.slots.length ? <div className="inline-empty"><Clock3 /><h3>Não há horários disponíveis para esta data.</h3><p>Escolha outro dia ou profissional.</p><button className="button button-ghost" onClick={() => setStep(2)}>Escolher outro dia</button></div> : <div className="time-slots">{selectedAvailability.slots.map((slot) => <button className={booking.startAt === slot ? 'selected' : ''} key={slot} onClick={() => update({ startAt: slot })}>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' }).format(new Date(slot))}</button>)}</div>}
        </section>}

        {step === 4 && <section className="booking-step narrow"><StepHeading overline={user ? 'Seus dados' : 'Agendamento como convidado'} title={user ? `Tudo certo, ${user.name.split(' ')[0]}?` : 'Como podemos identificar você?'} text={user ? 'Confira os dados de contato para receber as informações do agendamento.' : 'Você poderá criar uma conta depois de confirmar.'} />
          {!user && <div className="login-callout"><UserRound /><span>Já possui uma conta?</span><Link to="/entrar?redirect=/agendar">Entrar agora</Link></div>}
          <div className="booking-form"><label>Nome completo<input autoComplete="name" value={booking.customer.name} onChange={(e) => update({ customer: { ...booking.customer, name: e.target.value } })} /></label><label>WhatsApp<input inputMode="tel" autoComplete="tel" placeholder="(85) 99999-9999" value={phoneMask(booking.customer.phone)} onChange={(e) => update({ customer: { ...booking.customer, phone: phoneDigits(e.target.value) } })} /></label><label>E-mail <small>opcional</small><input type="email" autoComplete="email" value={booking.customer.email} onChange={(e) => update({ customer: { ...booking.customer, email: e.target.value } })} /></label><label>Observações <small>opcional</small><textarea maxLength={500} placeholder="Conte algo que o profissional deve saber" value={booking.customer.notes} onChange={(e) => update({ customer: { ...booking.customer, notes: e.target.value } })} /></label></div>
        </section>}

        {step === 5 && <section className="booking-step narrow"><StepHeading overline="Última conferência" title="Revise seu agendamento" text="A disponibilidade será validada novamente ao confirmar." />
          <div className="review-list"><Review title="Serviços" value={selectedServices.map((item) => item.name).join(', ')} edit={() => setStep(0)} /><Review title="Profissional" value={selectedProfessional?.name || 'Profissional disponível'} edit={() => { setSkipProfessionalStep(false); setStep(1); }} /><Review title="Data e horário" value={`${booking.date ? format(new Date(`${booking.date}T12:00:00`), "dd 'de' MMMM", { locale: ptBR }) : ''} às ${booking.startAt ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' }).format(new Date(booking.startAt)) : ''}`} edit={() => setStep(2)} /><Review title="Cliente" value={`${booking.customer.name} · ${phoneMask(booking.customer.phone)}`} edit={() => setStep(4)} /></div>
          <div className="review-total"><span><small>Duração total</small><strong>{duration(total.minutes)}</strong></span><span><small>Valor total</small><strong>{currency(total.price)}</strong></span></div>
        </section>}

        {step === 6 && success && <section className="booking-success" aria-live="polite"><div className="success-celebration" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="success-mark"><Check /></div><span className="eyebrow">Horário confirmado</span><h1>Nos vemos na <em>Los Pit.</em></h1><p>{success.whatsAppUrl ? 'Agendamento confirmado. Abrindo o WhatsApp do profissional...' : 'Seu agendamento foi salvo com sucesso.'}</p></section>}
      </>}
    </div>

    {step < 6 && services.length > 0 && <footer className={`booking-footer${step === 5 ? ' booking-footer-confirm' : ''}`}>{step === 5 ? <button className="button" onClick={() => { void confirm(); }} disabled={loading}>{loading && <LoaderCircle className="spin" />} Confirmar agendamento</button> : <><button className="button button-ghost" onClick={() => step === 0 ? cancel() : step === 2 && skipProfessionalStep ? setStep(0) : setStep((current) => current - 1)}><ArrowLeft /> {step === 0 ? 'Cancelar' : 'Voltar'}</button><div className="booking-total"><small>{booking.serviceIds.length} {booking.serviceIds.length === 1 ? 'serviço' : 'serviços'} · {duration(total.minutes)}</small><strong>{currency(total.price)}</strong></div><button className="button" onClick={() => { void next(); }}>Próximo <span>→</span></button></>}<div className="booking-footer-error" aria-live="polite">{error}</div></footer>}
  </main>;
}

function StepHeading({ overline, title, text }: { overline: string; title: string; text: string }) { return <div className="booking-heading"><span className="eyebrow">{overline}</span><h1>{title}</h1><p>{text}</p></div>; }
function Review({ title, value, edit }: { title: string; value: string; edit: () => void }) { return <div><span><small>{title}</small><strong>{value}</strong></span><button onClick={edit}>Editar</button></div>; }
