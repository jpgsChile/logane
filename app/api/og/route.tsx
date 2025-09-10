import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'home'
  
  if (type === 'raffles') {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              maxWidth: '800px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                marginBottom: '20px',
              }}
            >
              🎲
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '20px',
              }}
            >
              Rifas Activas
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#666',
                marginBottom: '30px',
                maxWidth: '600px',
              }}
            >
              Descubre las rifas disponibles en BASE Sepolia
            </div>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                🔄 Actualizar
              </div>
              <div
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                📱 Abrir MiniApp
              </div>
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#888',
                marginTop: '30px',
              }}
            >
              Contrato: 0x6c59...F8F4 • BASE Sepolia
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
  
  // Imagen por defecto (home)
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            maxWidth: '800px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}
          >
            🏆
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '20px',
            }}
          >
            Lo Gane
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#666',
              marginBottom: '30px',
              maxWidth: '600px',
            }}
          >
            Rifas Descentralizadas Transparentes en BASE
          </div>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              🎲 Ver Rifas
            </div>
            <div
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              🏆 Crear Rifa
            </div>
          </div>
          <div
            style={{
              fontSize: '16px',
              color: '#888',
              marginTop: '30px',
            }}
          >
            Hasta 9 premios únicos • Selección transparente • BASE Sepolia
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
