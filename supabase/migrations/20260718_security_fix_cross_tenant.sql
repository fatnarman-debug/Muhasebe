-- ============================================================
-- GUVENLIK DUZELTMESI #1: Cross-tenant veri erisimi (yetkili_atamalar)
-- Sorun: Eski politika sadece muhasebeci_id'yi kontrol ediyordu,
--        musteri_id uzerinde predicate yoktu. Bir buro baskasinin
--        sirketini kendi muhasebecisine atayarak o tenant'in
--        musteri/fatura verilerine erisebiliyordu.
-- Cozum: Atanan musteri de AYNI buronun kendi musterisi olmali.
--        Hem USING (okuma/silme) hem WITH CHECK (ekleme/guncelleme).
-- ============================================================

drop policy if exists "yetkili_atamalar" on musteri_atamalari;

create policy "yetkili_atamalar" on musteri_atamalari
  for all
  using (
    muhasebeci_id in (
      select m.id from muhasebeciler m
      join muhasebe_dukkanlar d on m.dukkan_id = d.id
      where d.user_id = auth.uid()
    )
    and musteri_id in (
      select cc.id from client_companies cc
      where cc.user_id = auth.uid()
    )
  )
  with check (
    muhasebeci_id in (
      select m.id from muhasebeciler m
      join muhasebe_dukkanlar d on m.dukkan_id = d.id
      where d.user_id = auth.uid()
    )
    and musteri_id in (
      select cc.id from client_companies cc
      where cc.user_id = auth.uid()
    )
  );
