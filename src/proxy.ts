import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login', '/signup']

function isPublicRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  )
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis de ambiente não estão configuradas, passa sem autenticação
  if (!supabaseUrl || !supabaseKey) {
    console.error('[proxy] Missing Supabase env vars')
    return supabaseResponse
  }

  let user = null

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // IMPORTANTE: getUser() valida o JWT no servidor (não usa cache como getSession())
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    // Se Supabase não está acessível, trata usuário como não autenticado
    // e permite acesso a rotas públicas
    console.error('[proxy] Supabase auth error:', error)
  }

  const pathname = request.nextUrl.pathname
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isPublic = isPublicRoute(pathname)

  // Usuário sem sessão tentando acessar rota protegida → /login
  if (!user && !isPublic && !isAuth) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Usuário autenticado tentando acessar /login ou /signup → /dashboard
  if (user && isAuth) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
