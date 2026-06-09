# Blog — edytor „dokumentowy" (Notion-style): kontrakt zapisu dokumentu

> Notatka dla backendu. Frontend przechodzi na edytor w stylu Notion (jeden ciągły dokument,
> WYSIWYG, slash-menu „/", formatowanie inline). Treść tekstowa kompiluje się do **Markdown**.
> Żeby front nie musiał robić kruchego diffowania sekcji po stronie klienta, prosimy o jeden
> **kontrakt „zapisz cały dokument"**, który backend rozkłada na istniejące, relacyjne sekcje.

---

## 0. TL;DR — o co prosimy

1. **`PUT /blog/posts/:postId/document?locale=xx`** — przyjmuje **uporządkowaną listę bloków**
   (provider-neutralną, NIE JSON-a BlockNote) i **transakcyjnie** uzgadnia sekcje draftu:
   tworzy/aktualizuje/usuwa/reorderuje + ustawia relacje (obrazy, POI, pozycje listy).
2. Zwraca **odświeżony draft** (jak `GET draft`) **+ mapę `clientKey → sectionId`** dla nowo
   utworzonych bloków (żeby front nie musiał przeładowywać i gubić kursora).
3. Decyzja do podjęcia wspólnie: **jak mapujemy prozę** (rekomendacja: nagłówki/listy/cytaty/inline
   jako **Markdown w sekcji PARAGRAPH**, zamiast 1:1 na HEADING/QUOTE/LIST — patrz §2.4).

Reszta dokumentu to szczegóły: model bloku, kształty, algorytm uzgadniania, i18n, walidacje,
oraz alternatywa (batch-operacje), gdyby `PUT document` był niewygodny.

---

## 1. Kontekst i problem

Dziś edytor panelu operuje **per-sekcja**: osobne wywołania `createSection`, `patchSection`,
`upsertTranslation`, `deleteSection`, `reorderSections`, `addImage`, `addPoi`, `addItem`, …
To działa dla UI „dodaj blok przyciskiem", ale **nie** dla edytora typu Notion, gdzie użytkownik
płynnie pisze, wstawia „/image", przesuwa bloki, kasuje fragmenty — a stan dokumentu zmienia się
ciągle.

Gdyby front sam tłumaczył zmiany dokumentu na te wywołania, musiałby utrzymać **silnik
rekoncyliacji** (dopasowanie bloków do `sectionId`, wykrywanie move vs delete+create, kolejność,
relacje, per-locale). Jest to kruche i podatne na rozjazd stanu. Dlatego przenosimy uzgadnianie
**na backend**, w jednej transakcji, z jasnym kontraktem wejścia.

Zapisy nie są wysokiej częstotliwości — front debounce'uje (np. 800 ms po ostatniej zmianie i/lub
on-blur). Backend może traktować `PUT document` jako idempotentny „upsert całego dokumentu".

---

## 2. Model „dokumentu"

### 2.1 Zasada
Dokument = **uporządkowana lista bloków**. Pozycja w tablicy wyznacza `order` (backend nadaje
0,1,2,… — front nie wysyła `order`). Każdy blok ma `type` i pola zależne od typu.

### 2.2 Identyfikacja bloków
- `id?: string` — **istniejące** `sectionId`. Obecne → backend aktualizuje tę sekcję (zachowuje id,
  relacje, pozostałe locale).
- `clientKey?: string` — klucz nadany przez front dla **nowych** bloków (bez `id`). Backend zwraca
  mapę `clientKey → sectionId`, żeby front podmienił tymczasowe id bez reloadu.
- Brak `id` i brak dopasowania → **nowa** sekcja.
- Sekcja istniejąca w drafcie, **nieobecna** w payloadzie → **usuwana** (kaskadowo).

### 2.3 Typy bloków i pola (→ mapowanie na obecne sekcje)

Pola **tekstowe** (`markdown`, `caption`, `text`, `items[].content`) są **per-locale** (zapis dla
`?locale=`). Pola **layoutu i relacje** (id obrazów/POI, warianty, proporcje) są **language-neutral**.

