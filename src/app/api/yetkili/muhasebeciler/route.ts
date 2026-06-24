import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function createClient() {
  const cookieStore = cookies()
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

async function getShopForUser(supabase: ReturnType<typeof createClient>, userId: string) {
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
  const supabase = createClient()

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

  return NextResponse.json({ muhasebeciler: data })
}

// POST /api/yetkili/muhasebeciler — create new accountant
export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  let body: { email?: string; full_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const { email, full_name } = body
  if (!email || !full_name) {
    return NextResponse.json({ error: 'email ve full_name zorunludur' }, { status: 400 })
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

  const { data, error } = await supabase
    .from('muhasebeciler')
    .insert({
      dukkan_id: shop.id,
      email: email.trim().toLowerCase(),
      full_name: full_name.trim(),
      benzersiz_kod,
    })
    .select('id, email, full_name, benzersiz_kod, is_active, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Bu email adresi zaten kayıtlı' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ muhasebeci: data }, { status: 201 })
}
