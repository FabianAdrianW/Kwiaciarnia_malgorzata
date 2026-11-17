# Kwiaciarnia Małgorzata, Oława

Strona wizytówka ze sklepem internetowym dla Kwiaciarni Małgorzata (ul. Jarosława Iwaszkiewicza 137A, Oława, tel. 570 740 729).

## Co jest w repo

| Plik | Co to |
|---|---|
| `index.html` | Strona główna: hero, galeria, szybkie zamówienie w 3 krokach, śluby, opinie, kontakt |
| `sklep.html` | Sklep: kategorie, karta produktu (wielkość, bilecik), koszyk, zamówienie z płatnością online albo przy odbiorze |
| `sukces.html` | Strona po udanej płatności |
| `data/products.json` | Katalog: produkty, ceny, dopłaty za wielkość, koszt dostawy. **Jedyne źródło cen** dla sklepu i płatności |
| `netlify/functions/create-checkout.mjs` | Funkcja, która tworzy płatność Stripe (BLIK, karta, Przelewy24). Ceny liczy po stronie serwera |
| `img/`, `fonts/` | Zdjęcia (WebP) i kroje pisma (Fraunces, Instrument Sans) hostowane lokalnie |
| `DESIGN.md` | Decyzje projektowe: paleta, typografia, układ, ruch, lista TODO |

Brak kroku budowania: to statyczny HTML/CSS/JS plus jedna funkcja Netlify.

## Wdrożenie na Netlify

1. Netlify, *Add new site*, *Import from Git*, wybierz to repo. Ustawienia zostaną wczytane z `netlify.toml`.
2. Zamówienia z formularzy (szybkie zamówienie i sklep) pojawiają się w *Forms*. W *Forms → Notifications* dodaj e-mail kwiaciarni.
3. Płatności online:
   - załóż konto Stripe dla kwiaciarni i włącz metody **BLIK** i **Przelewy24** (*Settings → Payment methods*),
   - w Netlify: *Site configuration → Environment variables* dodaj `STRIPE_SECRET_KEY` (najpierw klucz testowy `sk_test_…`, po testach klucz produkcyjny),
   - po wdrożeniu przetestuj zakup w trybie testowym.
   Bez klucza sklep działa dalej: płatność online pokazuje komunikat i przełącza na płatność przy odbiorze.
4. Podłącz domenę kwiaciarni w *Domain management*.

## Edycja oferty

Ceny i produkty zmienia się w `data/products.json`. Zdjęcie produktu wrzuć do `img/` (WebP, ok. 1100 px szerokości) i wpisz ścieżkę w polu `img`. Pole `alt` to opcjonalne drugie zdjęcie widoczne po najechaniu. Pozycje z `"from": true` (kompozycje, wieńce) mają cenę „od” i są opłacane przy odbiorze, po rozmowie.

## Do uzupełnienia (TODO)

- Logo w oryginalnej jakości (teraz miniatura z Facebooka: `img/logo-temp.png`)
- Zgoda kwiaciarni na użycie zdjęć z Facebooka i Google
- Ceny, nazwy i dopłaty za wielkość w `data/products.json` (teraz robocze)
- Koszt i strefa dostawy (teraz 20 zł)
- Godziny otwarcia w sekcji kontakt
- Regulamin sklepu i polityka prywatności (wymagane przy sprzedaży online)
