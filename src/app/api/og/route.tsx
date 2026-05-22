import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'UNLOCKCUSCO';
    const description = searchParams.get('description') || 'Discover the Sacred Valley of the Incas';
    const rating = searchParams.get('rating');
    const image = searchParams.get('image');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            backgroundImage: image ? `url(${image})` : 'linear-gradient(to bottom right, #0f172a, #1e1b4b)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              color: 'white',
              zIndex: 10,
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 16,
                lineHeight: 1.1,
                fontFamily: 'Playfair Display, serif',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {title}
              {rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 40, background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ color: '#fbbf24' }}>★</span> {rating}
                </div>
              )}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '900px',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </div>

            {/* Logo/Brand */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 40, gap: '12px' }}>
              <div style={{ width: 40, height: 40, background: '#e11d48', borderRadius: 20 }} />
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.1em' }}>UNLOCKCUSCO</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
