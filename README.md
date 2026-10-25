# Fumo & Polmoni — web app didattica

Web app interattiva per spiegare a studenti e studentesse i danni del fumo di sigaretta.
Ideata e realizzata dal **prof. Andrea Bertelli** — Scienze motorie e sportive, Liceo Statale "G. Galilei", Verona.

## Cosa contiene

1. **Modello 3D dei polmoni** (three.js) con cursore "anni di fumo": il tessuto cambia colore, compaiono catrame, enfisema e tumore; vista interna dei bronchi, respirazione animata, export OBJ/GLB.
2. **Cosa respiri** — carte girevoli sulle sostanze tossiche del fumo.
3. **Il corpo** — figura interattiva con i danni organo per organo.
4. **Fumo e sport** — simulazione del monossido di carbonio che blocca l'emoglobina.
5. **Calcolatore** — soldi spesi, sigarette fumate, tempo di vita perso stimato.
6. **Smettere** — linea del tempo dei benefici dopo l'ultima sigaretta.
7. **Falsi miti** — vero o falso.
8. **Quiz finale** — 8 domande con punteggio.

Sito statico: HTML + CSS + JavaScript, nessuna build, nessun dato raccolto.

## Struttura

```
index.html            pagina principale
favicon.svg
vercel.json           configurazione Vercel (opzionale)
assets/
  organic.css         design system (token e componenti)
  app.css             stili della web app
  three-d-stage.js    visualizzatore 3D (web component)
  model.js            modello 3D dei polmoni e simulatore
  app.js              sezioni interattive
```

three.js viene caricato da unpkg tramite import map (versione fissata 0.184.0 con hash di integrità): serve una connessione internet.

## Pubblicare su GitHub

1. Su github.com → **New repository** → nome es. `fumo-polmoni` → *Create repository*.
2. Clicca **uploading an existing file** e trascina **il contenuto** di questa cartella (index.html, assets/, ecc. — non la cartella stessa).
3. *Commit changes*.

Da terminale, in alternativa:

```bash
git init && git add . && git commit -m "Fumo & Polmoni — web app didattica"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/fumo-polmoni.git
git push -u origin main
```

## Pubblicare su Vercel

1. vercel.com → **Add New… → Project** → *Import* il repository `fumo-polmoni`.
2. Framework Preset: **Other**. Build Command e Output Directory: lasciare vuoti.
3. **Deploy**. Ogni modifica caricata su GitHub aggiorna il sito in automatico.

## Provarla in locale

Serve un piccolo server (i moduli JS non funzionano aprendo il file con doppio clic):

```bash
npx serve .        # oppure: python3 -m http.server
```

## Fonti

ISS (sorveglianza PASSI 2022–2023; indagine giovani 2023–2024), Ministero della Salute, AIOM, OMS, CDC, National Cancer Institute, University College London (2024), BMJ (2018).

*Strumento educativo: non sostituisce il parere del medico. Il modello 3D è una rappresentazione semplificata.*

© 2026 prof. Andrea Bertelli
