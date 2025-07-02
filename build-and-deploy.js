const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de build y preparación para despliegue...\n');

try {
  // 1. Instalar dependencias del front-end
  console.log('📦 Instalando dependencias del front-end...');
  execSync('cd front-end && npm install', { stdio: 'inherit' });
  
  // 2. Hacer build del front-end
  console.log('🔨 Haciendo build del front-end...');
  execSync('cd front-end && npm run build', { stdio: 'inherit' });
  
  // 3. Crear carpeta static en el back-end si no existe
  const staticDir = path.join(__dirname, 'Back-End', 'app', 'static');
  if (!fs.existsSync(staticDir)) {
    console.log('📁 Creando carpeta static en el back-end...');
    fs.mkdirSync(staticDir, { recursive: true });
  }
  
  // 4. Copiar archivos del build al back-end
  console.log('📋 Copiando archivos del build al back-end...');
  const buildDir = path.join(__dirname, 'front-end', 'build');
  
  // Función para copiar directorios recursivamente
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(buildDir, staticDir);
  
  console.log('✅ ¡Proceso completado exitosamente!');
  console.log('📝 El proyecto está listo para ser desplegado en Render.');
  console.log('💡 Recuerda:');
  console.log('   - Subir todo el contenido de la carpeta Back-End a tu repositorio');
  console.log('   - Configurar las variables de entorno en Render');
  console.log('   - El Procfile ya está configurado correctamente');
  
} catch (error) {
  console.error('❌ Error durante el proceso:', error.message);
  process.exit(1);
} 