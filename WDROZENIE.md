# Cereaxis Labs — dokumentacja przekazania

Strona składa się z 11 statycznych podstron HTML i lokalnych zasobów w `assets/`. Pliki są gotowe do umieszczenia na standardowym hostingu. Na serwerze nie jest potrzebny system budowania aplikacji. Instrukcja dla osoby wgrywającej stronę znajduje się w `WGRYWANIE.txt`.

## Zakres

- Osobne podstrony marki, usług i każdej z trzech specjalizacji.
- Osobna wizytówka Michała Florczaka: cztery podane role, trwająca edukacja 2023–2028, języki, zdjęcie, LinkedIn i kontakt VCF.
- Osobne dokumenty prywatności, zasad serwisu oraz cookies i ustawień.
- Pełne tłumaczenie PL/EN, jasny motyw domyślny i ciemny motyw do wyboru.
- Sticky menu, responsywne reguły dla małych i dużych ekranów, animacje ograniczane przy `prefers-reduced-motion`, obsługa klawiatury.
- Oryginalne logo i ikona zachowane bez zmian w plikach; zachowany stosunek szerokości do wysokości 1520:264 oraz 512:512.
- Brak formularza kontaktowego, analityki, zewnętrznych fontów, reklam, map i osadzonych widżetów.

## Prywatność ustawień

Bez zgody nie następuje trwały zapis preferencji. Język i motyw są przenoszone w adresach podstron. Dobrowolna opcja w dialogu ustawień zapisuje pojedynczy klucz `cereaxis.preferences.v2` z polami `lang`, `theme`, `expires` i `consent`. Zapis wygasa po 180 dniach od ostatniego zapisania. Wycofanie lub reset usuwa klucz. Parametry adresu mogą znaleźć się w logach hostingu.

## Dane wymagające uzupełnienia

Użytkownik potwierdził, że marka nie jest jeszcze zarejestrowaną działalnością. Jako publiczny kontakt podał Poznań, województwo wielkopolskie, oraz `cereaxislabs@gmail.com`. Nie podano pełnego adresu ani dostawcy hostingu. Nie wprowadzono fikcyjnych danych rejestrowych.

Przed publikacją dokumenty wymagają pełnego adresu operatora oraz dopasowania do rzeczywistego hostingu, logów, retencji i ewentualnych technologii infrastrukturalnych. Te braki są jawne w dokumentach. Przygotowany regulamin dotyczy serwisu informacyjnego, a nie sprzedaży, płatnych usług lub indywidualnej umowy B2B. Treść dokumentów nie stanowi potwierdzenia pełnej zgodności prawnej nieznanej konfiguracji produkcyjnej.

Oficjalne źródła wykorzystane przy opracowaniu:

- [RODO — w szczególności art. 6, 12–13 i 15–22](https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32016R0679).
- [Ustawa o świadczeniu usług drogą elektroniczną — tekst ujednolicony, art. 5–8](https://eli.gov.pl/api/acts/DU/2024/1513/text/U/D20241513Lj.pdf).
- [Prawo komunikacji elektronicznej — tekst ujednolicony, art. 399–400](https://eli.gov.pl/api/acts/DU/2024/1221/text/U/D20241221Lj.pdf).
- [UODO — prawa i skargi](https://uodo.gov.pl/pl/493/155).
- [Google — prywatność](https://policies.google.com/privacy?hl=pl).
- [LinkedIn — prywatność](https://www.linkedin.com/legal/privacy-policy).

## Weryfikacja

Przeszły testy integralności lokalnych linków, fragmentów adresów, unikalności identyfikatorów, pojedynczego H1 na każdej podstronie, obecności atrybutów `alt` oraz zgodności sum kontrolnych oryginalnego logo i ikony. Składnia JavaScript została sprawdzona przez Node.

`tools/verify_site.cjs` uruchamia testy zachowania w emulatorze DOM: 11 podstron, tłumaczenia, parametry nawigacji, jasny motyw domyślny, opcjonalny zapis, 180 dni, przywrócenie, wycofanie, wygasanie, `file://`, menu i Escape. Nie zastępuje to kontroli rzeczywistego układu w przeglądarce.

Automatyczna kontrola wizualna aktualnej wersji była niemożliwa: narzędzie CUA nie uruchomiło środowiska, a dodatkowa próba w osobnym kontekście zgłosiła brak przeglądarki. Nie wykonano aktualnych screenshotów ani nie przedstawiono starych jako podglądu tej wersji. Układ należy jeszcze obejrzeć w docelowej przeglądarce na komputerze i telefonie.

## Edycja projektu

Treści i struktura: `tools/build_site.py`. Dokumenty: `legal_content.json`. Wygląd: `assets/site.css`. Interakcje: `assets/site.js`.

Po edycji źródeł uruchom lokalnie `python tools/build_site.py`. Nie jest to wymagane do działania już wygenerowanych plików na hostingu. Pierwsza wersja strony jest zachowana w `archiwum/index-pierwsza-wersja.html`.

Do paczki do hostingu wchodzą wyłącznie aktualne pliki HTML, `assets/` i `WGRYWANIE.txt`. Nie są w niej umieszczane narzędzia, zależności testowe, archiwum pierwszej wersji ani stare podglądy.
