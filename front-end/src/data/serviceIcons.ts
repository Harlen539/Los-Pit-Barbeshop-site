export const serviceIconAssets: Readonly<Record<string, string>> = {
  corte: '/assets/los-pit/service-icons/corte.webp',
  navalhado: '/assets/los-pit/service-icons/navalhado.webp',
  pezinho: '/assets/los-pit/service-icons/pezinho.webp',
  barba: '/assets/los-pit/service-icons/barba.webp',
  sobrancelha: '/assets/los-pit/service-icons/sobrancelha.webp',
  pigmentacao: '/assets/los-pit/service-icons/pigmentacao.webp'
};

export function serviceIconFor(slug: string) {
  return serviceIconAssets[slug] || serviceIconAssets.corte;
}