| `type`       | Pola bloku | → Sekcja (typ) | Relacje / uwagi |
|--------------|------------|----------------|-----------------|
| `prose`      | `markdown` (per-locale) | `PARAGRAPH` | `body` = Markdown. Może zawierać nagłówki, listy, cytaty, **bold/italic/link/code** — patrz §2.4 |
| `callout`    | `variant` (`INFO\|TIP\|WARNING\|DANGER\|…`), `markdown` (per-locale) | `CALLOUT` | wariant = pole layoutu |
| `divider`    | — | `DIVIDER` | — |
| `image`      | `imageId`, `imageSize?`, `aspectRatio?`, `overlayPosition?`, `caption?` (per-locale) | `IMAGE` | „set" 1 obrazu (sectionImage) |
| `gallery`    | `imageIds: string[]`, `galleryLayout?` | `GALLERY` | „set" listy obrazów (kolejność = tablica) |
| `mediaText`  | `imageId`, `markdown` (per-locale), `mediaPosition?`, `mediaSplit?`, `mobileStackOrder?` | `MEDIA_TEXT` | obraz + tekst |
| `embed`      | `provider` (`YOUTUBE\|VIMEO\|…`), `url` | `EMBED` | — |
| `map`        | `poiIds: string[]` | `MAP` | „set" listy POI (kolejność = tablica) |
| `place`      | `poiId` | `PLACE` | „set" 1 POI |
| `list`*      | `ordered?: boolean`, `items: { content }[]` (content per-locale) | `LIST` | tylko jeśli nie redukujemy list do `prose` (§2.4) |
| `heading`*   | `level` (1–3), `text` (per-locale) | `HEADING` | tylko jeśli nie redukujemy nagłówków do `prose` (§2.4) |
| `quote`*     | `markdown` (per-locale), `author?` | `QUOTE` | tylko jeśli nie redukujemy cytatów do `prose` (§2.4) |

`*` — bloki opcjonalne, zależne od decyzji §2.4.

### 2.4 Decyzja: proza jako Markdown vs sekcje 1:1  ⚠️ wymaga ustalenia

W edytorze Notion nagłówki/listy/cytaty/pogrubienia to **naturalna część strumienia tekstu**.
BlockNote serializuje je do Markdown. Mamy dwie drogi:

- **(A — rekomendacja) Proza = Markdown w `PARAGRAPH`.** Ciągły fragment tekstu (akapity, nagłówki,
  listy, cytaty, inline) między blokami strukturalnymi → **jedna sekcja `PARAGRAPH`** z `body` w
  Markdown. Mniej sekcji, prostsze mapowanie, pełne formatowanie „za darmo".
  **Warunek:** czytelnik publiczny renderuje `PARAGRAPH.body` jako **bogaty Markdown** (nagłówki,
  listy, `**bold**`, linki, `code`). Sekcje `HEADING/QUOTE/LIST` zostają wtedy do **specjalnych,
  stylizowanych** użyć (np. wyróżniony hero-heading), nie do zwykłego tekstu.
- **(B) Mapowanie 1:1.** Każdy blok BlockNote → osobna sekcja (`heading`→`HEADING`,
  lista→`LIST`, cytat→`QUOTE`). Wierniejsze obecnej taksonomii, ale dużo więcej sekcji i bardziej
  złożona rekoncyliacja; listy BlockNote (osobne list-itemy) słabo mapują się na `LIST` z
  `items[]` per-locale.

**Rekomendacja: A.** Prościej, mniej ruchomych części, a render Markdown po stronie czytelnika i
tak jest potrzebny (`PARAGRAPH.body` już dziś jest Markdownem). Proszę o potwierdzenie, czy reader
renderuje pełny Markdown w `PARAGRAPH` — wtedy front wysyła nagłówki/listy/cytaty jako `prose`.

---

## 3. Endpoint zapisu

```
PUT /blog/posts/:postId/document?locale=pl
ACL: blog.write
```

