# Freigabe des Versicherungsmoduls

**Status: nicht freigegeben.** Es gibt keinen Partnervertrag und keine Prüfung der konkreten Ausgestaltung. `config/publishers/insurance/programs.json` ist leer, das Feature `commerce` ist im Markt DE aus, und die Bausteine erzeugen ohne beides keinen einzigen Anbieterlink.

Dieses Dokument ist die Checkliste für den Tag, an dem sich das ändern soll. Es ist **keine Rechtsberatung**, sondern eine Aufstellung dessen, was vor einer Freigabe beantwortet und belegt sein muss.

## Was technisch bereits steht (M09-01 bis M09-05)

| | |
|---|---|
| Vertragsschema | `src/domain/schemas/partner.ts` — `approved` verlangt Vertragsreferenz, Freigabedatum, Prüfnachweis, Markt, Zielhost, Platzierung und Zieladresse |
| Freigabelogik | `src/features/commerce/partner.ts` — lehnt in sieben getrennten Fällen ab und begründet jeden im Klartext |
| Linkprüfung | `src/features/commerce/links.ts` — offline, ohne Abruf beim Anbieter; ungültige Ziele werden ausgeblendet, nicht abgeschwächt |
| Hinweistexte | `content-data/insurance-disclosures/` — fünf Texte, alle auch ohne Partner gültig |
| Inhaltsprüfung | `tests/content-policy.test.ts` — verbotene Aussagen im Wortlaut, auch im Quelltext der Oberfläche |
| Zustandsprüfung | `tests/insurance-integration.test.ts` — sieben gesperrte Zustände |

Es fehlt also **nichts Technisches**. Es fehlt der Vertrag und die Prüfung.

## Prüfpunkte vor einer Freigabe

1. **Tatsächliche Zulassung.** Liegt eine schriftliche Programmzulassung des Anbieters oder Netzwerks vor, auf einen benannten Betreiber und eine benannte Domain? Eine Anmeldung ist keine Zulassung.
2. **Erlaubnispflicht.** Ist die konkrete Ausgestaltung eine Versicherungsvermittlung im Sinne des § 34d GewO, oder bleibt sie darunter? Entscheidend ist nicht die Absicht, sondern was die Seite tatsächlich tut: reine Werbung mit Weiterleitung wird anders beurteilt als eine Auswahl, ein Vergleich oder ein Formular, das Angaben zum Tier erhebt. Diese Frage gehört zu einer Person mit einschlägiger Qualifikation, nicht in ein Repository.
3. **Grenze der Darstellung.** Was genau darf auf der Seite stehen, ohne dass daraus eine Empfehlung wird? Die vorhandenen Bausteine zeigen Anbietername, einen neutralen Satz und einen gekennzeichneten Link — mehr nicht. Jede Ergänzung (Leistungsmerkmale, Preisspannen, Bewertungen) ist einzeln zu prüfen.
4. **Platzierung.** Bestätigt der Vertrag die drei erlaubten Platzierungen? Eine Platzierung neben einem Kostenergebnis oder in einem Notfallkontext ist ausgeschlossen und darf auch nicht nachträglich hineinverhandelt werden.
5. **Werbekennzeichnung.** Welcher Wortlaut ist verlangt — vom Vertrag und vom Recht? Er gehört als `disclosureText` in die Konfiguration; ohne ihn erscheint kein Hinweis.
6. **Datenübertragung.** Bestätigt der Anbieter, dass der Aufruf ohne Parameter außer der statischen Kampagnenkennung funktioniert? Ein Programm, das personenbezogene oder profilbezogene Parameter verlangt, ist mit dieser Umsetzung nicht vereinbar.
7. **Datenschutzhinweis.** Ist die Weiterleitung in der Datenschutzerklärung beschrieben, einschließlich dessen, was der Anbieter beim Klick selbst erhebt?
8. **Beendigung.** Wie erfährt der Betrieb von einer beendeten Zulassung, und wie schnell verschwindet der Link? Technisch genügt `status: "ended"` oder ein `expiresAt` in der Vergangenheit; die Frage ist die Meldekette.

## Freigabeschritte

1. Vertragsreferenz, Freigabedatum und Prüfnachweis in diesem Dokument eintragen — mit Datum und Namen der prüfenden Person, und mit der ausdrücklichen Angabe, worauf sich die Prüfung stützt.
2. Programm in `config/publishers/insurance/programs.json` eintragen: `status: "approved"`, `approval` vollständig, Zielhosts, Kampagnenkennungen und Platzierungen genau nach Vertrag.
3. `npx vitest run tests/affiliate-links.test.ts tests/insurance-integration.test.ts tests/content-policy.test.ts` ausführen — die Konfiguration muss diese Tests bestehen, ohne dass ein Test geändert wird.
4. Eine Seite bestimmen, auf der der Hinweis stehen darf, und sie in der Ausnahmeliste von `tests/content-policy.test.ts` eintragen. Der Test erzwingt diese Entscheidung.
5. Feature `commerce` im Markt DE einschalten und die Datenschutzerklärung ergänzen.
6. Erst danach ein Produktionsdeployment.

## Anmerkung

Ein Disclaimer ersetzt die Prüfung unter Punkt 2 nicht. Wenn die Freigabe auf einer Einschätzung ohne einschlägige Qualifikation beruht, sollte genau das hier stehen — damit später niemand eine Autorität annimmt, die es nicht gab.
