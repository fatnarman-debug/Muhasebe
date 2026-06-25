import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/konsult/me — logged-in accountant's identity + assigned customers
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const admin = createAdmin()

  const { data: muhasebeci } = await admin
    .from('muhasebeciler')
    .select('id, full_name, benzersiz_kod, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // Logged-in user is not (yet) linked to an accountant record
  if (!muhasebeci) {
    return NextResponse.json({
      konsult: {
        full_name: user.user_metadata?.full_name ?? user.email,
        benzersiz_kod: user.user_metadata?.benzersiz_kod ?? null,
      },
      kunder: [],
    })
  }

  const { data: atamalar } = await admin
    .from('musteri_atamalari')
    .select('musteri_id')
    .eq('muhasebeci_id', muhasebeci.id)

  const ids = (atamalar ?? []).map((a) => a.musteri_id)

  let kunder: unknown[] = []
  if (ids.length) {
    const { data } = await admin
      .from('client_companies')
      .select('id, name, org_no, city, email, is_active')
      .in('id', ids)
      .order('name', { ascending: true })
    kunder = data ?? []
  }

  return NextResponse.json({
    konsult: {
      full_name: muhasebeci.full_name,
      benzersiz_kod: muhasebeci.benzersiz_kod,
    },
    kunder,
  })
}
