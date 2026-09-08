# Abnahme: lokales Profil, Merkliste und Packliste

Durchgeführt am 2026-09-08 (M16-06). Geprüft wurde die Frage, die bei einem Profil ohne Konto die einzige wichtige ist: **verlässt irgendetwas das Gerät?**

Antwort: nein. Nachgewiesen im Browser, nicht behauptet.

## Prüfumfang

| | |
|---|---|
| Geprüfte Wege | Profil ausfüllen und speichern, Produkt merken, Merkliste öffnen, Packliste abhaken, Sicherung schreiben und einlesen |
| Automatisierte Prüfung | `npm run test:e2e:features` — 280 Tests, davon 8 aus dieser Abnahme (`tests/e2e-features/privatsphaere.spec.ts`) |
| Methode | Mitschnitt **aller** Anfragen (Adresse, Methode, Körper) über den ganzen Ablauf; Kontrolle von `localStorage`, `sessionStorage`, Cookies und Adresszeile |
| Kanarienvogel | die Zeichenkette `Kanarienvogel7Q4Z` als Rufname und Rassenangabe |

## Ergebnisse

### Keine Anfrage trägt die Eingabe

Über den ganzen Ablauf hinweg — Profil speichern, merken, Merkliste öffnen, Packliste abhaken — enthält **keine** Anfrage die Zeichenkette: weder in der Adresse noch im Körper. Geprüft werden alle Anfragen, auch die an die eigene Herkunft.

### Keine Anfrage an fremde Hosts

Während der geprüften Wege geht **keine einzige** Anfrage an einen anderen Host als die Seite selbst. Es gibt kein Analytics, kein Tracking-Pixel, keine Schriftart von außen; ein eigener Test sucht gezielt nach den bekannten Namen (`analytics`, `gtag`, `matomo`, `plausible`, `segment`, `hotjar`, `facebook`, `doubleclick`) und findet nichts.

### Keine schreibenden Anfragen

Es gibt keine Anfrage mit einer anderen Methode als `GET`. Kein `POST`, kein `sendBeacon`, kein Bildaufruf mit Parametern.

### Nichts in der Adresse

Nach dem Speichern enthält die Adresse weder Suchteil noch Anker; die Eingabe taucht in `location.href` nicht auf. Damit landet sie auch nicht in einem Referrer.

### Nichts in einem Partnerlink

Auf der Angebotsprobe tragen die Partnerlinks keine Eingabe und keine Unterkennung (`subid`, `clickref`, `sub_id`, `u1`). Das ist zusätzlich in M09-03 abgesichert: die Zieladresse kommt aus dem Vertrag, und angehängt wird höchstens eine statische Kampagnenkennung.

### Nichts im Druck

Die gedruckte Packliste enthält die Profilangaben nicht. Auf dem Papier steht, was abzuhaken ist — nicht, wem das Tier gehört.

### Drei Schlüssel, sonst nichts

Gespeichert wird ausschließlich unter `petatlas.profile.v1`, `petatlas.favorites.v1` und `petatlas.packing.v1`. Cookies und `sessionStorage` bleiben leer.

## Was das Standardverhalten ist

**Anonym.** Ohne Zutun speichert die Seite nichts: kein Profil, keine Merkliste, keine Häkchen. Jede Speicherung ist eine Handlung — ein Knopfdruck oder ein Häkchen —, und jede Speicherung lässt sich mit einem Knopf rückgängig machen.

Es gibt kein Konto, keine Anmeldung, keine Kennung, die anderswo etwas bedeutet. Die Profil-ID entsteht lokal und verlässt das Gerät nur, wenn der Nutzer selbst eine Sicherungsdatei weitergibt.

## Grenzen — ausdrücklich

1. **Keine Sicherung.** Wer den Browser-Speicher leert, die Website-Daten löscht oder einen privaten Fenstermodus benutzt, verliert Profil, Merkliste und Häkchen. Es gibt niemanden, der sie wiederherstellen könnte.
2. **Kein Geräteabgleich.** Was auf dem Telefon steht, steht nicht auf dem Rechner. Der einzige Weg dorthin ist die Sicherungsdatei, und die geht durch die Hand des Nutzers.
3. **Kein Schutz gegen Mitbenutzer.** Wer denselben Browser benutzt, sieht dieselben Daten. Die Speicherung ist nicht verschlüsselt und nicht durch ein Kennwort geschützt; sie ist eine Bequemlichkeit, kein Tresor.
4. **Die Sicherungsdatei ist unverschlüsselt.** Sie enthält alles, was lokal gespeichert ist. Wer sie weitergibt, gibt diese Angaben weiter — das steht auch auf der Seite.
5. **Ein privater Modus kann alles verweigern.** Dann bleiben die Angaben im Tab, und die Seite sagt das, statt eine Speicherung vorzutäuschen.

## Offener Punkt

Die Prüfung deckt die Wege ab, die es heute gibt. Kommt ein Partnerlink mit dynamischen Parametern, ein Kartendienst mit eigener Analytik oder ein eingebettetes Medium dazu, ist sie zu wiederholen — der Mitschnitt-Test ist dafür gebaut und nimmt neue Seiten ohne Änderung mit auf.
