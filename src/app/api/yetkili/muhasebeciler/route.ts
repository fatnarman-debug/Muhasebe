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

// Service-role client — needed to create the accountant's auth user
function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function generateBenzersizKod(): string {
  const harfler = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let kod = ''
  for (let i = 0; i < 3; i++) {
    kod += harfler[Math.floor(Math.random() * harfler.length)]
  }
  for (let i = 0; i < 4; i++) {
    kod += Math.floor(Math.random() * 10).toString()
  }
  return kod
}

async function getShopForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from('muhasebe_dukkanlar')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

// GET /api/yetkili/muhasebeciler — list accountants for the current shop
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('muhasebeciler')
    .select('id, email, full_name, benzersiz_kod, is_active, created_at')
    .eq('dukkan_id', shop.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // How many customers are assigned to each accountant
  const ids = (data ?? []).map((m) => m.id)
  const counts: Record<string, number> = {}
  if (ids.length) {
    const { data: atamalar } = await supabase
      .from('musteri_atamalari')
      .select('muhasebeci_id')
      .in('muhasebeci_id', ids)
    for (const a of atamalar ?? []) {
      counts[a.muhasebeci_id] = (counts[a.muhasebeci_id] ?? 0) + 1
    }
  }

  const muhasebeciler = (data ?? []).map((m) => ({
    ...m,
    musteri_sayisi: counts[m.id] ?? 0,
  }))

  return NextResponse.json({ muhasebeciler })
}

// POST /api/yetkili/muhasebeciler — create new accountant (+ login user)
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  let body: { email?: string; full_name?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const full_name = body.full_name?.trim()
  const password = body.password
  if (!email || !full_name || !password) {
    return NextResponse.json(
      { error: 'email, full_name ve password zorunludur' },
      { status: 400 }
    )
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Şifre en az 8 karakter olmalıdır' },
      { status: 400 }
    )
  }

  // Generate a unique benzersiz_kod — retry on collision
  let benzersiz_kod: string | null = null
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateBenzersizKod()
    const { data: existing } = await supabase
      .from('muhasebeciler')
      .select('id')
      .eq('benzersiz_kod', candidate)
      .maybeSingle()

    if (!existing) {
      benzersiz_kod = candidate
      break
    }
  }

  if (!benzersiz_kod) {
    return NextResponse.json({ error: 'Benzersiz kod oluşturulamadı, tekrar deneyin' }, { status: 500 })
  }

  // 1) Create the auth login for the accountant (role=konsult)
  const admin = createAdmin()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role: 'konsult',
      dukkan_id: shop.id,
    },
  })

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? ''
    if (/already.*registered|already.*exists|duplicate/i.test(msg)) {
      return NextResponse.json({ error: 'Bu email adresi zaten kayıtlı' }, { status: 409 })
    }
    return NextResponse.json({ error: msg || 'Kullanıcı oluşturulamadı' }, { status: 500 })
  }

  // 2) Insert the muhasebeci row linked to that auth user
  const { data, error } = await supabase
    .from('muhasebeciler')
    .insert({
      dukkan_id: shop.id,
      email,
      full_name,
      benzersiz_kod,
      auth_user_id: created.user.id,
    })
    .select('id, email, full_name, benzersiz_kod, is_active, created_at')
    .single()

  if (error) {
    // Roll back the auth user so we don't leave an orphan login
    await admin.auth.admin.deleteUser(created.user.id)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Bu email adresi zaten kayıtlı' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ muhasebeci: { ...data, musteri_sayisi: 0 } }, { status: 201 })
}
