import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const p: any = prisma;

async function main() {
  console.log('🌱 Poblando base de datos...');

  // Crear usuario de ejemplo
  const user = await p.user.upsert({
    where: { email: 'usuario@ejemplo.com' },
    update: {},
    create: {
      email: 'usuario@ejemplo.com',
      name: 'Usuario de Ejemplo',
    },
  });
  console.log('✅ Usuario creado:', user.email);

  // Crear versículos de ejemplo
  const verses = await Promise.all([
    p.verse.upsert({
      where: { book_chapter_verse_version: { book: 'Juan', chapter: 3, verse: 16, version: 'RVR1960' } },
      update: {},
      create: {
        reference: 'Juan 3:16',
        text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
        book: 'Juan',
        chapter: 3,
        verse: 16,
        version: 'RVR1960',
        topic: 'Amor de Dios',
      },
    }),
  p.verse.upsert({
      where: { book_chapter_verse_version: { book: 'Filipenses', chapter: 4, verse: 13, version: 'RVR1960' } },
      update: {},
      create: {
        reference: 'Filipenses 4:13',
        text: 'Todo lo puedo en Cristo que me fortalece.',
        book: 'Filipenses',
        chapter: 4,
        verse: 13,
        version: 'RVR1960',
        topic: 'Fortaleza',
      },
    }),
  p.verse.upsert({
      where: { book_chapter_verse_version: { book: 'Salmos', chapter: 23, verse: 1, version: 'RVR1960' } },
      update: {},
      create: {
        reference: 'Salmos 23:1',
        text: 'Jehová es mi pastor; nada me faltará.',
        book: 'Salmos',
        chapter: 23,
        verse: 1,
        version: 'RVR1960',
        topic: 'Confianza',
      },
    }),
  p.verse.upsert({
      where: { book_chapter_verse_version: { book: 'Proverbios', chapter: 3, verse: 5, version: 'RVR1960' } },
      update: {},
      create: {
        reference: 'Proverbios 3:5-6',
        text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
        book: 'Proverbios',
        chapter: 3,
        verse: 5,
        version: 'RVR1960',
        topic: 'Confianza',
      },
    }),
  ]);
  console.log(`✅ ${verses.length} versículos creados`);

  // Crear devocional de ejemplo
  const devotional = await p.devotional.create({
    data: {
      title: 'El Amor Incondicional de Dios',
      topic: 'Amor de Dios',
      content: `El amor de Dios es el fundamento de nuestra fe. No es un amor basado en nuestros méritos o acciones, sino un amor puro e incondicional que Él decidió derramar sobre nosotros.

Cuando meditamos en Juan 3:16, entendemos la profundidad de este amor. Dios no escatimó nada, ni siquiera a su propio Hijo, para demostrarnos cuánto nos ama.

Este amor transformador debe cambiar nuestra perspectiva sobre nosotros mismos y sobre los demás. Si Dios nos ama de esta manera, ¿cómo no vamos a amarnos unos a otros?`,
      questions: [
        '¿Cómo ha experimentado el amor de Dios en tu vida personal?',
        '¿De qué manera puedes reflejar el amor de Dios hacia las personas que te rodean hoy?',
        '¿Hay alguna área de tu vida donde necesites recordar que eres amado incondicionalmente por Dios?',
      ],
      verses: {
        create: [
          {
            verseId: verses[0].id,
            order: 0,
          },
        ],
      },
    },
  });
  console.log('✅ Devocional creado:', devotional.title);

  // Programar devocional para hoy
  const today = new Date();
  today.setHours(6, 0, 0, 0); // 6:00 AM

  const dailyDevotional = await p.dailyDevotional.create({
    data: {
      userId: user.id,
      devotionalId: devotional.id,
      scheduledFor: today,
    },
  });
  console.log('✅ Devocional diario programado para hoy');

  // Crear nota de ejemplo
  const note = await p.note.create({
    data: {
      userId: user.id,
      title: 'Sermón: El Buen Pastor',
      content: `Puntos principales:
1. Jesús conoce a cada una de sus ovejas por nombre
2. El pastor da su vida por las ovejas
3. Las ovejas conocen y siguen la voz del pastor

Aplicación práctica:
- Confiar en que Dios nos conoce íntimamente
- Seguir su dirección en nuestra vida diaria
- Reconocer su voz en medio del ruido del mundo`,
      category: 'sermon',
      tags: ['pastor', 'juan 10', 'cuidado de dios'],
    },
  });
  console.log('✅ Nota de ejemplo creada');

  console.log('\n🎉 ¡Base de datos poblada exitosamente!');
  console.log('\nPuedes iniciar sesión con:');
  console.log('Email:', user.email);
  console.log('\nVisita http://localhost:3000 para ver la aplicación');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
