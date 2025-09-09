const fs = require('fs');
const path = require('path');

// Función para crear un icono SVG simple
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 10}" fill="url(#gradient)" stroke="#fff" stroke-width="4"/>
  
  <!-- Trophy Icon -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Trophy Base -->
    <rect x="-${size/12}" y="${size/6}" width="${size/6}" height="${size/24}" rx="${size/48}" fill="#fff"/>
    
    <!-- Trophy Body -->
    <rect x="-${size/16}" y="-${size/12}" width="${size/8}" height="${size/4}" rx="${size/16}" fill="#fff"/>
    
    <!-- Trophy Handles -->
    <path d="M -${size/8} -${size/24} Q -${size/6} -${size/12} -${size/8} -${size/8} Q -${size/12} -${size/12} -${size/8} -${size/24}" stroke="#fff" stroke-width="${size/64}" fill="none"/>
    <path d="M ${size/8} -${size/24} Q ${size/6} -${size/12} ${size/8} -${size/8} Q ${size/12} -${size/12} ${size/8} -${size/24}" stroke="#fff" stroke-width="${size/64}" fill="none"/>
    
    <!-- Trophy Top -->
    <rect x="-${size/24}" y="-${size/8}" width="${size/12}" height="${size/24}" rx="${size/48}" fill="#fff"/>
    
    <!-- Star on Trophy -->
    <g transform="translate(0, -${size/24})">
      <path d="M 0 -${size/32} L ${size/128} -${size/64} L ${size/32} -${size/64} L ${size/64} ${size/128} L ${size/32} ${size/32} L 0 ${size/64} L -${size/32} ${size/32} L -${size/64} ${size/128} L -${size/32} -${size/64} L -${size/128} -${size/64} Z" fill="#667eea"/>
    </g>
  </g>
</svg>`;
}

// Crear directorio public si no existe
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generar iconos en diferentes tamaños
const sizes = [192, 512];
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Creado ${filename}`);
});

// Crear favicon.ico (versión simple)
const faviconSVG = createIconSVG(32);
const faviconPath = path.join(publicDir, 'favicon.svg');
fs.writeFileSync(faviconPath, faviconSVG);
console.log('✅ Creado favicon.svg');

// Crear apple-touch-icon
const appleIconSVG = createIconSVG(180);
const appleIconPath = path.join(publicDir, 'apple-touch-icon.svg');
fs.writeFileSync(appleIconPath, appleIconSVG);
console.log('✅ Creado apple-touch-icon.svg');

console.log('\n🎉 Iconos generados exitosamente!');
console.log('📁 Ubicación: /public/');
console.log('📋 Archivos creados:');
console.log('   - icon-192.svg');
console.log('   - icon-512.svg');
console.log('   - favicon.svg');
console.log('   - apple-touch-icon.svg');
