import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Scissors } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { phoneDigits, phoneMask } from '../lib/format';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', birthDate: '', acceptTerms: false });
  const { login, register } = useAuth(); const navigate = useNavigate(); const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/conta';

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMessage('Informe um e-mail válido.');
    if (mode === 'login' && !form.password) return setMessage('Informe sua senha.');
    if (mode === 'register' && form.name.trim().length < 3) return setMessage('Informe seu nome completo.');
    if (mode === 'register' && phoneDigits(form.phone).length < 10) return setMessage('Informe um WhatsApp válido com DDD.');
    if (mode === 'register' && form.password.length < 8) return setMessage('A senha deve ter pelo menos 8 caracteres.');
    if (mode === 'register' && !/[A-Z]/.test(form.password)) return setMessage('A senha deve conter ao menos uma letra maiúscula.');
    if (mode === 'register' && !/\d/.test(form.password)) return setMessage('A senha deve conter ao menos um número.');
    if (mode === 'register' && form.password !== form.confirm) return setMessage('As senhas não coincidem.');
    if (mode === 'register' && !form.acceptTerms) return setMessage('Aceite os termos e a política de privacidade.');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register({ name: form.name, email: form.email, phone: phoneDigits(form.phone), password: form.password, ...(form.birthDate ? { birthDate: form.birthDate } : {}), acceptTerms: true });
      void navigate(redirect, { replace: true });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível continuar.'); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><div className="auth-image"><div><span className="eyebrow">Área exclusiva</span><h1>Seu estilo.<br /><em>Seu horário.</em></h1><p>Acesse seus agendamentos e mantenha seus dados em dia.</p></div></div><section className="auth-panel">
    <div className="auth-box"><Link to="/" className="auth-logo"><img src="/assets/los-pit/logo/logo-los-pit.png" alt="Los Pit" /></Link><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>Já tenho uma conta</button><button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMessage(''); }}>Cadastrar</button></div>
      <div className="auth-title"><Scissors /><div><h2>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2><p>{mode === 'login' ? 'Entre para visualizar seus horários.' : 'Leva menos de dois minutos.'}</p></div></div>
      <form noValidate onSubmit={(event) => { void submit(event); }}>
        {mode === 'register' && <label>Nome completo<input required minLength={3} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}
        <label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        {mode === 'register' && <><label>WhatsApp<input required inputMode="tel" autoComplete="tel" value={phoneMask(form.phone)} onChange={(e) => setForm({ ...form, phone: phoneDigits(e.target.value) })} /></label><label>Data de aniversário <small>opcional</small><input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label></>}
        <label>Senha<div className="password-field"><LockKeyhole /><input required minLength={8} pattern={mode === 'register' ? '(?=.*[A-Z])(?=.*\\d).{8,}' : undefined} title={mode === 'register' ? 'Use pelo menos 8 caracteres, uma letra maiúscula e um número.' : undefined} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{mode === 'register' && <small className="field-hint">Mínimo de 8 caracteres, uma maiúscula e um número.</small>}</label>
        {mode === 'register' && <><label>Confirmar senha<input required minLength={8} type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></label><div className="legal-consent"><input id="accept-legal" type="checkbox" checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} /><span><label htmlFor="accept-legal">Aceito os </label><Link to="/termos" target="_blank" rel="noreferrer">Termos de Uso</Link><span> e a </span><Link to="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</Link><span>.</span></span></div></>}
        <div className="form-message" aria-live="polite">{message}</div><button className="button auth-submit" disabled={loading}>{loading && <LoaderCircle className="spin" />}{mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <Link to="/agendar" className="continue-guest">Continuar agendamento como convidado →</Link>
    </div>
  </section></main>;
}
