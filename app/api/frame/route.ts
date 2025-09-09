import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://v0-rifa-pps-mini-app-development.vercel.app'
  const url = new URL(request.url)
  const action = url.searchParams.get('action') || 'home'
  
  // Frame inicial
  if (action === 'home') {
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
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
          <meta property="og:title" content="Lo Gane - Rifas Descentralizadas" />
          <meta property="og:description" content="Participa en rifas transparentes en BASE. Hasta 9 premios únicos. ¡Conecta tu wallet y gana!" />
          <meta property="og:image" content="${baseUrl}/api/og" />
          <title>Lo Gane - Rifas Descentralizadas</title>
        </head>
        <body>
          <h1>Lo Gane - Rifas Descentralizadas</h1>
          <p>Participa en rifas transparentes en BASE. Hasta 9 premios únicos.</p>
          <a href="${baseUrl}/lo-gane">Ir a la MiniApp</a>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }
  
  // Frame de rifas activas
  if (action === 'raffles') {
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/api/og?type=raffles" />
          <meta property="fc:frame:button:1" content="🔄 Actualizar" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:2" content="📱 Abrir MiniApp" />
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${baseUrl}/lo-gane" />
          <meta property="fc:frame:button:3" content="🏠 Inicio" />
          <meta property="fc:frame:button:3:action" content="post" />
          <meta property="og:title" content="Rifas Activas - Lo Gane" />
          <meta property="og:description" content="Descubre las rifas activas en BASE Sepolia" />
          <meta property="og:image" content="${baseUrl}/api/og?type=raffles" />
          <title>Rifas Activas - Lo Gane</title>
        </head>
        <body>
          <h1>Rifas Activas</h1>
          <p>Descubre las rifas disponibles en BASE Sepolia</p>
          <a href="${baseUrl}/lo-gane">Ver todas las rifas</a>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }
  
  // Frame por defecto
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/api/og" />
        <meta property="fc:frame:button:1" content="🏠 Inicio" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:2" content="📱 Abrir MiniApp" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${baseUrl}/lo-gane" />
        <meta property="og:title" content="Lo Gane - Rifas Descentralizadas" />
        <meta property="og:description" content="Participa en rifas transparentes en BASE" />
        <meta property="og:image" content="${baseUrl}/api/og" />
        <title>Lo Gane - Rifas Descentralizadas</title>
      </head>
      <body>
        <h1>Lo Gane - Rifas Descentralizadas</h1>
        <p>Participa en rifas transparentes en BASE</p>
        <a href="${baseUrl}/lo-gane">Ir a la MiniApp</a>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://v0-rifa-pps-mini-app-development.vercel.app'
  
  try {
    const body = await request.json()
    const { untrustedData } = body
    
    if (untrustedData?.buttonIndex === 1) {
      // Botón "Ver Rifas" o "Actualizar"
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${baseUrl}/api/og?type=raffles" />
            <meta property="fc:frame:button:1" content="🔄 Actualizar" />
            <meta property="fc:frame:button:1:action" content="post" />
            <meta property="fc:frame:button:2" content="📱 Abrir MiniApp" />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="${baseUrl}/lo-gane" />
            <meta property="fc:frame:button:3" content="🏠 Inicio" />
            <meta property="fc:frame:button:3:action" content="post" />
            <meta property="og:title" content="Rifas Activas - Lo Gane" />
            <meta property="og:description" content="Descubre las rifas activas en BASE Sepolia" />
            <meta property="og:image" content="${baseUrl}/api/og?type=raffles" />
            <title>Rifas Activas - Lo Gane</title>
          </head>
          <body>
            <h1>Rifas Activas</h1>
            <p>Descubre las rifas disponibles en BASE Sepolia</p>
            <a href="${baseUrl}/lo-gane">Ver todas las rifas</a>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    
    if (untrustedData?.buttonIndex === 3) {
      // Botón "Inicio"
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
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
            <meta property="og:title" content="Lo Gane - Rifas Descentralizadas" />
            <meta property="og:description" content="Participa en rifas transparentes en BASE" />
            <meta property="og:image" content="${baseUrl}/api/og" />
            <title>Lo Gane - Rifas Descentralizadas</title>
          </head>
          <body>
            <h1>Lo Gane - Rifas Descentralizadas</h1>
            <p>Participa en rifas transparentes en BASE</p>
            <a href="${baseUrl}/lo-gane">Ir a la MiniApp</a>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    
    // Respuesta por defecto
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/api/og" />
          <meta property="fc:frame:button:1" content="🏠 Inicio" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:2" content="📱 Abrir MiniApp" />
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${baseUrl}/lo-gane" />
          <meta property="og:title" content="Lo Gane - Rifas Descentralizadas" />
          <meta property="og:description" content="Participa en rifas transparentes en BASE" />
          <meta property="og:image" content="${baseUrl}/api/og" />
          <title>Lo Gane - Rifas Descentralizadas</title>
        </head>
        <body>
          <h1>Lo Gane - Rifas Descentralizadas</h1>
          <p>Participa en rifas transparentes en BASE</p>
          <a href="${baseUrl}/lo-gane">Ir a la MiniApp</a>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
    
  } catch (error) {
    console.error('Error processing frame request:', error)
    return new NextResponse('Error processing request', { status: 500 })
  }
}
