# Blog/CMS + Ecosystem — przewodnik integracji dla frontu

Jak działają mechanizmy i jak front ma się zachować, co wysyłać i **co/gdzie zapisać**. Backend trzyma intencję/dane; front renderuje i pilnuje UX. Model danych: `blog-design.md`. Audyt/wdrożenie: `blog-audit.md` / `blog-deployment.md`.

Pokrycie: panel redakcyjny (`/blog/*` staff), publiczny czytelnik (`/blog/*` public), aplikacja mobilna/ekosystem (`/ecosystem/*`).

---

## 1. Podstawy: auth, role, uprawnienia, tiery

### Autoryzacja
- **Wszystko wymaga `Authorization: Bearer <accessToken>`**, chyba że trasa jest `@Public`. Token to JWT (HS256) z access-flow; w body logowania dostajesz access+refresh. **Brak cookies** — token trzymasz sam (patrz §6).
- `request.user = { sub, email, role }`. `sub` = id usera.
- **Trasy „optional auth"** (publiczny odczyt + paywall): działają bez tokenu, ale **jeśli podasz Bearer**, backend rozpozna twój tier i odblokuje treść premium. Zawsze wysyłaj token jeśli user zalogowany.

### Role i uprawnienia (ACL)
- Rola **OWNER** omija wszystkie sprawdzenia uprawnień.
- Pozostali potrzebują konkretnych **permisji** (nadawanych przez grupy ACL). Permisje blogowe i kto ich potrzebuje:

| Permisja | Do czego |
|---|---|
| `blog.read` | Lista/podgląd postów (staff), **interakcje** (like/view/feedback). |
| `blog.read.draft` | Podgląd draftu/wersji/sekcji/kategorii draftu (staff preview). |
| `blog.write` | Edycja treści (posty, sekcje, tłumaczenia, autorzy, kategorie postów, **szablony, komentarze redakcyjne**). |
| `blog.publish` | Publikacja/cofnięcie/harmonogram/archiwum/przywrócenie/rollback. |
| `blog.version.prune` | Trwałe kasowanie ARCHIVED wersji (wąskie). |
| `blog.category.manage` | CRUD taksonomii (kategorie). |
| `blog.place.manage` | CRUD POI + kolekcji. |
| `blog.home.manage` | Builder strony głównej. |
| `blog.analytics` | Insighty postów (liczniki + komentarze feedbacku). |
| `blog.grant.manage` | Wystawianie grantów + zarządzanie kodami (wąskie, NIE w grupach seed). |

> Seed daje 2 grupy: **„Content Editor"** i **„Publisher"**. `blog.grant.manage` i `blog.version.prune` nadaje się ręcznie. Front panelu powinien **ukrywać akcje, do których user nie ma permisji** (i tak dostanie 403, ale UX lepszy gdy chowasz).

### Tiery dostępu (paywall) — oś niezależna od ACL
`PUBLIC < REGISTERED < PREMIUM`. Tier widza = `max(aktywne AccessGrant, REGISTERED jeśli zalogowany, PUBLIC)`. PREMIUM dają granty (zakup/subskrypcja/MANUAL/kod). Tier liczy backend — front go nie ustawia.

---

## 2. Modele zachowań (to musi rozumieć front)

