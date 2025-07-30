## Pytania po wykonaniu projektu

1. Czy proponowany podział na abstrakcje jest sensowny?
2. Autentykacja, lub kupowanie samochodu może rzucić kilka rodzajów błędów. Czy najlepiej radzić sobie z nimi w bloku `try` i od razu rzucać responsy, czy lepiej stworzyć jakąś rozbudowaną instrukcję warunkową działającą w zależności od np. `error.message`?
3. Czy warto poszukać algorytmu produkującego krótsze hashe, czy wystarczy ucinać hash? Np. jako generator suffixu w ajdikach
