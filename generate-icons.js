// Genera los íconos PWA desde el logo vectorial public/logo-mark.svg
const sharp = require('sharp');

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    await sharp('public/logo-mark.svg')
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}x${size}.png`);

    console.log(`✅ Generado icon-${size}x${size}.png`);
  }

  await sharp('public/logo-mark.svg')
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');

  console.log('✅ Generado favicon.png');
  console.log('✅ Todos los íconos generados exitosamente!');
}

generateIcons().catch(console.error);
