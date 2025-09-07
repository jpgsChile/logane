import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://v0-rifa-pps-mini-app-development.vercel.app'
  
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/api/og" />
        <meta property="fc:frame:button:1" content="🎲 Ver Rifas" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${baseUrl}/lo-gane" />
        <meta property="fc:frame:button:2" content="🏆 Crear Rifa" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${baseUrl}/lo-gane" />
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
