import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  { name: 'Corte', slug: 'corte', description: 'Corte masculino com acabamento preciso.', durationMin: 30, priceCents: 3500, icon: 'scissors', featured: true, sortOrder: 1, active: true },
  { name: 'Navalhado', slug: 'navalhado', description: 'Corte com acabamento navalhado.', durationMin: 30, priceCents: 4000, icon: 'razor', featured: true, sortOrder: 2, active: true },
  { name: 'Pezinho', slug: 'pezinho', description: 'Acabamento de contorno e nuca.', durationMin: 15, priceCents: 1500, icon: 'sparkles', featured: true, sortOrder: 3, active: true },
  { name: 'Barba', slug: 'barba', description: 'Modelagem, toalha quente e finalização.', durationMin: 30, priceCents: 3000, icon: 'beard', featured: true, sortOrder: 4, active: true },
  { name: 'Sobrancelha', slug: 'sobrancelha', description: 'Alinhamento discreto e natural.', durationMin: 15, priceCents: 500, icon: 'razor', featured: true, sortOrder: 5, active: true },
  { name: 'Pigmentação', slug: 'pigmentacao', description: 'Preenchimento e definição sob avaliação profissional.', durationMin: 30, priceCents: 2000, icon: 'ink', featured: true, sortOrder: 6, active: true }
];

const professionals = [
  {
    name: 'Cyell',
    slug: 'cyell',
    specialty: 'Barbeiro',
    photoUrl: '/assets/los-pit/professionals/professional-01.webp',
    whatsappNumber: '5583998822879'
  },
  {
    name: 'Eribaldo',
    slug: 'eribaldo',
    specialty: 'Barbeiro',
    photoUrl: '/assets/los-pit/professionals/professional-02.webp',
    whatsappNumber: '5583991096323'
  }
] as const;

const dailySchedules = [
  { weekday: 0, startMinute: 9 * 60 + 30, endMinute: 13 * 60 + 30 },
  { weekday: 1, startMinute: 9 * 60 + 30, endMinute: 13 * 60 },
  { weekday: 1, startMinute: 15 * 60, endMinute: 19 * 60 },
  { weekday: 2, startMinute: 9 * 60, endMinute: 13 * 60 },
  { weekday: 2, startMinute: 15 * 60, endMinute: 19 * 60 },
  { weekday: 3, startMinute: 9 * 60, endMinute: 13 * 60 },
  { weekday: 3, startMinute: 15 * 60, endMinute: 19 * 60 },
  { weekday: 4, startMinute: 9 * 60, endMinute: 13 * 60 },
  { weekday: 4, startMinute: 15 * 60, endMinute: 19 * 60 },
  { weekday: 5, startMinute: 9 * 60, endMinute: 12 * 60 },
  { weekday: 5, startMinute: 15 * 60, endMinute: 19 * 60 },
  { weekday: 6, startMinute: 8 * 60 + 30, endMinute: 12 * 60 + 30 },
  { weekday: 6, startMinute: 14 * 60 + 30, endMinute: 19 * 60 }
];

const businessAddress = 'Av. Presidente Delfim Moreira, 922 - 58035-260 Bessa - João Pessoa/PB';
const openingHours = {
  domingo: ['09:30 - 13:30'],
  segunda: ['09:30 - 13:00', '15:00 - 19:00'],
  terca: ['09:00 - 13:00', '15:00 - 19:00'],
  quarta: ['09:00 - 13:00', '15:00 - 19:00'],
  quinta: ['09:00 - 13:00', '15:00 - 19:00'],
  sexta: ['09:00 - 12:00', '15:00 - 19:00'],
  sabado: ['08:30 - 12:30', '14:30 - 19:00']
};

async function main() {
  await prisma.businessSetting.upsert({
    where: { id: 'default' },
    create: { id: 'default', name: 'Los Pit Barber Shop', address: businessAddress, openingHours, timezone: process.env.APP_TIMEZONE ?? 'America/Fortaleza' },
    update: { address: businessAddress, openingHours }
  });
  for (const service of services) {
    await prisma.service.upsert({ where: { slug: service.slug }, create: service, update: service });
  }
  await prisma.service.updateMany({ where: { slug: { notIn: services.map((service) => service.slug) } }, data: { active: false, featured: false } });
  const serviceIds = (await prisma.service.findMany({
    where: { slug: { in: services.map((service) => service.slug) } },
    select: { id: true }
  })).map((service) => service.id);
  await prisma.professional.updateMany({
    where: { slug: 'erbaldo' },
    data: {
      name: 'Eribaldo',
      slug: 'eribaldo',
      photoUrl: '/assets/los-pit/professionals/professional-02.webp'
    }
  });
  for (const professional of professionals) {
    const savedProfessional = await prisma.professional.upsert({
      where: { slug: professional.slug },
      create: {
        ...professional,
        services: { create: serviceIds.map((serviceId) => ({ serviceId })) },
        schedules: { create: dailySchedules }
      },
      update: {
        name: professional.name,
        specialty: professional.specialty,
        photoUrl: professional.photoUrl,
        whatsappNumber: professional.whatsappNumber,
        active: true
      }
    });
    await prisma.professionalSchedule.deleteMany({ where: { professionalId: savedProfessional.id } });
    await prisma.professionalSchedule.createMany({
      data: dailySchedules.map((schedule) => ({
        professionalId: savedProfessional.id,
        ...schedule
      })),
      skipDuplicates: true
    });
    await prisma.professionalService.deleteMany({
      where: { professionalId: savedProfessional.id, serviceId: { notIn: serviceIds } }
    });
    await prisma.professionalService.createMany({
      data: serviceIds.map((serviceId) => ({ professionalId: savedProfessional.id, serviceId })),
      skipDuplicates: true
    });
  }
  const gallery = [
    ['/assets/los-pit/gallery/work-beard-contour.webp', 'Barba grisalha com contorno preciso', 'barba'],
    ['/assets/los-pit/gallery/work-curly-mullet.webp', 'Corte cacheado com degradê lateral', 'cortes'],
    ['/assets/los-pit/gallery/work-waves-fade.webp', 'Corte com ondas e degradê na nuca', 'cortes'],
    ['/assets/los-pit/gallery/work-kids-fade.webp', 'Corte infantil com degradê suave', 'cortes'],
    ['/assets/los-pit/gallery/work-curly-fade.webp', 'Corte cacheado com acabamento na nuca', 'cortes'],
    ['/assets/los-pit/gallery/work-design-cut.webp', 'Corte masculino com desenho na nuca', 'cortes']
  ] as const;
  await prisma.galleryImage.deleteMany({
    where: { url: { notIn: gallery.map(([url]) => url) } }
  });
  for (const [sortOrder, [url, alt, category]] of gallery.entries()) {
    const existing = await prisma.galleryImage.findFirst({ where: { url } });
    if (existing) {
      await prisma.galleryImage.update({
        where: { id: existing.id },
        data: { alt, category, sortOrder, active: true }
      });
    } else {
      await prisma.galleryImage.create({ data: { url, alt, category, sortOrder } });
    }
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      create: { name: 'Administrador Los Pit', email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash: await argon2.hash(process.env.ADMIN_PASSWORD), role: Role.ADMIN },
      update: { role: Role.ADMIN }
    });
  }
}

void main()
  .catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.message : 'Seed failed'}\n`); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
