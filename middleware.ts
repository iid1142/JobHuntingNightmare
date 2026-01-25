import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Import the type

export const config = {
  matcher: '/',
};

export default function middleware(req: NextRequest) { // Type the parameter here
  const userAgent = req.headers.get('user-agent') || '';
  const bots = /Twitterbot|facebookexternalhit|Facebot|LinkedInBot|RedditBot/i;

  if (bots.test(userAgent)) {
    return new Response(
      `<html>
        <head>
          <title>Welcome to the Infinite Void</title>
          <meta property="og:title" content="The Infinite Void of Automated Rejections" />
          <meta property="og:image" content="https://welcometotheinfinitevoidofautomatedrejections.qzz.io/og-image.png" />
          <meta property="og:description" content="Where your career aspirations go to be ignored by an AI." />
        </head>
      </html>`,
      { headers: { 'content-type': 'text/html' } }
    );
  }

  return NextResponse.next();
}