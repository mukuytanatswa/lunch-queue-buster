import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const url = new URL(req.url);
  const cancelled = url.searchParams.get('cancelled') === '1';

  // After PayFast processes the payment, it redirects the WebView here.
  // We redirect the Capacitor WebView back into the app via http://localhost.
  const appPath = cancelled ? '/cart' : '/orders?payfast=1';
  const appUrl = `http://localhost${appPath}`;

  const title = cancelled ? 'Payment Cancelled' : 'Payment Complete';
  const message = cancelled
    ? 'Your payment was cancelled. Returning you to your cart...'
    : 'Your payment was successful! Returning you to your orders...';
  const color = cancelled ? '#dc2626' : '#16a34a';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — QuickBite</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f9fafb; color: #111827;
    }
    .card {
      text-align: center; padding: 2.5rem 2rem; max-width: 360px; width: 100%;
    }
    .icon { font-size: 3.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.4rem; font-weight: 700; color: ${color}; margin-bottom: 0.5rem; }
    p { font-size: 0.95rem; color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; }
    a {
      display: inline-block; background: ${color}; color: white;
      padding: 0.65rem 1.5rem; border-radius: 8px; text-decoration: none;
      font-weight: 600; font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${cancelled ? '❌' : '✅'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${appUrl}">Return to QuickBite</a>
  </div>
  <script>
    // Auto-redirect back into the Capacitor app after 1.5 s
    setTimeout(() => { window.location.href = ${JSON.stringify(appUrl)}; }, 1500);
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});
