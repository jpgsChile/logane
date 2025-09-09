import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://v0-rifa-pps-mini-app-development.vercel.app'
  
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Lo Gane - Rifas Descentralizadas</title>
        <meta name="description" content="Participa en rifas transparentes en BASE. Hasta 9 premios únicos.">
        
        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="#764ba2">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Lo Gane">
        
        <!-- Splash Screen Meta Tags -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Lo Gane">
        
        <!-- Farcaster Mini App Meta Tags -->
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/api/og" />
        <meta property="fc:frame:button:1" content="🎲 Ver Rifas" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:2" content="🏆 Crear Rifa" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${baseUrl}/lo-gane" />
        <meta property="fc:frame:button:3" content="📱 Abrir MiniApp" />
        <meta property="fc:frame:button:3:action" content="link" />
        <meta property="fc:frame:button:3:target" content="${baseUrl}/lo-gane" />
        
        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="Lo Gane - Rifas Descentralizadas" />
        <meta property="og:description" content="Participa en rifas transparentes en BASE. Hasta 9 premios únicos. ¡Conecta tu wallet y gana!" />
        <meta property="og:image" content="${baseUrl}/api/og" />
        <meta property="og:url" content="${baseUrl}/lo-gane" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Lo Gane" />
        
        <!-- Twitter Card Meta Tags -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lo Gane - Rifas Descentralizadas" />
        <meta name="twitter:description" content="Participa en rifas transparentes en BASE. Hasta 9 premios únicos." />
        <meta name="twitter:image" content="${baseUrl}/api/og" />
        
        <!-- Manifest -->
        <link rel="manifest" href="/manifest.json">
        
        <!-- Icons -->
        <link rel="icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/icon-192.png">
        
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .splash-container {
            text-align: center;
            color: white;
            max-width: 400px;
            padding: 20px;
          }
          
          .logo {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: bounce 2s infinite;
          }
          
          .title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          
          .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
          }
          
          .loading {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin: 0 auto 1rem;
            overflow: hidden;
          }
          
          .loading-bar {
            height: 100%;
            background: white;
            border-radius: 2px;
            animation: loading 3s ease-in-out infinite;
          }
          
          .info {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 2rem;
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          
          @keyframes loading {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="splash-container">
          <div class="logo">🏆</div>
          <div class="title">Lo Gane</div>
          <div class="subtitle">Rifas Descentralizadas</div>
          
          <div class="loading">
            <div class="loading-bar"></div>
          </div>
          
          <div class="info">
            <p>Conectando con BASE Sepolia...</p>
            <p>Contrato: 0x6c59...F8F4</p>
          </div>
        </div>
        
        <script>
          // Redirigir a la MiniApp después de 3 segundos
          setTimeout(() => {
            window.location.href = '${baseUrl}/lo-gane';
          }, 3000);
        </script>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
