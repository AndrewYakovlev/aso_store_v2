import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ANONYMOUS_TOKEN_COOKIE = 'anonymous_token';
const ANONYMOUS_USER_ID_COOKIE = 'anonymous_user_id';

export async function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Get anonymous token and user ID from cookies
  const anonymousToken = request.cookies.get(ANONYMOUS_TOKEN_COOKIE)?.value;
  const anonymousUserId = request.cookies.get(ANONYMOUS_USER_ID_COOKIE)?.value;
  
  // Add anonymous token to request headers if available
  if (anonymousToken) {
    requestHeaders.set('x-anonymous-token', anonymousToken);
  }
  
  if (anonymousUserId) {
    requestHeaders.set('x-anonymous-user-id', anonymousUserId);
  }

  // If no token exists and this is a page request (not API or static assets)
  if (!anonymousToken && !request.nextUrl.pathname.startsWith('/api') && 
      !request.nextUrl.pathname.includes('.')) {
    // Set a flag that the app needs to get anonymous token
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set('x-needs-anonymous-token', 'true');
    return response;
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};