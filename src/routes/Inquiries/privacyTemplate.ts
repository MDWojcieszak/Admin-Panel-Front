/**
 * The contact form's privacy notice template (GDPR art. 13), from the
 * backend's docs/inquiry-privacy-notice-template.md. The administrator's
 * details and the retention periods are filled in from the form; the other
 * {{…}} placeholders are left for the owner to complete by hand.
 */
const TEMPLATE = `## Informacja o przetwarzaniu danych osobowych

**Administrator.** Administratorem Twoich danych jest {{administratorName}}
{{, administratorAddress}}. Kontakt w sprawie danych: {{administratorEmail}}.

**Jakie dane i po co.** Przetwarzam dane podane w formularzu — imię, adres e-mail,
numer telefonu (jeśli go podasz) i treść wiadomości — wyłącznie po to, żeby odpowiedzieć
na Twoje zapytanie i, jeśli o to prosisz, przygotować ofertę.

**Podstawa prawna.**
- art. 6 ust. 1 lit. b RODO — działania na Twoje żądanie przed zawarciem umowy (np. gdy
  pytasz o sesję, odbitkę lub licencję),
- art. 6 ust. 1 lit. f RODO — mój prawnie uzasadniony interes, czyli udzielenie
  odpowiedzi na wiadomość i ochrona formularza przed nadużyciami.

**Ochrona przed spamem.** Aby chronić formularz przed nadużyciami, zapisuję
jednokierunkowy skrót (hash) Twojego adresu IP — nie da się z niego odtworzyć adresu.

**Odbiorcy.** Dane mogą trafić do podmiotów, które technicznie obsługują formularz
i pocztę: {{dostawca hostingu / serwera}}, {{dostawca poczty e-mail, np. nazwa usługi}}.
Nie sprzedaję ani nie udostępniam danych w celach marketingowych.
{{Jeśli dostawca poczty przetwarza dane poza EOG — dopisz tu podstawę transferu.}}

**Jak długo.** Zapytanie przechowuję przez {{retentionDays}} dni od ostatniej zmiany
(np. odpowiedzi), a następnie jest automatycznie usuwane. Wiadomości rozpoznane jako
spam usuwam po {{spamRetentionDays}} dniach. Korespondencja, którą prowadzimy dalej
mailowo, jest przechowywana w mojej skrzynce pocztowej {{tak długo, jak to potrzebne
do realizacji ustaleń / dopisz okres}}.

**Twoje prawa.** Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia,
ograniczenia przetwarzania oraz wniesienia sprzeciwu wobec przetwarzania opartego na
uzasadnionym interesie. Napisz na {{administratorEmail}}. Masz też prawo wnieść skargę
do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).

**Dobrowolność.** Podanie danych jest dobrowolne, ale bez adresu e-mail nie będę
mógł/mogła odpowiedzieć na wiadomość.
`;

type TemplateValues = {
  administratorName?: string | null;
  administratorEmail?: string | null;
  administratorAddress?: string | null;
  retentionDays: number;
  spamRetentionDays: number;
};

export const privacyNoticeFromTemplate = (v: TemplateValues) => {
  const keep = (value: string | null | undefined, placeholder: string) => value?.trim() || placeholder;
  return TEMPLATE.replace(
    /\n?\{\{, administratorAddress\}\}/g,
    v.administratorAddress?.trim() ? `, ${v.administratorAddress.trim()}` : '',
  )
    .replace(/\{\{administratorName\}\}/g, keep(v.administratorName, '{{administratorName}}'))
    .replace(/\{\{administratorEmail\}\}/g, keep(v.administratorEmail, '{{administratorEmail}}'))
    .replace(/\{\{retentionDays\}\}/g, String(v.retentionDays))
    .replace(/\{\{spamRetentionDays\}\}/g, String(v.spamRetentionDays));
};