### Request body
```jsonc
{
  "blocks": [
    { "id": "sec_123", "type": "prose",
      "markdown": "## Dzień 1\n\nWyruszyliśmy o świcie. Lista:\n- kawa\n- mapa\n\nTekst **pogrubiony** i [link](https://…)." },

    { "clientKey": "tmp-1", "type": "image",
      "imageId": "img_9", "imageSize": "LARGE", "aspectRatio": "RATIO_16_9", "caption": "Wschód nad fiordem" },

    { "id": "sec_55", "type": "map", "poiIds": ["poi_a", "poi_b"] },

    { "clientKey": "tmp-2", "type": "callout", "variant": "TIP", "markdown": "Zabierz wodę." }
  ]
}
```

Reguły:
- Kolejność tablicy = kolejność sekcji. Front **nie** wysyła `order`.
- `id` obecne → update istniejącej sekcji; brak `id` → nowa (z `clientKey`).
- Sekcje draftu nieobecne w `blocks` → usuwane.
- Pola tekstowe zapisywane dla `?locale`; layout/relacje globalnie. Inne locale nietknięte.

### Response (200)
```jsonc
{
  "draft": { /* pełny kształt jak GET draft: sekcje z id, relacjami, translations */ },
  "created": { "tmp-1": "sec_777", "tmp-2": "sec_778" },   // clientKey → nowe sectionId
  "hasUnpublishedChanges": true,
  "versionId": "ver_…"
}
```

Front po odpowiedzi: podmienia `clientKey` na realne `id` w swoim modelu (bez reloadu), nie musi
odświeżać całego dokumentu.

### Współistnienie z obecnym API
`PUT document` może **zastąpić** per-sekcyjne wywołania w edytorze panelu (zostawiamy je dla
ewentualnych integracji/migracji), albo żyć obok. Z perspektywy frontu wystarczy `PUT document`
+ istniejące `GET draft` (load) + lifecycle (publish/schedule/…).

---

## 4. Odczyt

Wystarczy **istniejący `GET draft`** (sekcje już są uporządkowane i zawierają relacje + translations).
Front zmapuje sekcje → bloki dokumentu odwrotnie do tabeli §2.3 (i sklei sąsiednie `PARAGRAPH` w
strumień prozy, jeśli przyjmiemy wariant A). Dedykowany „GET document" nie jest konieczny, ale
mile widziany, jeśli chcecie zwracać już-pogrupowaną reprezentację bloków (oszczędza logikę na
froncie).

---

## 5. i18n — co jest wspólne, a co per-locale

Zgodnie z obecnym modelem (struktura wspólna, tekst per-pole/locale):
- **Wspólne (language-neutral), nadpisywane globalnie przez `PUT document`:** istnienie bloków,
  kolejność, typy, `imageId`/`imageIds`/`poiId`/`poiIds`, warianty layoutu (size, ratio, gallery
  layout, media position…).
- **Per-locale (zapis tylko dla `?locale`):** `markdown`, `caption`, `text`, `quote.author`,
  `list.items[].content`.

Konsekwencje (świadome, zgodne z modelem):
- Zapis dokumentu w PL, który **dodaje/usuwa/reorderuje** bloki, zmienia **strukturę dla wszystkich
  locale**; tekst EN dla usuniętych bloków znika kaskadowo.
- Nowy blok prozy dodany w PL ma **pusty** tekst EN do czasu edycji w EN — to oczekiwane.
- Edytując EN później, struktura już istnieje; aktualizują się tylko pola tekstowe.

(Otwarte pytanie §9: czy `PUT document` dla jednego locale **może** zmieniać strukturę, czy
strukturę zmieniamy tylko z „domyślnego" locale? Rekomendacja: może z każdego — struktura jest
wspólna i tak.)

---

## 6. Algorytm rekoncyliacji (po stronie backendu)

W jednej transakcji:

1. Wczytaj obecne sekcje draftu (mapę `sectionId → sekcja`).
2. Przejdź `blocks` po kolei, dla każdego:
   - jeśli `id` istnieje i **typ się zgadza** → **update**: pola layoutu (global), translation dla
     `?locale`, oraz relacje wg semantyki „**set/replace**" (obrazy, POI, items).
   - jeśli `id` istnieje, ale **typ inny** → usuń starą sekcję, utwórz nową (zachowaj pozycję).
   - jeśli brak `id` → **create** (zapamiętaj `clientKey → nowe id`).
