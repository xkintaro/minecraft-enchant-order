# Minecraft Enchantment Order

Minecraft büyülerini örste en düşük maliyetle birleştirmek için Next.js uygulaması.
Hesaplama altyapısı [iamcal/enchant-order](https://github.com/iamcal/enchant-order) projesinden uyarlanmıştır.

## Geliştirme

```sh
npm ci
npm run dev
```

`npm run lint`, `npm test` ve `npm run build` ile doğrulanır.

## Tema

Tema, GitHub `v0.1.0` sürümüne sabitlenmiş `@xkintaro/aether-theme` bağımlılığından gelir.
Özel depoya erişim gerektiği için geliştirme ve CI ortamının GitHub okuma yetkisi olmalıdır.
`src/app/globals.css` paketin fontlarını, açık/koyu renklerini, Tailwind v4 eşlemelerini ve tipografisini doğrudan yükler.
Yerel renk kopyası tutulmaz. Tema güncellemesi bağımlılığın ve kilit dosyasının bilinçli güncellenmesiyle yapılır.

`next-themes` açık/koyu tema seçimini saklar; varsayılan koyu temadır. `ThemeProvider`, HTML sınıfını yönetir.
Yeni arayüz ve shadcn bileşenleri `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`bg-primary`, `text-primary-foreground`, `border-border`, `border-input` ve `ring-ring` gibi semantik tokenları kullanmalıdır.
Yeni shadcn kurulumu sırasında Aether importunu koruyun ve ayrıca `:root` / `.dark` paleti üretmeyin.
Arayüzde Aether demosundaki gerçek shadcn/Base UI bileşenleri kullanılır.
`components/ui/` yeniden kullanılabilir bileşen kaynaklarını, `components/` hesaplayıcının bölümlerini içerir.
`components.json`, yeni shadcn bileşenleri eklemek için proje alias ve stil ayarlarını tanımlar.
Seçim, uyumluluk ve sonuçların geçerliliği `useEnchantCalculator` içinde yönetilir.
Arayüz bileşenleri yalnızca sunum ve kullanıcı etkileşimlerini yönetir; hesaplama motoru `lib/minecraft/engine.ts` içindedir.
Eşyalar tek bir listede gösterilir; eşya ve büyü araması, seçimi temizleme ve sıfırlama desteklenir.
Hesaplama kontrolleri ekranın altında sabit duran shadcn Drawer içindedir.
Kompakt çubuk, yarım açık ayarlar ve geniş panel arasında sürükleme veya düğmelerle geçiş yapılır.
Panel modal değildir; arka plandaki hesaplayıcı kullanılabilir. Hesaplama düğmesi her konumda görünür kalır.
Genişletme kontrolü yalnızca içeriğin normal panel yüksekliğine sığmadığı durumlarda gösterilir.
`ResizeObserver` ve viewport olayları metinlerin, içeriğin ve ekranın gerçek ölçülerini izler;
ekran genişlediğinde gereksiz büyük panel otomatik olarak normal yüksekliğe döner.
Header ve footer aynı `Wordmark` bileşenini kullanır.
`npm run format` kaynakları biçimlendirir; `npm run format:check` biçim tutarlılığını kontrol eder.

## Yerelleştirme

- Rotalar: `/en`, `/tr`, `/ru`, `/de`, `/es`, `/fr`, `/pt-BR`, `/ja`, `/ko`, `/zh-CN`.
  URL dil için tek kaynaktır; tarayıcı dili veya çerez URL'yi değiştirmez.
- `/` varsayılan `/en` rotasına yönlenir. Desteklenmeyen dil ve bulunmayan sayfalar 404 döner.
- `src/i18n/locales.json`: desteklenen diller ve kendi dillerindeki görünen adları. Rotalar ve testler bu tek katalogdan türetilir.
- `src/i18n/routing.ts`: varsayılan dil ve URL öneki politikası.
- `src/i18n/request.ts`: yalnızca istenen dilin sözlüğünü yükler.
- `src/i18n/navigation.ts`: dil farkındalığı olan Link ve yönlendirme yardımcıları.
- `src/proxy.ts`: dil önekleri ve yönlendirme; statik dosyalar kapsam dışıdır.
- `messages/<locale>.json`: her dil için arayüz, hata mesajları, metadata, rehber, eşya ve büyü adları.

Metinlerde dile göre koşul yazmayın. Yeni bileşenlerde `useTranslations()` ve sunucu bileşenlerinde
`getTranslations()` kullanın. Değişkenli ve çoğul metinler ICU MessageFormat kullanır:

```tsx
const t = useTranslations();
t('stepCount', {count: 5});
```

Sayılar `useFormatter()` ile seçili dile göre biçimlenir. Bileşenler çevirilere doğrudan hook ile erişir;
sözlük prop'ları taşınmaz. Next-intl anahtarları `src/i18n/types.d.ts` ile tip güvenlidir.
`html.lang`, başlık, açıklama, canonical ve alternatif dil bağlantıları rota diline göre üretilir.
Canonical bağlantıları görecelidir; üretim alan adı belirlendiğinde `metadataBase` eklenebilir.

Yeni dil eklemek için `en.json` anahtarlarının tamamını çeviren bir JSON oluşturun ve `locales.json` kataloğuna ekleyin.
Testler tüm kayıtlı dilleri otomatik bulur; eksik/boş anahtarları, hatalı ICU mesajlarını, temel çoğul durumlarını,
İngilizce bırakılmış rehber paragraflarını ve düğme adlarının tutarlılığını denetler.

Rehber üç somut adımdan oluşur: eşya ve büyü seviyelerini seçme, alttaki düğmeyle hesaplama,
örsün sol/sağ yuvalarını sonuçta gösterildiği gibi kullanma. Başlangıç koşulları ayrı bir notta açıklanır.

### Minecraft terimleri

`node scripts/sync-game-translations.mjs` yalnızca eşya/büyü adlarını günceller; uygulama metinlerini değiştirmez.
Büyü adları ve doğrudan eşya adları Minecraft Java **26.3** Mojang dil varlıklarından alınır.
Sürüm `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json` üzerinden bulunur;
varlıklar sürümün asset index dosyasındaki hash ile `https://resources.download.minecraft.net/` üzerinden okunur.
İngilizce terimler ve malzemeden bağımsız genel eşya kategorileri kaynak projenin `languages/` sözlüklerinden gelir.
Genel mızrak adı, malzemeye özgü oyun kimliklerinden ayrı olarak her dil için açıkça tanımlıdır.
Eksik terimler İngilizceye sessizce düşmez; güncelleme komutu hata verir.
