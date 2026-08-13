import type { Service } from '../types';

export const initialServices: Service[] = [
  { id: 'corte', slug: 'corte', name: 'Corte', description: 'Corte masculino com acabamento preciso.', durationMin: 30, priceCents: 3500, icon: 'scissors', featured: true, active: true },
  { id: 'navalhado', slug: 'navalhado', name: 'Navalhado', description: 'Corte com acabamento navalhado.', durationMin: 30, priceCents: 4000, icon: 'razor', featured: true, active: true },
  { id: 'pezinho', slug: 'pezinho', name: 'Pezinho', description: 'Acabamento de contorno e nuca.', durationMin: 15, priceCents: 1500, icon: 'sparkles', featured: true, active: true },
  { id: 'barba', slug: 'barba', name: 'Barba', description: 'Modelagem, toalha quente e finalização.', durationMin: 30, priceCents: 3000, icon: 'beard', featured: true, active: true },
  { id: 'sobrancelha', slug: 'sobrancelha', name: 'Sobrancelha', description: 'Alinhamento discreto e natural.', durationMin: 15, priceCents: 500, icon: 'razor', featured: true, active: true },
  { id: 'pigmentacao', slug: 'pigmentacao', name: 'Pigmentação', description: 'Preenchimento e definição sob avaliação.', durationMin: 30, priceCents: 2000, icon: 'ink', featured: true, active: true }
];

export const galleryAssets = [
  { src: '/assets/los-pit/gallery/work-beard-contour.webp', alt: 'Barba grisalha com contorno preciso', className: 'gallery-tall' },
  { src: '/assets/los-pit/gallery/work-curly-mullet.webp', alt: 'Corte cacheado com degradê lateral', className: 'gallery-tall' },
  { src: '/assets/los-pit/gallery/work-waves-fade.webp', alt: 'Corte com ondas e degradê na nuca', className: 'gallery-tall' },
  { src: '/assets/los-pit/gallery/work-kids-fade.webp', alt: 'Corte infantil com degradê suave', className: 'gallery-tall' },
  { src: '/assets/los-pit/gallery/work-curly-fade.webp', alt: 'Corte cacheado com acabamento na nuca', className: 'gallery-tall' },
  { src: '/assets/los-pit/gallery/work-design-cut.webp', alt: 'Corte masculino com desenho na nuca', className: 'gallery-tall' }
];