3. Sekcje obecne w drafcie, a **nieobecne** w `blocks` → **delete** (kaskada: translations,
   sectionImages, sectionPois, listItems).
4. Ustaw `order` = indeks w tablicy.
5. Zwróć odświeżony draft + `created` (clientKey→id) + `hasUnpublishedChanges/versionId`.

Relacje „set":
- `image`: ustaw dokładnie 1 sectionImage = `imageId`.
- `gallery`: ustaw listę sectionImages = `imageIds` (kolejność = tablica).
- `map`: ustaw listę sectionPois = `poiIds`; `place`: dokładnie 1 = `poiId`.
- `list`: ustaw `items` (z `content` dla `?locale`; kolejność = tablica).

---

## 7. Walidacje / invarianty / błędy

- `imageId`/`poiId` muszą istnieć i należeć do dozwolonego zasobu → inaczej `400`/`422` z listą
  niepoprawnych referencji.
- `gallery.imageIds` ≥ 1; `map.poiIds` ≥ 1; `place.poiId` wymagane; `embed.url` poprawny; `heading.level` ∈ {1,2,3}.
- Enumy (`variant`, `provider`, `aspectRatio`, `galleryLayout`, `mediaPosition`, …) walidowane jak dziś.
- Pusta `blocks: []` → dokument bez sekcji (dozwolone? — patrz §9).
- Transakcyjność: błąd dowolnego bloku → **rollback całości**, żaden zapis częściowy.
- Optimistic concurrency (opcjonalnie): przyjmować `versionId` z requestu i odrzucać `409`, jeśli
  draft zmienił się w międzyczasie (gdy edytuje dwóch redaktorów).

---

## 8. Alternatywa: batch-operacje (gdyby `PUT document` był niewygodny)

`POST /blog/posts/:postId/sections/batch` z listą operacji (`create|update|delete|reorder|setImages|setPois|setItems|upsertTranslation`)
wykonywanych transakcyjnie. Front i tak musiałby policzyć diff — **gorsze** niż `PUT document`,
więc preferujemy §3. Wspominamy tylko jako fallback.

---

## 9. Otwarte pytania do backendu

1. **§2.4**: akceptujemy wariant A (proza = Markdown w `PARAGRAPH`, reader renderuje pełny Markdown)?
   Jeśli nie — które bloki muszą zostać 1:1 (`HEADING/QUOTE/LIST`)?
2. Czy `IMAGE`/`MEDIA_TEXT` mają **caption** w modelu (per-locale)? Jeśli nie, a chcemy podpisy —
   dodać pole tłumaczenia.
3. Czy `PUT document` ma **zwracać** mapę `clientKey → sectionId` (preferowane), czy front ma
   re-fetchować draft i dopasowywać po kolejności?
4. Czy zmiana **struktury** dozwolona z każdego `locale`, czy tylko z domyślnego?
5. Optimistic concurrency (`versionId` + `409`) — wdrażamy od razu, czy później?
6. Czy `PUT document` **zastępuje** per-sekcyjne endpointy w edytorze, czy współistnieją?

---

## 10. Co front zrobi po swojej stronie (dla kontekstu)

- Edytor: **BlockNote** (Notion-style, ProseMirror) — jeden dokument, slash-menu, custom-bloki dla
  image/gallery/map/place/embed/callout/divider, reszta to proza→Markdown.
- **Load**: `GET draft` → sekcje → bloki dokumentu (sklejanie sąsiednich `PARAGRAPH` w prozę).
- **Save**: serializacja dokumentu → `blocks[]` → `PUT document?locale` (debounce + on-blur).
- Wybór obrazów: istniejący panel Media (Canva-style); wybór POI: istniejący `PoiPicker`.
- Per-locale: przełącznik języka w edytorze (jak dziś); struktura wspólna, tekst per-locale.
