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

async function getShopForUser(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('muhasebe_dukkanlar')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

async function verifyAccountantBelongsToShop(
  supabase: ReturnType<typeof createClient>,
  muhasebecId: string,
  shopId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('muhasebeciler')
    .select('id')
    .eq('id', muhasebecId)
    .eq('dukkan_id', shopId)
    .maybeSingle()

  return !!data
}

// DELETE /api/yetkili/muhasebeciler/[id]
// Optional query param: transfer_to=<other_muhasebeci_id>
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  const { id } = params
  const belongs = await verifyAccountantBelongsToShop(supabase, id, shop.id)
  if (!belongs) {
    return NextResponse.json({ error: 'Muhasebeci bulunamadı' }, { status: 404 })
  }

  const url = new URL(request.url)
  const transferTo = url.searchParams.get('transfer_to')

  if (transferTo) {
    // Verify the transfer target also belongs to this shop
    const transferBelongs = await verifyAccountantBelongsToShop(supabase, transferTo, shop.id)
    if (!transferBelongs) {
      return NextResponse.json(
        { error: 'Devir yapılacak muhasebeci bu dükkana ait değil' },
        { status: 400 }
      )
    }

    // Transfer all customer assignments from deleted accountant to the target
    const { error: transferError } = await supabase
      .from('musteri_atamalari')
      .update({ muhasebeci_id: transferTo })
      .eq('muhasebeci_id', id)

    if (transferError) {
      return NextResponse.json({ error: transferError.message }, { status: 500 })
    }
  } else {
    // No transfer target — remove assignments first to avoid FK violation
    const { error: deleteAssignmentsError } = await supabase
      .from('musteri_atamalari')
      .delete()
      .eq('muhasebeci_id', id)

    if (deleteAssignmentsError) {
      return NextResponse.json({ error: deleteAssignmentsError.message }, { status: 500 })
    }
  }

  const { error: deleteError } = await supabase
    .from('muhasebeciler')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// PATCH /api/yetkili/muhasebeciler/[id] — update accountant info
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const shop = await getShopForUser(supabase, user.id)
  if (!shop) {
    return NextResponse.json({ error: 'Dükkan bulunamadı' }, { status: 404 })
  }

  const { id } = params
  const belongs = await verifyAccountantBelongsToShop(supabase, id, shop.id)
  if (!belongs) {
    return NextResponse.json({ error: 'Muhasebeci bulunamadı' }, { status: 404 })
  }

  let body: { email?: string; full_name?: string; is_active?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.email !== undefined) updates.email = body.email.trim().toLowerCase()
  if (body.full_name !== undefined) updates.full_name = body.full_name.trim()
  if (body.is_active !== undefined) updates.is_active = body.is_active

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan belirtilmedi' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('muhasebeciler')
    .update(updates)
    .eq('id', id)
    .select('id, email, full_name, benzersiz_kod, is_active, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Bu email adresi zaten kayıtlı' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ muhasebeci: data })
}
