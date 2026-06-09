# Blog — projekt backendu

Status: **specyfikacja zatwierdzona, przed implementacją**
Stack: NestJS + Prisma + PostgreSQL (zgodnie z resztą projektu). Moduł zdjęć (`Image`) reużywany, nie duplikowany.
Architektura: **modularny monolit** — samodzielny moduł `blog/` w tym backendzie, z czystą granicą (zależności: `PrismaService`, moduł `Image`, ACL). NIE osobny serwis: blog ma twarde FK do `User`/`Image`/`PermissionGroup`, a publikacja to jedna transakcja DB — rozdzielenie zerwałoby integralność i wymagałoby duplikacji auth/tożsamości. Ekstrakcja możliwa później, gdyby pojawił się realny driver (osobny zespół / ruch publiczny wymagający niezależnego skalowania); wtedy ekstrahuje się najwyżej warstwę odczytu, nie cały serwis. Rozdział „publiczna strona vs panel" robimy na froncie, nie w backendzie.

Profesjonalny CMS bloga zarządzany w całości z tego projektu: posty wieloskładnikowe (sekcje), miejsca na mapie, kategorie, serduszka i wyświetlenia (na razie za ACL), wersjonowanie draft/published z pełną historią, planowana publikacja, granularne role (edycja vs publikacja) oraz kuratorowana strona główna.

---

## 1. Zasada przewodnia: enum vs tabela słownikowa

| Kiedy | Mechanizm |
|---|---|
| Zbiór stały, sterowany kodem (status, typ sekcji, sposób renderowania) | **Prisma enum** |
| Zbiór z wartościami customowymi w runtime + filtrowanie + label/ikona/kolor + (później) i18n | **Tabela słownikowa** `Category` z flagą `isSystem` |

„Enum + custom jako jeden select" realizuje tabela `Category`: front pokazuje wiersze `isSystem=true` (predefiniowane, seed) + customowe usera w jednym selekcie. Czysty enum Prisma odpada, bo nowa wartość = migracja. Wzorzec analogiczny do istniejącego `CategorySource`.

---

## 2. Decyzje projektowe (i ich uzasadnienie)