### 2.1 Wersjonowanie (edytor vs czytelnik)
- Czytelnik zawsze widzi `publishedVersion`; edytor edytuje `draftVersion`.
- `PostResponse.hasUnpublishedChanges` (lub `draftVersionId !== publishedVersionId`) → pokaż badge **„Szkic / niepublikowane zmiany"**.
- **Autosave idzie do draftu** — nic publicznego się nie zmienia do `Publikuj`.
- **Edycja opublikowanego jest bezpieczna**: backend przy pierwszej edycji **klonuje** live → draft (lazy-clone, transparentnie; klonuje sekcje/zdjęcia/itemy/POI/**kategorie** + re-anchoruje komentarze). Front po prostu edytuje.
- Akcje stanu: `Publikuj` / `Zaplanuj(data)` / `Cofnij publikację` / `Archiwizuj` / `Przywróć` / `Rollback(wersja)`.
- **„Usuń post" = Archiwizuj** (odzyskiwalne). Twarde kasowanie tylko `blog.version.prune` na ARCHIVED wersjach.

### 2.2 i18n
- Każde żądanie treści przyjmuje `locale` (np. `?locale=pl`). Lista z `GET /blog/locales` (+ `defaultLocale`).
- **Fallback**: brak tłumaczenia → backend zwraca locale domyślny i ustawia `untranslated: true` → pokaż dyskretny znacznik „nieprzetłumaczone".
- **Struktura wspólna dla języków** — przełączenie języka w edytorze podmienia tylko **tekst** (title/body/caption/…); layout/zdjęcia/kolejność zostają.
- Publikacja: wszystkie języki wersji idą na żywo **razem** (brak per-język).
- SEO: użyj `hreflangs[]` (alternatywne `canonicalUrl` per locale) z `PublicPostResponse`.

### 2.3 Paywall (anty-leak — kluczowe)
- **Backend wycina treść premium — front NIGDY nie dostanie zablokowanej treści.**
- Sekcja powyżej tieru widza przychodzi jako `LockedSectionResponse { locked: true, requiredTier, ... }` **bez `body`**. Renderuj **placeholder + upsell** („Odblokuj w aplikacji").
- Cały post powyżej tieru → `PublicPostResponse.isTeaser: true` (tylko część PUBLIC + zachęta).
- **Nie chowaj treści CSS-em** — jej tam po prostu nie ma (celowe).

---

## 3. Katalog endpointów (po obszarach)

Skrót po obszarach (łącznie 125 endpointów; pełne kształty w audycie). Szczegóły najważniejszych shape'ów w sekcji 4.

### 3.1 CONTENT — czytelnik publiczny (no-auth, optional token)
| Metoda | Ścieżka | Zwraca |
|---|---|---|
| GET | `/blog/posts/public` (`?locale,category,region,series,skip,take`) | `PublicPostListResponse` (karty, bez body) |
| GET | `/blog/posts/public/:slug` (`?locale`) | `PublicPostResponse` (paywall, sekcje visible/locked) |
| GET | `/blog/locales` *(blog.read)* | locale + default |

### 3.2 CONTENT — panel redakcyjny (staff)
| Metoda | Ścieżka | ACL |
|---|---|---|
| GET | `/blog/posts` (`?status,search,skip,take`) | blog.read |
| GET | `/blog/posts/:id` · `/blog/posts/:id/draft` (`?locale`) | blog.read · blog.read.draft |
| POST·PATCH | `/blog/posts` · `/blog/posts/:id` | blog.write |
| PUT | `/blog/posts/:id/translations/:locale` | blog.write |
| PUT | `/blog/posts/:id/authors` (SET, ≥1 AUTHOR) | blog.write |
| GET·PUT | `/blog/posts/:id/categories/draft` · `/blog/posts/:id/categories` (SET) | blog.read.draft · blog.write |
| PATCH | `/blog/posts/reorder` | blog.write |
| sekcje | `/blog/posts/:postId/sections` (GET/POST), `/blog/sections/:id` (PATCH/DELETE), `.../reorder`, `/blog/sections/:id/translations/:locale` | blog.write / blog.read.draft |
| media/listy/POI | `/blog/sections/:id/images`, `/blog/section-images/:imageId`, `/blog/sections/:id/items`, `/blog/section-items/:itemId`, `/blog/sections/:id/pois`, `/blog/section-pois/:poiLinkId` (+reorder +translations) | blog.write |
| lifecycle | `/blog/posts/:id/{publish,unpublish,schedule,archive,restore,rollback}` | blog.publish |
| GET·DELETE | `/blog/posts/:id/versions` · `/blog/posts/:id/versions/:versionId` | blog.read.draft · blog.version.prune |

### 3.3 DISCOVERY
| Metoda | Ścieżka | Auth |
|---|---|---|
| GET | `/blog/home` (`?locale`) | **public** — aktywny layout strony głównej |
| * | `/blog/home/layouts...` (CRUD, blocks, posts, activate) | blog.home.manage |
| GET | `/blog/search` (`?q,locale,take,skip`) | **public (optional auth)** — premium-aware |
| GET | `/blog/sitemap.xml` | **public** (PUBLISHED+PUBLIC, hreflang) |
| GET | `/blog/categories` (`?kind,view=ADMIN\|RESOLVED,locale`) | blog.read |
| * | `/blog/categories...` (create/patch/translations/delete) | blog.category.manage |
| GET | `/blog/poi` (`?category,region,country,includeClosed,take≤200,skip`) | **public** — mapa, bez pól internal |
| * | `/blog/poi/admin`, `/blog/poi/:id`, CRUD, hours, categories, images | blog.place.manage |
| GET | `/blog/collections/by-slug/:slug` (`?locale`) | **public** — ranked |
| * | `/blog/collections...` (CRUD, items, reorder, translations) | blog.place.manage |

### 3.4 ENGAGEMENT
| Metoda | Ścieżka | ACL |
|---|---|---|
| POST·DELETE | `/blog/posts/:postId/like` | blog.read |
| POST | `/blog/posts/:postId/view` | blog.read |
| GET | `/blog/posts/:postId/interactions` | blog.read |
| PUT·DELETE | `/blog/posts/:postId/feedback` | blog.read |
| GET | `/blog/posts/:postId/insights` | **blog.analytics** |
| CRUD | `/blog/posts/:postId/comments[...]` (redakcyjne, **internal**) | blog.write |
| CRUD | `/blog/templates[...]` (+blocks +reorder) | blog.write |
| POST | `/blog/posts/:postId/sections/apply/:templateId` | blog.write |

### 3.5 ECOSYSTEM (`/ecosystem/*` — konto/apka)
| Metoda | Ścieżka | Auth |
|---|---|---|
| GET | `/ecosystem/license/public-key` | **@Public** — klucz Ed25519 (PEM) |
| POST | `/ecosystem/devices/register` (throttle 5/min) | zalogowany |
| GET·DELETE | `/ecosystem/devices`, `/ecosystem/devices/:id` | zalogowany (tylko własne) |
| GET | `/ecosystem/devices/:id/license` | zalogowany — online renew licencji |
| POST | `/ecosystem/redeem` (throttle 10/min) | zalogowany |
| GET | `/ecosystem/grants/mine` | zalogowany |
| POST/GET/DELETE | `/ecosystem/grants`, `/ecosystem/grants/:id` | **blog.grant.manage** |
| POST/GET/DELETE | `/ecosystem/codes`, `/ecosystem/codes/:id` | **blog.grant.manage** |

---

## 4. Najważniejsze shape'y

**`PublicPostResponse`** (czytelnik): `{ postId, slug, accessTier, locale, isTeaser, title?, subtitle?, excerpt?, coverImageId?, readingMinutes?, metaTitle?, metaDescription?, canonicalUrl?, seoKeywords[], untranslated, hreflangs[], authors[], firstPublishedAt?, lastPublishedAt?, sections: (VisibleSection | LockedSection)[] }`. Sekcja locked: `{ id, type, order, locked:true, requiredTier }` (bez treści).

**`SearchResultsResponse`**: `{ results: [{ postSlug, title?, excerpt?(null gdy locked), accessTier, locked, rank }], total, locale }`. Locked = tier widza < tier posta → pokaż tytuł + „premium", **bez excerptu**.

**`InteractionStateResponse`**: `{ postId, liked, feedbackRating: HELPFUL|NOT_HELPFUL|null, viewCount, likeCount, helpfulCount, notHelpfulCount }` — stan widza + liczniki (do optymistycznego UI).

**`DeviceWithLicenseResponse`** (register): `{ device: { id, installationId, platform, name, activatedAt, lastSeenAt, revokedAt, licenseExpiresAt }, license: { license: <JWS>, expiresAt } }`.

**`LicenseResponse`**: `{ license: <compact EdDSA JWS>, expiresAt }`. Payload JWS (po weryfikacji): `{ iss:'blog', sub:userId, did:deviceId, iid:installationId, tier, iat, exp }`.

**`RedeemResultResponse`**: `{ message, grant: { tier, source:'REDEEM_CODE', expiresAt|null, ... } }`.

---

## 5. Kluczowe flows

### 5.1 Tworzenie i publikacja posta (panel)
`POST /blog/posts` (slug+locale) → `PUT .../translations/:locale` (inne języki) → `POST .../sections` + `PUT /blog/sections/:id/translations/:locale` + `POST /blog/sections/:id/images` → `PUT .../authors` (≥1 AUTHOR) → `PUT .../categories` (kind=POST) → `GET .../draft?locale=` (podgląd) → `POST .../publish`. Czytelnik: `GET /blog/posts/public/:slug`.

### 5.2 Edycja po publikacji
`GET /blog/posts/:id` (sprawdź `hasUnpublishedChanges`) → edytuj draft (lazy-clone dzieje się sam) → `POST .../publish` (poprzednia wersja → ARCHIVED).

### 5.3 Paywall / upsell (czytelnik)
Renderuj `sections` po kolei; dla `locked` → komponent „premium + CTA odblokuj w aplikacji"; gdy `isTeaser` → cały widok jako teaser. Tier podbijasz przez grant (zakup/kod) → po odświeżeniu treść się odblokowuje (wyślij Bearer).

### 5.4 Redeem kodu (web/app)
`POST /ecosystem/redeem { code }` → tworzy `AccessGrant` (tier z kodu) → tier widza rośnie natychmiast. Błędny/zużyty/wygasły kod → **generyczny błąd** (bez oracle). Limit 10/min.

### 5.5 Aktywacja urządzenia + licencja offline (APKA — krok po kroku)
1. **Raz**: `GET /ecosystem/license/public-key` → zapisz PEM i **zpinuj** (do weryfikacji offline; nie ufaj kluczowi z innego źródła).
2. Po zalogowaniu: `POST /ecosystem/devices/register { installationId, platform, name? }` → dostajesz `device` + `license` (JWS). Limit **2 aktywne urządzenia**/usera; ten sam `installationId` = renew (nie liczy się jako nowe); 3. nowe → 409 (pokaż „odepnij inne urządzenie").
3. **Offline**: weryfikuj `license` JWS lokalnie publicznym kluczem (alg **EdDSA**; **odrzucaj `alg≠EdDSA`**), sprawdzaj `exp`. `tier` z payloadu = uprawnienia offline. Trzymaj tolerancję zegara ±kilka min.
4. **Online renew przed `exp`**: `GET /ecosystem/devices/:id/license` → świeży JWS + przedłużone `licenseExpiresAt` (TTL z `BLOG_LICENSE_TTL_DAYS`, def 30 dni). Serwer NIE pushuje — apka musi odświeżać sama.
5. Zarządzanie: `GET /ecosystem/devices` (moje), `DELETE /ecosystem/devices/:id` (odepnij). Revoked nie pobierze licencji (404) i nie liczy się do limitu.

### 5.6 Strona główna i search
- Home: `GET /blog/home?locale=` → `blocks[]` (HERO/FEATURED_POSTS/CATEGORY_ROW/POST_GRID/MAP/TEXT) z już zresolwowaną treścią per typ. Renderuj wg `type`.
- Search: `GET /blog/search?q=&locale=` (wyślij Bearer jeśli zalogowany) → karty z `locked`/`accessTier`; locked = tytuł bez excerptu.

---

## 6. Co i gdzie zapisać po stronie klienta

| Co | Gdzie | Uwagi |
|---|---|---|
| `accessToken` (JWT) | pamięć/secure storage | wysyłaj w `Authorization: Bearer`. Na webie unikaj localStorage dla wrażliwego kontekstu. |
| `refreshToken` | secure storage | do odświeżania access (auth-flow appki). |
| **License JWS** (apka) | secure storage | używana offline; odśwież przed `exp`. |
| **Public key (PEM)** (apka) | secure storage + **pinning** | weryfikacja licencji offline; nie nadpisuj bez weryfikacji. |
| `installationId` | stabilny per instalacja | ten sam między restartami = renew, nie nowe urządzenie. |
| tier widza | cache (z `/grants/mine` lub z licencji) | tylko UX; **prawda jest serwerowa** — treści locked i tak nie ma w response. |

**Nigdy nie trzymaj** klucza prywatnego licencji (jest tylko na serwerze) ani „odblokowanej" treści premium (backend jej nie wysyła poniżej tieru).

---

## 7. Obsługa błędów

| Kod | Znaczenie | Reakcja frontu |
|---|---|---|
| 401 | brak/zły token | logowanie / odśwież token |
| 403 | brak permisji (ACL) | ukryj/zablokuj akcję; „brak uprawnień" |
| 404 | nie istnieje **lub nie twoje** (devices/grants/comments — bez oracle) | „nie znaleziono" |
| 400 | walidacja / zła operacja (np. kategoria nie-POST, kod nieprawidłowy) | komunikat (przy kodzie — generyczny) |
| 409 | konflikt (limit 2 urządzeń, kod już użyty, duplikat slug/key) | wyjaśnij + akcja (odepnij urządzenie itp.) |
| 429 | rate-limit (redeem 10/min, register 5/min) | „spróbuj za chwilę", backoff |

---

## 8. Drobne zachowania UI (ściąga)
- Badge **„Szkic/niepublikowane zmiany"** gdy `hasUnpublishedChanges`.
- Reorder przez `.../reorder` z `{ items:[{id,order}] }` (lub `{ ids:[] }` gdzie tak w shape) — wysyłaj pełną kolejność.
- Znacznik **„nieprzetłumaczone"** gdy `untranslated:true`.
- Paywall: placeholder + CTA dla `locked`/`isTeaser`; **nie** dociągaj treści — jej nie ma.
- „Usuń post" = **Archiwizuj** (odzyskiwalne); twarde kasowanie tylko wersji ARCHIVED.
- POI publiczne nie mają `internalNote`/`creatorVerdict`/`creatorRating` (tylko `/blog/poi/admin`).
- Komentarze redakcyjne są **wewnętrzne** — tylko panel (blog.write), nigdy czytelnik.
- Insighty/feedback-komentarze tylko dla `blog.analytics`.
