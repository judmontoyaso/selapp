const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    await sharp('public/selapp.png')
      .resize(size, size, { fit: 'contain', background: { r: 250, g: 245, b: 235, alpha: 1 } })
      .png()
      .toFile(`public/icon-${size}x${size}.png`);
    
    console.log(`✅ Generado icon-${size}x${size}.png`);
  }
  
  // También generar un favicon.ico
  await sharp('public/selapp.png')
    .resize(32, 32, { fit: 'contain', background: { r: 250, g: 245, b: 235, alpha: 1 } })
    .png()
    .toFile('public/favicon.png');
  
  console.log('✅ Generado favicon.png');
  console.log('✅ Todos los íconos generados exitosamente!');
}

generateIcons().catch(console.error);