| Temat | Decyzja | Dlaczego |
|---|---|---|
| Sekcje | **W pełni relacyjne** (single-table inheritance: typowane kolumny per-typ + tabele potomne dla kolekcji) | Zero JSON, wszystko odpytywalne i typowane. Twarde FK dla zdjęć/punktów (reuse `Image`). Koszt: dodanie typu = migracja — świadomie zaakceptowany. |
| Geolokalizacja | **Nowy model `Poi`**, odseparowany od `Place`/`Location` | `Place` jest osobisty (owner/members/taski). Blog to treść publiczna — inna semantyka (region, kategoria atrakcji), brak sprzężenia. |
| Wyświetlenia | **Licznik `viewCount` + log `BlogPostView`** | Szybkie listy z licznika, analityka (unikalni, czas) z logu. |
| Strona główna | **Osobny kuratorowany `HomeLayout`** (bloki) | Pełna kontrola układu; źródło prawdy strony głównej. `featured` na poście usunięte (duplikat mechanizmu). |
| Wersjonowanie | **Draft/Published przez wskaźniki + pełna historia wersji** | „Piszę, każda zmiana zapisana, ale live się nie zmienia, dopóki nie opublikuję." Edycja opublikowanego posta nie rusza wersji publicznej. |
| Planowana publikacja | **`SCHEDULED` + `scheduledFor` + cron** | Profesjonalny blog planuje wpisy. |
| Lokalizacje/keywords | **W sekcjach** (źródło) + lekkie pola post-level | Unikamy duplikacji unii; pola post-level odpowiadają na inne pytania (zakres edytorski, meta SEO). |
| Role | **Rozdzielone `blog.write` vs `blog.publish`** | Można poprosić kogoś o zmianę bez prawa publikacji. |
| Obieg recenzji | **Pominięty na start** (sam podział permisji) | Można dodać stan `IN_REVIEW` później bez przebudowy. |
| Zakres edycji | **Jedno `blog.write` (edytuje wszystko)** | Prościej; rozdział own/all do dodania później. |
| Dostęp czytelnika (paywall) | **Oś `BlogAccessTier` (PUBLIC<REGISTERED<PREMIUM)**: `accessTier` na poście (globalny), `minAccessTier` na sekcji | Inna oś niż ACL personelu. Teaser publiczny + sekcje premium. Tier posta globalny (promo bez republikacji), tier sekcji wersjonowany. Mechanizm zakupu (entitlement) **odłożony** — osobna migracja przy płatnościach. |
| Komentarze edytorskie | **`BlogEditorialComment`** płaskie, kotwiczone do posta/sekcji + opcjonalny fragment tekstu | Wewnętrzne (jak piny w Figmie do komponentu), nigdy publiczne. Dostęp za `blog.write`. Wątki/resolve pominięte na start. |
| Media + tekst obok siebie | **Blok `MEDIA_TEXT`** + `mediaPosition` + `mediaSplit` (enum 5 podziałów) + `mobileStackOrder` | Kanoniczny layout magazynowy minimalnym kosztem; split = stała linia podziału (enum), mobile = pełna szerokość + kolejność. Reużywa `images`+`body`. |
| Tekst tre­ści | **Markdown w `body`** | Przenośne, proste; edytor robi styl, prezentację dają sekcje. Bez strukturalnego JSON. |
| Tekst na zdjęciu | **`overlayText` + `overlayPosition` (9-grid) + `overlayTheme` + `overlayBackdrop`** | Dwie osie: kolor tekstu i tło (NONE/SCRIM/GRADIENT/**GLASS**=glassmorphism). Bez free placement x/y%. |
| Presety palety | **Serwerowa `BlogSectionTemplate`(+Block), w pełni relacyjna** | Zarządzalne z backendu, współdzielone; otypowane domyślne wartości layoutu, bez JSON. |
| Feedback + analityka | **`BlogPostFeedback` (HELPFUL/NOT_HELPFUL+comment)** + liczniki na poście; widok = `blog.analytics` | „Czy przydatny?" na końcu posta; agregat (lajki+widoki+feedback) po stronie admina. Entitlement zbierania jak lajki (za `blog.read`). |

---

## 3. Enumy (18 rdzeniowych)

> Enumy POI/ekosystemu (`PoiPriceLevel`, `PoiSeason`, `Weekday`, `PoiDifficulty`, `PoiVerdict`, `PoiStatus`, `AccessGrantSource`, `AppPlatform`, `BlogAuthorRole`) opisane w §4.13 i §10.

```prisma
enum BlogPostStatus       { DRAFT  PUBLISHED  SCHEDULED  ARCHIVED }
enum BlogAccessTier       { PUBLIC  REGISTERED  PREMIUM }        // oś dostępu czytelnika (paywall)
enum VersionState         { DRAFT  PUBLISHED  ARCHIVED }
enum BlogSectionType      { HEADING  PARAGRAPH  QUOTE  CALLOUT  LIST  IMAGE  GALLERY  MEDIA_TEXT  MAP  PLACE  EMBED  DIVIDER }
enum CalloutVariant       { INFO  TIP  WARNING  SUCCESS }
enum EmbedProvider        { YOUTUBE  VIMEO  SPOTIFY  X  OTHER }
enum GalleryLayout        { GRID  CAROUSEL  MASONRY  FULLWIDTH }
enum BlogMediaPosition    { LEFT  RIGHT }                                 // MEDIA_TEXT: strona zdjęcia
enum BlogMediaSplit       { ONE_THIRD  TWO_FIFTHS  HALF  THREE_FIFTHS  TWO_THIRDS }  // udział kolumny foto (desktop)
enum BlogMobileStackOrder { MEDIA_FIRST  TEXT_FIRST }                     // kolejność na mobile (pełna szer.)
enum BlogImageSize        { SMALL  MEDIUM  LARGE  FULL  FULL_BLEED }      // semantyczny rozmiar (nie px)
enum BlogAspectRatio      { ORIGINAL  SQUARE  RATIO_4_3  RATIO_3_2  RATIO_16_9  RATIO_21_9  RATIO_65_24  RATIO_3_4  RATIO_2_3  RATIO_4_5  RATIO_9_16 }
enum BlogOverlayPosition  { TOP_LEFT … MIDDLE_CENTER … BOTTOM_RIGHT }     // siatka 9-punktowa
enum BlogOverlayTheme     { LIGHT  DARK }                                 // kolor tekstu overlay
enum BlogOverlayBackdrop  { NONE  SCRIM  GRADIENT  GLASS }                // tło pod tekstem (GLASS = glassmorphism)
enum BlogFeedbackRating   { HELPFUL  NOT_HELPFUL }                        // feedback „czy przydatny?"
enum CategoryKind         { POST  ATTRACTION }
enum HomeBlockType        { HERO  FEATURED_POSTS  CATEGORY_ROW  POST_GRID  MAP  TEXT }
```

---

## 4. Model danych

> **Źródło prawdy: `prisma/schema.prisma`.** Szkice poniżej ilustrują strukturę. Pola **tekstowe** (`title`/`subtitle`/`excerpt`/`body`/`keywords`/`caption`/`alt`/`overlayText`/`content`/`label`/`name`/`description`) **nie żyją inline** — są w tabelach `*Translation` per locale (§4.11). Prezentacja zdjęć: §4.8. Wzbogacenie POI (status/galeria/multi-kategoria/kolekcje/ocena wewnętrzna): §4.13.

### 4.1 Post + wersjonowanie

```prisma
model BlogPost {
  id     String         @id @default(uuid())
  slug   String         @unique
  status BlogPostStatus @default(DRAFT)
  accessTier BlogAccessTier @default(PUBLIC)  // paywall, §4.6
  order  Int?                              // ręczne sortowanie w panelu
  viewCount Int @default(0)
  likeCount Int @default(0)
  helpfulCount Int @default(0)              // §4.10
  notHelpfulCount Int @default(0)

  createdBy   User   @relation(fields: [createdById], references: [id])  // kto utworzył; byline w §4.13
  createdById String

  series   BlogSeries? @relation(fields: [seriesId], references: [id], onDelete: SetNull)  // §4.13
  seriesId String?
  seriesOrder Int?

  firstPublishedAt DateTime?
  lastPublishedAt  DateTime?
  scheduledFor     DateTime?               // dla SCHEDULED; cron przełącza na PUBLISHED
  archivedAt       DateTime?               // „usuń" = archiwizacja, §4.12

  // dwa wskaźniki na wersje:
  draftVersion       BlogPostVersion? @relation("DraftVersion",     fields: [draftVersionId],     references: [id])
  draftVersionId     String? @unique       // wersja AKTUALNIE edytowana
  publishedVersion   BlogPostVersion? @relation("PublishedVersion", fields: [publishedVersionId], references: [id])
  publishedVersionId String? @unique       // wersja widoczna PUBLICZNIE
  // hasUnpublishedChanges = draftVersionId !== publishedVersionId

  versions       BlogPostVersion[] @relation("AllVersions")
  authors        BlogPostAuthor[]          // byline (AUTHOR/CO_AUTHOR), §4.13
  likes          BlogPostLike[]
  views          BlogPostView[]
  feedback       BlogPostFeedback[]
  homeBlockPosts HomeBlockPost[]
  editorialComments BlogEditorialComment[]
  searchDocuments   BlogSearchDocument[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, firstPublishedAt])
  @@index([status, scheduledFor])
  @@index([createdById])
  @@index([order])
}

model BlogPostVersion {
  id            String       @id @default(uuid())
  post          BlogPost     @relation("AllVersions", fields: [postId], references: [id], onDelete: Cascade)
  postId        String
  versionNumber Int
  state         VersionState @default(DRAFT)

  // --- TREŚĆ (stagowana w wersji) ---
  title    String
  subtitle String?
  excerpt  String?
  coverImage   Image?  @relation(fields: [coverImageId], references: [id], onDelete: SetNull)
  coverImageId String?
  country  String?                         // zakres opisowy (filtr listy: „wpisy z Islandii")
  region   String?                         // województwo / region / stan
  seoKeywords String[]                      // kuratorowane do meta/OG + wyszukiwarki

  sections   BlogSection[]
  categories BlogVersionCategory[]          // taksonomia POST (stagowana)

  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // wskaźniki zwrotne
  draftOfPost     BlogPost? @relation("DraftVersion")
  publishedOfPost BlogPost? @relation("PublishedVersion")

  @@unique([postId, versionNumber])
  @@index([postId, state])
}
```

#### Przepływ wersji (lazy-clone)

| Akcja | Efekt |
|---|---|
| Utworzenie | wersja v1 (DRAFT). `draft=v1`, `published=null`, status=DRAFT |
| Pisanie / autosave | mutuje wersję draft. Nic publicznego się nie zmienia |
| Publikacja | draft → PUBLISHED, `publishedAt=now`; `published`=ta wersja; status=PUBLISHED |
| **Pierwsza edycja po publikacji** | klonuję live → nowa wersja DRAFT, `draft`=klon (live zamrożony) |
| Re-publikacja | nowy draft → PUBLISHED, `published`=on, poprzedni live → ARCHIVED |
| Rollback | `publishedVersionId` ustawiony na starszą wersję; klon jako nowy draft |

Wszystkie wersje zostają → pełna historia. `hasUnpublishedChanges = draftVersionId !== publishedVersionId`.
Czytelnik czyta `publishedVersion`; edytor zawsze `draftVersion`.

### 4.2 Sekcje (w pełni relacyjne, pod wersją)

```prisma
model BlogSection {
  id        String          @id @default(uuid())
  version   BlogPostVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
  versionId String
  type      BlogSectionType
  order     Int
  title     String?
  keywords  String[]                         // Ollama, źródłowe per-sekcja

  // scalary per-typ (single-table inheritance):
  body           String?                      // HEADING / PARAGRAPH / QUOTE / CALLOUT (markdown)
  headingLevel   Int?                         // 1..6 dla HEADING
  quoteAuthor    String?                      // QUOTE
  calloutVariant CalloutVariant?              // CALLOUT
  galleryLayout  GalleryLayout?               // GALLERY
  embedUrl       String?                      // EMBED
  embedProvider  EmbedProvider?               // EMBED

  // (paywall per-sekcja `minAccessTier` §4.6; MEDIA_TEXT `mediaPosition/mediaSplit/mobileStackOrder` §4.9)
  // kolekcje = tabele potomne:
  translations BlogSectionTranslation[]       // title/body/keywords per locale (§4.11)
  images BlogSectionImage[]                   // IMAGE / GALLERY
  items  BlogSectionListItem[]                // LIST
  pois   SectionPoi[]                         // MAP (wiele) / PLACE (zwykle jeden)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([versionId, order])
}

model BlogSectionImage {
  id        String      @id @default(uuid())
  section   BlogSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId String
  image     Image       @relation(fields: [imageId], references: [id])
  imageId   String
  caption   String?
  order     Int @default(0)
  @@unique([sectionId, imageId])
  @@index([sectionId, order])
}

model BlogSectionListItem {
  id        String      @id @default(uuid())
  section   BlogSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId String
  content   String
  order     Int @default(0)
  @@index([sectionId, order])
}

model SectionPoi {                           // sekcja ↔ POI
  id        String      @id @default(uuid())
  section   BlogSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId String
  poi       Poi         @relation(fields: [poiId], references: [id], onDelete: Cascade)
  poiId     String
  order     Int @default(0)
  @@unique([sectionId, poiId])
}
```

### 4.3 POI (miejsca) i kategorie

`Poi` to **wspólna encja podróżnicza** (seam blog ↔ apka-planer — patrz §10), nie tabela „blogowa". Tekst (name override/description) w `PoiTranslation`.

```prisma
model Poi {                                  // Point of Interest — współdzielony (§4.13, §10)
  id   String @id @default(uuid())
  name String                                // canonical (proper noun); localized override → PoiTranslation
  country String?  region String?  city String?  address String?
  latitude Float    longitude Float
  status PoiStatus @default(ACTIVE)           // ACTIVE / TEMPORARILY_CLOSED / PERMANENTLY_CLOSED
  // atrybuty podróżnicze (apka-planer):
  visitDurationMin Int?
  creatorRating    Int?                       // 1–5 publiczna waga dla AI
  creatorVerdict   PoiVerdict?                // WEWNĘTRZNE „czy nam się podobało" (nie publiczne)
  internalNote     String?                    // WEWNĘTRZNE (nie publiczne)
  priceLevel PoiPriceLevel?  bestSeasons PoiSeason[]
  websiteUrl String?  bookingUrl String?  mapsUrl String?
  difficulty PoiDifficulty?  distanceKm Float?  elevationGainM Int?   // trasy/aktywności; null = punkt
  coverImage   Image? @relation("PoiCover", fields: [coverImageId], references: [id])
  coverImageId String?
  translations PoiTranslation[]               // name override + description per locale (§4.11)
  hours        PoiHours[]                     // godziny per weekday
  images       PoiImage[]                     // galeria zdjęć
  categories   PoiCategory[]                  // many-to-many (wodospad + punkt widokowy)
  collections  PoiCollectionItem[]            // rankowane „top miejsc" (§4.13)
  sections     SectionPoi[]
}

model Category {                             // enum + custom
  id   String @id @default(uuid())
  kind CategoryKind
  key  String                                // canonical, np. "food"; label → CategoryTranslation (§4.11)
  icon String?  color String?
  isSystem Boolean @default(false)            // true = seed; false = custom usera
  order Int?
  translations CategoryTranslation[]
  posts BlogVersionCategory[]
  pois  PoiCategory[]
  @@unique([kind, key])
}

model BlogVersionCategory {                  // taksonomia POST stagowana w wersji
  id         String          @id @default(uuid())
  version    BlogPostVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
  versionId  String
  category   Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  @@unique([versionId, categoryId])
}
```

**Podział danych geo/keywords:**

| Dane | Gdzie | Po co |
|---|---|---|
| precyzyjne POI (lat/lng, kategoria atrakcji) | `SectionPoi` → `Poi` | treść konkretnej sekcji |
| `keywords[]` (Ollama) | `BlogSectionTranslation` | granularne, źródłowe, per locale |
| zakres opisowy `country`/`region` | `BlogPostVersion` | etykieta obszaru + filtr listy; nie POI |
| `seoKeywords[]` (kuratorowane) | `BlogPostVersionTranslation` | meta/OG + wyszukiwarka; per locale |
| kategorie POST (Podróże, Jedzenie) | `BlogVersionCategory` | edytorskie, 2–3 na post |
| kategorie ATTRACTION (wodospad…) | `Poi.categories` (`PoiCategory`) | cechy punktu (mnogie), filtr na mapie |

Mapa-overview posta i pełna lista keywordów = liczone z sekcji (nie duplikowane).

### 4.4 Interakcje (za ACL)

```prisma
model BlogPostLike {
  id     String   @id @default(uuid())
  post   BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  user   User     @relation(fields: [userId], references: [id])
  userId String
  createdAt DateTime @default(now())
  @@unique([postId, userId])
}

model BlogPostView {
  id     String   @id @default(uuid())
  post   BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  user   User?    @relation(fields: [userId], references: [id])   // null = anonim (gdy zdejmiemy ACL)
  userId String?
  createdAt DateTime @default(now())
  @@index([postId, createdAt])
}
```

`likeCount`/`viewCount` zdenormalizowane na poście (szybkie listy). „Za ACL" = endpointy lajka/widoku chronione `blog.read`; otwarcie publiczne = zdjęcie guarda.

### 4.5 Strona główna (kuratorowany layout)

```prisma
model HomeLayout {
  id       String  @id @default(uuid())
  name     String
  isActive Boolean @default(false)           // jeden aktywny = strona główna
  blocks   HomeBlock[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HomeBlock {
  id        String        @id @default(uuid())
  layout    HomeLayout    @relation(fields: [layoutId], references: [id], onDelete: Cascade)
  layoutId  String
  type      HomeBlockType
  order     Int
  title     String?
  category   Category? @relation(fields: [categoryId], references: [id])   // CATEGORY_ROW
  categoryId String?
  image      Image?    @relation(fields: [imageId], references: [id])      // HERO
  imageId    String?
  body       String?                          // TEXT
  limit      Int?                             // POST_GRID / FEATURED_POSTS
  posts      HomeBlockPost[]                  // kuratorowane (HERO / FEATURED_POSTS)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([layoutId, order])
}

model HomeBlockPost {
  id      String    @id @default(uuid())
  block   HomeBlock @relation(fields: [blockId], references: [id], onDelete: Cascade)
  blockId String
  post    BlogPost  @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId  String
  order   Int @default(0)
  @@unique([blockId, postId])
}
```

> Powyższe modele wymagają relacji zwrotnych do istniejących encji: `User` (createdPosts/blogAuthorships/likes/views/feedback/editorialComments/accessGrants/appDevices/redeemedCodes), `Image` (coverImage wersji/POI/home, sekcyjne i POI galerie, ogImage, okładki serii/kolekcji).

### 4.6 Paywall — dostęp czytelnika (oś niezależna od ACL)

```prisma
enum BlogAccessTier { PUBLIC  REGISTERED  PREMIUM }   // ordinalne: PUBLIC < REGISTERED < PREMIUM

// na BlogPost:
accessTier BlogAccessTier @default(PUBLIC)            // bramka całego posta (globalna, nie wersjonowana)
// na BlogSection:
minAccessTier BlogAccessTier @default(PUBLIC)         // bramka per-sekcja (wersjonowana)
```

Efektywny tier widza: anonim→`PUBLIC`, zalogowany→`REGISTERED`, opłacony→`PREMIUM`. Treść widoczna gdy `tierWidza >= wymagany`. Endpoint publiczny zwraca post, ale sekcje powyżej tieru widza podmienia na placeholder + flagę `locked` (teaser + paywall).

- `accessTier` na **poście** (globalny) — decyzja monetyzacyjna, zmienialna natychmiast (promo) bez republikacji.
- `minAccessTier` na **sekcji** (wersjonowany) — „teaser PUBLIC + reszta PREMIUM".
- **`blog.read` przestaje bramkować publiczny odczyt** — odczyt rządzi się tierem treści; `blog.read.draft` zostaje dla personelu (podgląd szkiców).
- **Entitlement (jak „wykupują dostęp") ODŁOŻONY** — subskrypcja/zakup per-post = osobna migracja przy budowie płatności. Efektywny tier widza liczony na razie z roli/zalogowania.

### 4.7 Komentarze edytorskie (wewnętrzne)

```prisma
model BlogEditorialComment {                 // jak piny w Figmie; nigdy publiczne
  id          String   @id @default(uuid())
  post        BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId      String
  section     BlogSection? @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId   String?                          // null = wątek ogólny posta
  anchorStart Int?                             // opcjonalny fragment tekstu w sekcji
  anchorEnd   Int?
  quote       String?                          // cache cytatu dla kontekstu
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  body        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([postId])
  @@index([sectionId])
}
```

Płaskie (bez wątków/resolve na start). Dostęp za `blog.write` (czytanie/pisanie). Przy klonowaniu draftu nierozwiązane komentarze przenosi logika aplikacji (re-anchor na nowe sekcje).

### 4.8 Prezentacja zdjęć (asset vs placement)

**Zasada:** `Image` (moduł zdjęć) to niezmienny asset — plik + warianty (original/cover/lowRes) + `Dimensions`. W blogu **przypinamy istniejący `Image`**; *jak* się wyświetla = placement per-użycie na `BlogSectionImage`. Pola dotyczą i pojedynczego `IMAGE`, i każdego kafelka `GALLERY`.

**Podział FE/BE:** backend trzyma **deklaratywną intencję semantyczną** (nie piksele), frontend renderuje responsywnie i wybiera wariant pliku przez `srcset`. Focal point trzymany **per-użycie** (nie na asset) — ta sama foto może kadrować się różnie w różnych sekcjach, bez ruszania modułu zdjęć.

```prisma
// BlogSectionImage — pola PREZENTACJI (językowo-neutralne):
size        BlogImageSize   @default(LARGE)    // SMALL/MEDIUM/LARGE/FULL/FULL_BLEED (nie px)
aspectRatio BlogAspectRatio @default(ORIGINAL) // otypowane proporcje (ORIGINAL/SQUARE/RATIO_16_9…)
focalX      Float?               // 0..1 punkt ostrości do responsywnego kadru
focalY      Float?
overlayPosition BlogOverlayPosition?   // siatka 9-punktowa
overlayTheme    BlogOverlayTheme?      // kolor tekstu: LIGHT/DARK
overlayBackdrop BlogOverlayBackdrop?   // tło pod tekstem: NONE/SCRIM/GRADIENT/GLASS
// tekst lokalizowany (caption, alt, overlayText) → BlogSectionImageTranslation (§4.11)
```

| Aspekt | Backend (DB) | Frontend |
|---|---|---|
| rozmiar | `size` semantyczny | mapuje na px per breakpoint |
| kadr | `aspectRatio` + `focalX/Y` | responsywny crop wokół focal pointu |
| wariant pliku | wystawia original/cover/lowRes + `Dimensions` | wybór przez `srcset` |
| tekst na foto | `overlayText` + `overlayPosition` (9-grid) + `overlayTheme` + `overlayBackdrop` | renderuje overlay + tło (scrim/gradient/glass) |

`overlayTheme` (kolor tekstu) i `overlayBackdrop` (tło) to dwie osobne osie — `GLASS` = efekt szkła (glassmorphism). **Świadomie pominięte:** sztywne px/kadr w bazie (łamią responsywność) oraz free placement `x%/y%` (kruche — 9-grid pokrywa większość).

### 4.9 Edytor — bloki, MEDIA_TEXT i presety

Trzy warstwy edytora: **bloki** (`BlogSectionType` = paleta), **warianty/layout** (pola per-blok: size, split, overlay…), **presety** (gotowe układy nad tymi samymi blokami).

`MEDIA_TEXT` (zdjęcie obok tekstu) — reużywa `images` (foto) i `body` (markdown):
```prisma
mediaPosition    BlogMediaPosition?     // LEFT / RIGHT
mediaSplit       BlogMediaSplit?        // linia podziału desktop; null = HALF
mobileStackOrder BlogMobileStackOrder?  // MEDIA_FIRST / TEXT_FIRST
```
**Reguła mobile:** `mediaSplit` rządzi tylko desktopem; poniżej breakpointa kolumny układają się **pionowo na pełną szerokość**, a `mobileStackOrder` decyduje o kolejności. To robi frontend — BE trzyma tylko intencję.

**Markdown:** `body` to markdown; edytor robi tylko styl, a prezentację „ogrywają" dobrze zaprojektowane sekcje (stąd bogate pola layoutu).

**Presety** — serwerowa, w pełni relacyjna tabela (bez JSON): `BlogSectionTemplate` (key, name, group, isSystem, order) + `BlogSectionTemplateBlock` (type + otypowane domyślne wartości layoutu: headingLevel, calloutVariant, galleryLayout, mediaPosition, mediaSplit, mobileStackOrder, imageSize, aspectRatio, overlayPosition + placeholderTitle/Body). Wybór presetu = utworzenie sekcji wg jego bloków.

### 4.10 Feedback czytelnika + analityka admina

Na końcu posta „czy przydatny?" — `BlogPostFeedback` (rating `HELPFUL/NOT_HELPFUL` + opcjonalny `comment`, `@@unique([postId, userId])`, anonim = NULL). Liczniki zdenormalizowane na `BlogPost`: `helpfulCount`, `notHelpfulCount` (obok `likeCount`, `viewCount`).

Zbieranie feedbacku/lajków = za ACL `blog.read` (jak dziś). **Widok agregatu = strona admina**: `GET /blog/posts/:id/insights` (lajki + widoki + helpful/not-helpful + ostatnie komentarze) za **`blog.analytics`**.

### 4.11 i18n — tłumaczenia per pole, wspólna struktura

**Zasada:** struktura (sekcje, kolejność, typy, layout, zdjęcia, focal pointy, współrzędne) jest **językowo-neutralna i wspólna**; lokalizuje się tylko **tekst**, w osobnych tabelach `*Translation` per locale. Markdown `body` to po prostu jedno z lokalizowanych pól. Jak „localized fields" w Contentful/Strapi.

**Rejestr języków:**
```prisma
model BlogLocale { code String @id  name String  isDefault Boolean  enabled Boolean  order Int? }
```
`locale` (BCP-47, np. "pl"/"en") w tabelach tłumaczeń to string walidowany aplikacyjnie względem `BlogLocale`. Jeden `isDefault` = fallback.

**Tekst wyprowadzony z tabel bazowych do tabel tłumaczeń** (`@@unique([parentId, locale])`, pola nullable → fallback do locale domyślnego w app). 7 rdzeniowych + `BlogSeriesTranslation`/`PoiCollectionTranslation` (§4.13):

| Tabela tłumaczeń | Pola | Z encji |
|---|---|---|
| `BlogPostVersionTranslation` | title, subtitle, excerpt, seoKeywords, **metaTitle, metaDescription, canonicalUrl, wordCount, readingMinutes** | `BlogPostVersion` |
| `BlogSectionTranslation` | title, **body (markdown)**, keywords | `BlogSection` |
| `BlogSectionImageTranslation` | caption, alt, overlayText | `BlogSectionImage` |
| `BlogSectionListItemTranslation` | content | `BlogSectionListItem` |
| `PoiTranslation` | name (override), description | `Poi` |
| `CategoryTranslation` | label | `Category` |
| `HomeBlockTranslation` | title, body | `HomeBlock` |

**Językowo-neutralne (zostają na bazowych):** `BlogPostVersion.country/region` (canonical, filtr), `BlogPostVersion.ogImageId` (obraz social share, domyślny wspólny), `Poi.name` (canonical/proper noun + identyfikator admina), `BlogSection.quoteAuthor`, `Category.key`, wszystkie pola layoutu/struktury/współrzędnych.

**SEO:** `metaTitle`/`metaDescription`/`canonicalUrl` per locale (na `BlogPostVersionTranslation`) + `ogImageId` na wersji (FK do `Image`, relacja `VersionOgImage`). `wordCount`/`readingMinutes` liczone przy publikacji per locale.

**Wersjonowanie:** tłumaczenia są dziećmi sekcji/wersji → **klonują się razem z wersją** przy publikacji (można mieć robocze tłumaczenia nieopublikowane). **Publikacja: wszystkie locale wersji idą na żywo razem** (per-język workflow = przyszłość). Presety (`BlogSectionTemplate`) zostają językowo-neutralne (tooling admina).

### 4.12 Usuwanie i archiwizacja (dwa poziomy)

**Poziom posta — brak twardego usuwania.**
- „Usuń post" = **archiwizacja**: `status = ARCHIVED` + `archivedAt`. Niewidoczny publicznie, ukryty z domyślnych list admina, **odzyskiwalny** (`/restore` → DRAFT). Akcja za `blog.publish`.
- Trwałego purge posta z poziomu aplikacji **nie ma** (brak utraty danych); ewentualnie ręcznie w bazie.

**Poziom wersji — prune historii.**
- Przy republikacji stara PUBLISHED → `state = ARCHIVED` + `archivedAt`.
- **Tylko wersje ARCHIVED można trwale usunąć** (`DELETE`, kaskada sekcji/tłumaczeń) za osobną **`blog.version.prune`**.
- **Invariant chroniący aktywną treść:** wersja wskazywana przez `draftVersionId`/`publishedVersionId` jest z definicji DRAFT/PUBLISHED, więc **nigdy nie kwalifikuje się do prune** — bez dodatkowej logiki.

Retencja: zapisujemy `archivedAt`; auto-purge (cron po N dniach) **odłożony** — czyszczenie świadome/ręczne.

### 4.13 Współautorstwo, serie, kolekcje „top miejsc"

**Autorzy i współautorzy (oba mnogie).** `BlogPost.createdBy` = kto utworzył wpis (system/„moje posty"). Byline przez `BlogPostAuthor` (join z **`role`** `AUTHOR`/`CO_AUTHOR` + `order`) — np. 2 autorów i 2 współautorów. Jeden user = jeden wpis na post (`@@unique([postId, userId])`). Kontrakt: ≥1 `AUTHOR`.

**Serie postów.** `BlogSeries` (slug, cover, tytuł/opis lokalizowane w `BlogSeriesTranslation`); post wskazuje `seriesId` + `seriesOrder` (cz. 1/2/3).

**POI wzbogacone:**
- `status` (`PoiStatus`: ACTIVE / TEMPORARILY_CLOSED / PERMANENTLY_CLOSED) — apka/blog wie, że nieczynne.
- Galeria: `PoiImage` (uporządkowane zdjęcia) obok `coverImage`.
- Wiele kategorii: `PoiCategory` (many-to-many) zamiast jednej (wodospad + punkt widokowy).
- Wewnętrzne: `creatorVerdict` (`PoiVerdict`: LOVED…SKIP) + `internalNote` — **prywatne**, do planowania; `creatorRating` (1–5) = publiczna waga dla AI.

**Kolekcje „top miejsc" (rankowane).** `PoiCollection` (slug, **scope: opcjonalne `country` + `region`**, `isPublic`, cover, tytuł/opis lokalizowane) + `PoiCollectionItem` (`poi`, `rank` 1=najważniejsze). Rozstrzyga „wśród 5× LOVED, które #1".
- **Granularność elastyczna przez scope:** Islandia = jedna kolekcja (`country=Iceland`); USA = wiele (per stan: `country=USA, region=California`, `…, region=Utah`). Brak sztywnego poziomu — każdy „top" to osobna kolekcja z własnym scope. Używane w blogu (sekcja „top miejsc") i apce (priorytet tras).

> Wewnętrzne pola (`internalNote`, `creatorVerdict`, kolekcje `isPublic=false`) **nie mogą wyciekać do publicznego API** — kontrakt serwisu.

---

## 5. ACL — permisje i grupy

Do `src/common/acl/permissions.ts`:

```
blog.read            // (personel) NIE bramkuje publicznego odczytu — patrz 4.6 accessTier
blog.read.draft      // podgląd wersji roboczych
blog.write           // tworzenie/edycja treści (draft + sekcje)
blog.publish         // publish / schedule / unpublish / archive / restore / rollback
blog.version.prune   // trwałe usunięcie wersji ARCHIVED z historii (osobny dostęp)
blog.category.manage
blog.place.manage
blog.home.manage
blog.analytics       // widok agregatu: lajki + widoki + feedback (strona admina)
```

Mapowanie endpointów: edycja → `blog.write`; `/publish`,`/schedule`,`/unpublish`,`/archive`,`/restore`,`/rollback` → `blog.publish`; prune wersji ARCHIVED → `blog.version.prune`; podgląd draftu → `blog.read.draft`; `GET .../insights` → `blog.analytics`. **Posty nie mają twardego usuwania** (tylko archiwizacja).

Seed grup (`PermissionGroup`):
- **Redaktor treści** → `blog.read`, `blog.read.draft`, `blog.write` (pisze, NIE publikuje).
- **Wydawca** → powyższe + `blog.publish`, `blog.category.manage`, `blog.place.manage`, `blog.home.manage`, `blog.analytics`.
- **`blog.version.prune`** → przyznawane osobno, wąskiemu gronu (nie domyślnie w Wydawcy).
- **OWNER** → bypass (istniejący).

---

## 6. Moduły i endpointy

Struktura wg konwencji projektu (`controller`/`service`/`module`/`dto`/`responses`/`mappers`), DTO przez `nestjs-swagger-dto`, paginacja przez `PaginationDto`.

```
src/blog/
  blog.module.ts
  post/        — CRUD draftu, lista, slug, reorder
  section/     — CRUD sekcji + tabele dzieci, reorder
  place/       — CRUD Poi, GET ?category= (mapa)
  category/    — CRUD Category, GET ?kind=
  template/    — CRUD BlogSectionTemplate (presety palety)
  interaction/ — like / view / feedback
  insights/    — GET /blog/posts/:id/insights (analityka admina, blog.analytics)
  home/        — CRUD HomeLayout/HomeBlock, GET /blog/home (aktywny)
  search/      — GET /blog/search?q=&locale= (Postgres FTS po BlogSearchDocument)
```

Szkic endpointów:
- `GET /blog/posts` (paginacja, filtr status/kategoria/region), `GET /blog/posts/:slug`, `GET /blog/posts/:id/draft`
- `POST /blog/posts`, `PATCH /blog/posts/:id`, `PATCH /blog/posts/reorder`
- `POST /blog/posts/:id/publish` `/schedule` `/unpublish` `/archive` `/restore` `/rollback`
- `DELETE /blog/posts/:id/versions/:versionId` (tylko ARCHIVED, `blog.version.prune`)
- `POST|PATCH|DELETE /blog/posts/:versionId/sections`, `PATCH .../sections/reorder`
- `GET|POST|PATCH|DELETE /blog/places`, `GET /blog/places?category=`
- `GET|POST|PATCH|DELETE /blog/categories?kind=`
- `POST|DELETE /blog/posts/:id/like`, `POST /blog/posts/:id/view`
- `GET /blog/home`, CRUD `HomeLayout`/`HomeBlock`

---

## 7. Seed kategorii systemowych

- `ATTRACTION`: jedzenie, wodospad, punkt widokowy, plaża, góra, zabytek, muzeum, park narodowy, nocleg, miasto.
- `POST`: Podróże, Jedzenie, Astro, Przewodnik, Natura.

---

## 8. Fazy implementacji

Zakres ustalony (blog podróżniczy, 2 os.): **pełne i18n PL+EN**, **pełna historia wersji**, rdzeń + **builder strony głównej** + **presety** + **komentarze-piny**. Jedyne odłożone: **gating paywalla** (pola zostają w schemacie, logika BE później).

1. **Fundament + treść (multi-locale)** — migracja; seed `BlogLocale` (pl, en), `Category` + `CategoryTranslation`, grupy uprawnień. `BlogPost`/`BlogPostVersion`/sekcje (wszystkie typy) + `*Translation` + zdjęcia. CRUD draftu per-locale, reorder. ACL `blog.write`/`blog.read.draft`.
2. **Wersjonowanie + publikacja** — lazy-clone **z tłumaczeniami**, publish/unpublish/archive/restore/rollback, prune ARCHIVED (`blog.version.prune`), `SCHEDULED`+cron. **Test cyklicznego FK na żywej bazie.**
3. **Mapa + taksonomia** — `Poi` (+`PoiTranslation`), powiązania sekcji, filtr kategoria/region, dane pod mapę.
4. **Search + SEO** — zasilanie `BlogSearchDocument` przy publikacji (per locale, `tsvector`), endpoint `/blog/search`; `metaTitle/Description/canonicalUrl/ogImage`, `wordCount/readingMinutes`.
5. **Strona główna (builder)** — `HomeLayout`/`HomeBlock`/`HomeBlockPost` + `HomeBlockTranslation`, `GET /blog/home`.
6. **Edytor+** — presety (`BlogSectionTemplate`), komentarze-piny (`BlogEditorialComment`).
7. **Interakcje + analityka** — lajki, log wyświetleń, feedback + `/insights` (`blog.analytics`).
8. **Odłożone** — gating paywalla (pola gotowe), Ollama (keywords/seoKeywords), retencja `BlogPostView`, redirecty slugów, Meilisearch przy skali.

ACL + seed grup (Redaktor/Wydawca; `blog.version.prune` osobno) — Faza 1–2. **i18n od Fazy 1**, bo tekst od początku żyje w tłumaczeniach.

---

## 9. Invarianty, ryzyka i świadome luki (z audytu)

### Invarianty wymuszane w aplikacji (single-table inheritance nie pilnuje ich w DB) — kontrakt serwisu
- **Walidacja pole↔typ sekcji**: DTO musi pilnować, że pola pasują do `type` (np. `PARAGRAPH` nie ma `galleryLayout`, `MEDIA_TEXT` ma dokładnie 1 zdjęcie). Baza tego nie wymusza.
- **Jeden `HomeLayout.isActive = true`** (brak partial-unique w Prisma) — pilnuje serwis.
- **`HomeBlock.category` musi być `kind = POST`** — pilnuje serwis.
- **Jeden `BlogLocale.isDefault = true`** — pilnuje serwis; to fallback tłumaczeń.
- **`locale` walidowany względem `BlogLocale`** (luźny string, brak FK) — serwis odrzuca nieznane kody. Języka **nie kasujemy twardo** (flaga `enabled = false`), bo osierociłoby wiersze tłumaczeń.
- **Prune tylko wersji `state = ARCHIVED`** — serwis odrzuca próbę usunięcia wersji będącej aktualnym draftem/published (i tak nie są ARCHIVED). Post: tylko archiwizacja, brak twardego usuwania z aplikacji.
- **Search indeksuje TYLKO treść PUBLIC** — zasilanie `BlogSearchDocument` pomija sekcje `minAccessTier > PUBLIC` (i posty `accessTier > PUBLIC`), inaczej snippet wyciekłby treść premium niepłacącym. Premium-aware search = później.
- **Pola wewnętrzne POI nie wyciekają** — `internalNote`, `creatorVerdict`, kolekcje `isPublic=false` nigdy w publicznym API.

### Ryzyka do potwierdzenia/obsłużenia
- **Cykliczny FK `BlogPost ↔ BlogPostVersion`** (draft/published ↔ postId): tworzenie = transakcja 3-krokowa (post→wersja→update wskaźnika); **kasowanie posta przetestować na żywej bazie** (może wymagać zerowania wskaźników przed delete). Wskaźniki są `SetNull`, postId `Cascade`.
- **Paywall — wycinanie po stronie BE**: endpoint publiczny MUSI omijać/maskować sekcje powyżej tieru widza (`accessTier` posta + `minAccessTier` sekcji). Nigdy nie wysyłać zablokowanej treści do klienta.
- **Drift liczników**: `viewCount/likeCount/helpful/notHelpfulCount` zdenormalizowane — inkrementacja w transakcji; okresowy rekoncyliacyjny przelicznik.
- **Kotwice komentarzy** (`anchorStart/End` po offsetach markdown) — kruche przy edycji; przy klonowaniu draftu re-anchor w logice aplikacji.
- **`BlogPostView` rośnie bez ograniczeń** — przy ruchu publicznym potrzebna retencja/rollup (agregacja dzienna).

### Świadome luki (do decyzji później)
- **Read-model / cache renderowania** — odczyt publiczny składa post z `publishedVersion` → sekcje → `*Translation`[locale] → obrazy/listy/POI; przy i18n to dużo joinów. Akceptowane dla 2-os. bloga; przy ruchu z Google warto **cache renderowanej treści per (post, locale)** (jak Ghost trzyma HTML), odświeżany przy publikacji. Optymalizacja, nie teraz.
- **Listowanie publiczne** joinuje `publishedVersion` + `*Translation` (pola karty są na wersji/lokalizowane). Akceptowane; indeksy dołożone. Ewentualna denormalizacja pól karty — odrzucona przy i18n (są lokalizowane).
- **Lajki anonimowe** — `BlogPostLike.userId` wymagane; otwarcie publiczne wymaga mechanizmu anon (cookie/IP). Spójne z „za ACL na teraz".
- **Email capture / analityka konwersji** (post → zakup apki) — istotne biznesowo, poza zakresem CMS; osobny temat.
- **Wyszukiwarka pełnotekstowa** (w schemacie): `BlogSearchDocument` — zdenormalizowany dokument per (post, locale), zasilany **przy publikacji** z opublikowanej wersji (drafty nieindeksowane), `searchVector Unsupported("tsvector")` + GIN. Zapytania `$queryRaw` z `to_tsquery`/`ts_rank`, `regconfig` zależny od locale (pl→'polish', en→'english'). Usuwany przy unpublish/archive. **Skala/typo-tolerancja później → Meilisearch/Typesense**; **Elastic odradzany** (ciężki operacyjnie, przesada dla bloga).
- **Redirecty starych slugów (301)**: brak modelu — SEO, do dołożenia.
- **Publikacja per-język**: na razie wszystkie locale wersji publikują się razem.
- **Overlay hero**: jeden `overlayText` (bez title+subtitle+CTA) — ewentualne wzbogacenie.

---

## 10. Ekosystem: apka-planer podróży (seam)

**Wizja:** mobilna apka planująca tripy (np. 7-dniowa Islandia) — „poradnik w telefonie". Buduje trasy/dni z **POI**, czerpie treść z bloga, a **zakup apki odblokowuje PREMIUM treści bloga**. Jeden ekosystem, wspólna baza (potwierdza modularny monolit — patrz nagłówek).

**Wspólny seam = `Poi`** (dawniej `BlogPlace`). Blog: sekcje wskazują POI (`SectionPoi`). Apka: buduje z tych samych POI trasy/dni. Pola pod planowanie:
- `latitude/longitude` (dokładna lokalizacja — killer apki; **routing po coords**: app-side deep-linki Apple/Google/Waze wg preferencji usera, multi-provider), `address`, `timezone` (IANA, „otwarte teraz?")
- `googlePlaceId` (unikat, dedup) / `osmId` — **tylko wzbogacenie/dedup**, NIE mechanizm map (Apple nie ma publicznego place-id)
- `visitDurationMin` (czas na miejscu), `bestSeasons`, `priceLevel`, `hours` (godziny/weekday), `status` (czynne/zamknięte)
- `creatorRating` (1–5, publiczna „jak warto") + `creatorVerdict`/`internalNote` (wewnętrzne) — **sygnały dla AI**
- trasy/aktywności: `difficulty`, `distanceKm`, `elevationGainM` (trasa górska itp.)
- linki: `websiteUrl/bookingUrl/mapsUrl`; galeria `PoiImage`; rankowane kolekcje „top" (`PoiCollection`)

**Paywall — driver konkretny.** `AccessGrant` (wspólny): `tier` (zwykle PREMIUM), `source` (APP_PURCHASE/SUBSCRIPTION/MANUAL), `expiresAt`, `reference`. Efektywny tier widza = `max(aktywne granty, bazowy z roli/logowania)`; blog gatinguje sekcje wg `minAccessTier`, apka wystawia grant po zakupie.

**Logika AI (apka, nie schemat):** dobór tras/dni z trybu podróżowania (intensywnie vs spokojnie) ważonego przez `creatorRating` + `visitDurationMin` + `difficulty` + `bestSeasons`. Schemat trzyma **sygnały**, AI je konsumuje.

**Świadomie odłożone do fazy apki (dodatki nie-łamiące — bez refaktoru):**
- Domena `Trip`/`Day`/`Stop` (itinerarz: dni, przystanki, kolejność, czasy przejazdów) — osobny moduł apki, wskaże na wspólne `Poi`.
- **Geometria tras** (waypointy/GPX/ślad) i zapytania geo (odległości, „w pobliżu") → **PostGIS** (`geography`/`geometry` + GiST) gdy trasy dostaną realne ślady.
- Logika płatności/sklepu (weryfikacja paragonów, odnawianie subskrypcji).
