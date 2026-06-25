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

// POST /api/yetkili/musteriler/[id]/ata  Body: { muhasebeci_id }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  const { id: musteriId } = await params

  let body: { muhasebeci_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const { muhasebeci_id } = body
  if (!muhasebeci_id) {
    return NextResponse.json({ error: 'muhasebeci_id zorunludur' }, { status: 400 })
  }

  // Verify the target accountant belongs to this shop
  const { data: muhasebeci } = await supabase
    .from('muhasebeciler')
    .select('id')
    .eq('id', muhasebeci_id)
    .eq('dukkan_id', shop.id)
    .maybeSingle()

  if (!muhasebeci) {
    return NextResponse.json(
      { error: 'Muhasebeci bu dükkana ait değil veya bulunamadı' },
      { status: 400 }
    )
  }

  // Verify the customer exists and belongs to this byråansvarig (RLS)
  const { data: musteri } = await supabase
    .from('client_companies')
    .select('id')
    .eq('id', musteriId)
    .maybeSingle()

  if (!musteri) {
    return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('musteri_atamalari')
    .upsert(
      { musteri_id: musteriId, muhasebeci_id },
      { onConflict: 'musteri_id' }
    )
    .select('id, musteri_id, muhasebeci_id, atanma_tarihi')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ atama: data }, { status: 200 })
}

// DELETE /api/yetkili/musteriler/[id]/ata — remove assignment
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  const { id: musteriId } = await params

  // Ensure the customer belongs to this byråansvarig (RLS)
  const { data: musteri } = await supabase
    .from('client_companies')
    .select('id')
    .eq('id', musteriId)
    .maybeSingle()

  if (!musteri) {
    return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
  }

  const { error } = await supabase
    .from('musteri_atamalari')
    .delete()
    .eq('musteri_id', musteriId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
