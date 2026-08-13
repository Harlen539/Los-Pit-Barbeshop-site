import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = '12 de agosto de 2026';

function PrivacyPolicy() {
  return <>
    <section id="controlador">
      <h2>1. Quem trata seus dados</h2>
      <p>A Los Pit Barber Shop é responsável pelas decisões sobre o tratamento dos dados pessoais utilizados neste site e no atendimento da barbearia. Para assuntos relacionados à privacidade, fale conosco pelos canais oficiais disponíveis na seção <Link to="/#contato">Localização e contato</Link> do site.</p>
    </section>

    <section id="dados-coletados">
      <h2>2. Dados que coletamos</h2>
      <p>Dependendo de como você utiliza o site, podemos tratar:</p>
      <ul>
        <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, data de nascimento e senha armazenada de forma protegida por hash.</li>
        <li><strong>Dados do agendamento:</strong> profissional, serviços, data, horário, preço, observações e situação da reserva.</li>
        <li><strong>Dados técnicos e de segurança:</strong> registros necessários para autenticação, prevenção de fraude, controle de acesso e diagnóstico de erros.</li>
        <li><strong>Comunicações:</strong> informações incluídas voluntariamente pelo cliente ao entrar em contato ou abrir uma mensagem de WhatsApp.</li>
      </ul>
      <p>Não solicitamos dados pessoais sensíveis para realizar um agendamento. Evite inserir informações sensíveis no campo de observações.</p>
    </section>

    <section id="finalidades">
      <h2>3. Como e por que usamos os dados</h2>
      <p>Os dados são utilizados para criar e proteger sua conta, identificar o cliente, consultar disponibilidade, confirmar, gerenciar e cancelar agendamentos, prestar atendimento, manter histórico, prevenir uso indevido e cumprir obrigações legais.</p>
      <p>O tratamento poderá ocorrer para executar o serviço solicitado ou procedimentos anteriores à contratação, cumprir obrigação legal ou regulatória, exercer direitos em processos e atender interesses legítimos relacionados à segurança e à melhoria do atendimento. Quando a lei exigir, solicitaremos consentimento específico.</p>
    </section>

    <section id="compartilhamento">
      <h2>4. Compartilhamento</h2>
      <p>Compartilhamos somente o necessário com o profissional escolhido para executar o atendimento e com fornecedores que sustentam a operação, como hospedagem, banco de dados, segurança e comunicação. Esses fornecedores devem tratar as informações de acordo com suas finalidades e obrigações legais.</p>
      <p>Ao confirmar ou cancelar uma reserva, o site poderá abrir o WhatsApp com uma mensagem preenchida para o número do profissional. O envio depende da ação do usuário e, ao prosseguir, o tratamento também estará sujeito aos termos e à política do WhatsApp.</p>
      <p>Não vendemos dados pessoais. Poderemos fornecer informações quando houver obrigação legal, ordem válida de autoridade ou necessidade de proteger direitos da Los Pit, dos clientes ou de terceiros.</p>
    </section>

    <section id="cookies">
      <h2>5. Cookies e sessão</h2>
      <p>Utilizamos cookie estritamente necessário para manter a sessão autenticada e proteger o acesso à conta. Ele não é usado para publicidade e pode ser removido ao sair da conta ou pelas configurações do navegador. O bloqueio desse cookie pode impedir o funcionamento do login.</p>
    </section>

    <section id="conservacao">
      <h2>6. Conservação e segurança</h2>
      <p>Conservamos os dados pelo período necessário para prestar o serviço, manter a conta e o histórico, prevenir fraudes, exercer direitos e cumprir obrigações legais. Depois disso, as informações serão eliminadas ou anonimizadas, salvo quando a lei permitir ou exigir sua conservação.</p>
      <p>Adotamos controles como senhas protegidas por hash, autenticação, limitação de tentativas e restrição de acesso administrativo. Nenhum sistema é totalmente invulnerável; caso seja identificado incidente relevante, serão tomadas as medidas exigidas pela legislação.</p>
    </section>

    <section id="direitos">
      <h2>7. Seus direitos</h2>
      <p>Nos termos da LGPD, você pode solicitar, quando aplicável:</p>
      <ul>
        <li>confirmação do tratamento e acesso aos dados;</li>
        <li>correção de informações incompletas, inexatas ou desatualizadas;</li>
        <li>informações sobre compartilhamento;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>eliminação de dados tratados com consentimento, respeitadas as hipóteses legais de conservação;</li>
        <li>revogação do consentimento, oposição ao tratamento e revisão de decisões automatizadas, quando aplicável;</li>
        <li>portabilidade, conforme regulamentação e observados os segredos comercial e industrial.</li>
      </ul>
      <p>Para proteger sua identidade, poderemos pedir informações adicionais antes de atender à solicitação. O pedido é gratuito e pode ser feito pelos canais oficiais indicados no site.</p>
    </section>

    <section id="menores">
      <h2>8. Crianças e adolescentes</h2>
      <p>O cadastro e o agendamento de menores de idade devem ser realizados ou autorizados por seu responsável legal, sempre em seu melhor interesse. Se identificarmos tratamento inadequado de dados de menor, adotaremos as medidas necessárias para corrigi-lo ou encerrá-lo.</p>
    </section>

    <section id="alteracoes">
      <h2>9. Alterações desta política</h2>
      <p>Esta política poderá ser atualizada para refletir mudanças no serviço ou na legislação. A versão vigente e sua data de atualização permanecerão publicadas nesta página. Alterações relevantes poderão ser comunicadas pelos canais disponíveis.</p>
    </section>
  </>;
}

