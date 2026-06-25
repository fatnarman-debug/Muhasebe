import { createServerClient } from '@supabase/ssr'
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

// GET /api/yetkili/musteriler — customers (with assignment) + accountants
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

  const { data: musteriler, error: mErr } = await supabase
    .from('client_companies')
    .select('id, name, org_no, city, email, phone, is_active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 })
  }

  const { data: muhasebeciler } = await supabase
    .from('muhasebeciler')
    .select('id, full_name')
    .eq('dukkan_id', shop.id)
    .order('full_name', { ascending: true })

  const nameById: Record<string, string> = {}
  for (const m of muhasebeciler ?? []) nameById[m.id] = m.full_name

  const ids = (musteriler ?? []).map((m) => m.id)
  const assignedTo: Record<string, string> = {}
  if (ids.length) {
    const { data: atamalar } = await supabase
      .from('musteri_atamalari')
      .select('musteri_id, muhasebeci_id')
      .in('musteri_id', ids)
    for (const a of atamalar ?? []) assignedTo[a.musteri_id] = a.muhasebeci_id
  }

  const withAssignment = (musteriler ?? []).map((m) => ({
    ...m,
    muhasebeci_id: assignedTo[m.id] ?? null,
    muhasebeci_name: assignedTo[m.id] ? nameById[assignedTo[m.id]] ?? null : null,
  }))

  return NextResponse.json({
    musteriler: withAssignment,
    muhasebeciler: muhasebeciler ?? [],
  })
}

// POST /api/yetkili/musteriler — create a new customer (client_company)
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

  let body: {
    name?: string
    org_no?: string
    address_line1?: string
    postal_code?: string
    city?: string
    email?: string
    phone?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const name = body.name?.trim()
  const org_no = body.org_no?.trim()
  const address_line1 = body.address_line1?.trim()
  const postal_code = body.postal_code?.trim()
  const city = body.city?.trim()

  if (!name || !org_no || !address_line1 || !postal_code || !city) {
    return NextResponse.json(
      { error: 'name, org_no, address_line1, postal_code ve city zorunludur' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('client_companies')
    .insert({
      user_id: user.id,
      name,
      org_no,
      address_line1,
      postal_code,
      city,
      country: 'SE',
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
    })
    .select('id, name, org_no, city, email, phone, is_active, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { musteri: { ...data, muhasebeci_id: null, muhasebeci_name: null } },
    { status: 201 }
  )
}
