## Pytania po wykonaniu projektu

1. Czy proponowany podział na abstrakcje jest sensowny?
2. Większość z metod (szczególnie w katalogu `/routes`), rzuca kilka rodzajów błędów. Czy zaproponowany przeze mnie sposób, tzn. wydzielenie obsługi błędów do osobnego pliku jest dobrą praktyką? Czy najlepiej radzić sobie z nimi w bloku `try` i od razu rzucać responsy, czy lepiej jednak rzucać błędy a w bloku `catch` stworzyć jakąś rozbudowaną instrukcję warunkową działającą w zależności od np. `error.message`?
3. Czy warto poszukać algorytmu produkującego krótsze hashe, czy wystarczy ucinać hash? Np. jako generator suffixu w ajdikach. [problem ten zapewne zniknie, gdy użyjemy prawdziwej BD z automatycznym `primary key`]
4. Czy hashowanie hasła lepiej przeprowadzać po stronie frontendu, żeby nie przesyłać hasła siecią? Czy sprawę załatwia `https` i jednak po stronie backendu hashujemy?

## Koncepcja podziału na pliki i katalogi

Podział na pliki wynika z wyróznienia kilku wartstw komunikacji frontendu z bazą danych:

1. index.ts - warstwa rozdzielająca ruch, uruchamiająca odpowiednią logikę w zależności od endpointu
2. /routes (users.ts, cars.ts) - warstwa wywołująca logowanie, obsługująca walidacje, obsługująca i przetwarzająca requesty, wysyłająca odpowiednie response'y (Controller we wzorcu MVC?)
3. /db - warstwa ogarniająca prawidłową komunikację z bazą danych, tzn. przygotowanie prawidłowego formatu zapisanych danych i wywołująca właściwą, "niskopoziomową" metodę zapisu danych z warstwy 4.
4. /db/jsondb.ts - plik zawierający metody odczytu i zapisu najniższego poziomu, operujące na systemie plików. Warstwę tę wydzieliłem po to, żeby łatwo było podmienić metodę zapisu danych - w przyszłości pewnie będzie to baza postgresql. W wyższej warstwie wystarczy podmienić funkcję lub sam import. Ważne, żeby interfejs metody się zgadzał.

## Logika CRUD dla usera i samochodu w zależności od uprawnień usera

zwykły user może

1. Updateować własny username i hasło, może usunąć własne konto
2. Kupić samochód

admin może:

1. usunąć usera
2. pełny CRUD dla samochodu

admin NIE powinien:

1. móc zmieniać username i password dla usera