function TermsOfUse() {
  return <>
    <section id="aceitacao">
      <h2>1. Aceitação</h2>
      <p>Estes Termos regulam o uso do site e do sistema de agendamentos da Los Pit Barber Shop. Ao criar uma conta, agendar como convidado ou utilizar uma área autenticada, você declara ter lido e aceitado estes Termos e a <Link to="/privacidade">Política de Privacidade</Link>.</p>
    </section>

    <section id="servicos">
      <h2>2. Serviços e disponibilidade</h2>
      <p>O site permite consultar serviços, profissionais, preços e horários, além de criar, visualizar e cancelar agendamentos. A reserva somente é válida depois da confirmação exibida pelo sistema. Horários podem variar conforme profissional, duração dos serviços, pausas, bloqueios e funcionamento da barbearia.</p>
      <p>A Los Pit poderá corrigir erros evidentes de informação ou indisponibilidade. Se uma reserva confirmada for afetada, entraremos em contato para oferecer remarcação ou cancelamento.</p>
    </section>

    <section id="cadastro">
      <h2>3. Cadastro e conta</h2>
      <p>Você deve fornecer informações verdadeiras, completas e atualizadas. A conta é pessoal e não pode ser cedida. O usuário é responsável pela confidencialidade da senha e deve comunicar qualquer suspeita de acesso indevido.</p>
      <p>Pessoas sem plena capacidade civil devem utilizar o serviço com representação ou assistência de seu responsável legal.</p>
    </section>

    <section id="agendamento">
      <h2>4. Agendamentos</h2>
      <ul>
        <li>Confira profissional, serviço, data, horário, duração e dados de contato antes de confirmar.</li>
        <li>Chegue no horário reservado. Atrasos podem reduzir o tempo disponível ou inviabilizar o atendimento.</li>
        <li>O preço apresentado corresponde aos serviços selecionados e poderá mudar se o cliente solicitar serviços adicionais presencialmente.</li>
        <li>A abertura do WhatsApp facilita o aviso ao profissional, mas a reserva registrada no sistema não depende do envio da mensagem pelo cliente.</li>
      </ul>
    </section>

    <section id="cancelamento">
      <h2>5. Cancelamentos e ausência</h2>
      <p>O cancelamento online fica disponível dentro do prazo informado no sistema. Quando o prazo estiver encerrado, o cliente deverá procurar a barbearia por um canal oficial. Ao cancelar, o horário é liberado novamente na agenda.</p>
      <p>Em caso de ausência ou atrasos recorrentes, a Los Pit poderá restringir novos agendamentos, após avaliar as circunstâncias e respeitar a legislação aplicável. A barbearia também poderá cancelar uma reserva por motivo operacional ou de força maior, comunicando o cliente sempre que possível.</p>
    </section>

    <section id="pagamento">
      <h2>6. Preços e pagamento</h2>
      <p>Os valores exibidos são informados em reais e correspondem ao catálogo vigente no momento do agendamento. O site não processa pagamento online. O pagamento é realizado no atendimento pelas formas divulgadas no estabelecimento e no site: dinheiro, crédito, débito ou Pix.</p>
    </section>

    <section id="uso-adequado">
      <h2>7. Uso adequado</h2>
      <p>É proibido tentar acessar contas ou áreas administrativas sem autorização, interferir no funcionamento do serviço, automatizar reservas abusivas, inserir conteúdo ilícito ou usar dados de terceiros sem permissão. Contas e reservas relacionadas a fraude ou abuso poderão ser suspensas ou canceladas.</p>
    </section>

    <section id="propriedade">
      <h2>8. Propriedade intelectual</h2>
      <p>A marca, identidade visual, fotografias, textos, elementos gráficos e software do site pertencem à Los Pit ou são utilizados com autorização. O acesso ao site não concede direito de reprodução, exploração comercial ou criação de obras derivadas sem autorização.</p>
    </section>

    <section id="responsabilidade">
      <h2>9. Responsabilidades</h2>
      <p>Empregamos esforços razoáveis para manter o sistema seguro e disponível, mas interrupções temporárias podem ocorrer por manutenção, falhas de internet ou serviços de terceiros. Nada nestes Termos exclui responsabilidades que não possam ser afastadas pela legislação brasileira, especialmente os direitos do consumidor.</p>
    </section>

    <section id="alteracoes-termos">
      <h2>10. Alterações, legislação e contato</h2>
      <p>Podemos atualizar estes Termos para acompanhar mudanças no serviço ou na lei. A versão vigente e sua data permanecerão nesta página. Aplicam-se as leis da República Federativa do Brasil, assegurados os direitos e o foro legalmente competente do consumidor.</p>
      <p>Dúvidas ou solicitações podem ser encaminhadas pelos canais oficiais disponíveis na seção <Link to="/#contato">Localização e contato</Link>.</p>
    </section>
  </>;
}

export function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  const isTerms = type === 'terms';
  const title = isTerms ? 'Termos de Uso' : 'Política de Privacidade';

  useEffect(() => {
    document.title = `${title} | Los Pit Barber Shop`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [title]);

  return <main className="legal-page wrap">
    <header className="legal-header">
      <span className="eyebrow">Los Pit Barber Shop</span>
      <h1>{title}</h1>
      <p>{isTerms
        ? 'Regras para utilização do site, criação de conta e realização de agendamentos.'
        : 'Entenda quais dados utilizamos, por que são necessários e como exercer seus direitos.'}</p>
      <small>Última atualização: {LAST_UPDATED}</small>
    </header>

    <article className="legal-content">
      {isTerms ? <TermsOfUse /> : <PrivacyPolicy />}
    </article>

    <nav className="legal-actions" aria-label="Documentos legais">
      <Link to={isTerms ? '/privacidade' : '/termos'} className="button button-ghost">{isTerms ? 'Ver Política de Privacidade' : 'Ver Termos de Uso'}</Link>
      <Link to="/" className="text-link">Voltar ao início</Link>
    </nav>
  </main>;
}

export function NotFoundPage() { return <main className="not-found"><span>404</span><h1>Página não encontrada.</h1><Link to="/" className="button">Voltar ao início</Link></main>; }
