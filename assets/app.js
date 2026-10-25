/* Web app "Fumo & Polmoni" — prof. Andrea Bertelli
   Logica delle sezioni interattive (tutto lato client, nessun dato raccolto). */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, html = '') => { const n = document.createElement(tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (html) n.innerHTML = html; return n; };
const nf = (n, d = 0) => { const [i, f] = Math.abs(n).toFixed(d).split('.'); return (n < 0 ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (f ? ',' + f : ''); };
const eur = n => nf(Math.round(n)) + ' €';

/* ───── Dimensione del testo (A− / A+) ───── */
const SCALES = [0.9, 1, 1.12, 1.25, 1.4];
let si = 1;
try { const v = +localStorage.getItem('fp-scale'); if (SCALES.includes(v)) si = SCALES.indexOf(v); } catch (e) {}
function setScale() {
  document.documentElement.style.setProperty('--scale', SCALES[si]);
  $('#font-down').disabled = si === 0; $('#font-up').disabled = si === SCALES.length - 1;
  try { localStorage.setItem('fp-scale', SCALES[si]); } catch (e) {}
}
$('#font-down').addEventListener('click', () => { si = Math.max(0, si - 1); setScale(); });
$('#font-up').addEventListener('click', () => { si = Math.min(SCALES.length - 1, si + 1); setScale(); });
setScale();

/* ───── 01 · Sostanze ───── */
const SOSTANZE = [
  { s: 'Nic', n: 'Nicotina', e: 'Crea dipendenza: arriva al cervello in circa 10 secondi. Alza frequenza cardiaca e pressione.', w: 'Negli insetticidi (oggi vietati in UE proprio per la tossicità)' },
  { s: 'Ct', n: 'Catrame', e: 'Miscela appiccicosa che si deposita nei polmoni, ingiallisce denti e dita, contiene molti cancerogeni.', w: 'Nell’asfalto delle strade' },
  { s: 'CO', n: 'Monossido di carbonio', e: 'Gas invisibile che si lega all’emoglobina al posto dell’ossigeno: meno ossigeno a muscoli e cervello.', w: 'Nei gas di scarico delle auto' },
  { s: 'Bz', n: 'Benzene', e: 'Cancerogeno certo: aumenta il rischio di leucemia.', w: 'Nella benzina' },
  { s: 'HCHO', n: 'Formaldeide', e: 'Irrita occhi e vie aeree, cancerogena per naso e gola.', w: 'Nei liquidi per conservare i campioni biologici' },
  { s: 'NH₃', n: 'Ammoniaca', e: 'Irritante; nel tabacco aumenta l’assorbimento della nicotina.', w: 'Nei detergenti per pavimenti e vetri' },
  { s: 'Cd', n: 'Cadmio', e: 'Metallo pesante che si accumula in reni e fegato; cancerogeno.', w: 'Nelle batterie ricaricabili' },
  { s: 'As', n: 'Arsenico', e: 'Veleno e cancerogeno per polmoni, vescica e pelle.', w: 'Nel veleno per topi (storicamente)' },
  { s: 'HCN', n: 'Acido cianidrico', e: 'Paralizza le ciglia che puliscono i bronchi: il muco e lo sporco restano nei polmoni.', w: 'È il cianuro: un potente veleno' },
  { s: 'Po', n: 'Polonio-210', e: 'Elemento radioattivo che irradia i bronchi dall’interno a ogni boccata.', w: 'Nei materiali radioattivi' },
];
const grid = $('#sostanze-grid');
SOSTANZE.forEach(x => {
  const b = el('button', { class: 'flip reveal', type: 'button', 'aria-pressed': 'false', 'aria-label': `${x.n}: gira la carta` }, `
    <div class="flip-in">
      <div class="face face-f"><span class="sym">${x.s}</span><h3>${x.n}</h3><p>${x.e}</p><span class="q">Dove altro la trovi? Tocca per scoprirlo ↻</span></div>
      <div class="face face-b"><span class="sym">${x.s}</span><span class="where">La trovi anche…</span><span class="where-v">${x.w}</span></div>
    </div>`);
  b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); b.classList.add('seen'); updSost(); });
  grid.append(b);
});
function updSost() { $('#sost-count').textContent = `Scoperte: ${grid.querySelectorAll('.seen').length} / ${SOSTANZE.length}`; }
$('#flip-all').addEventListener('click', () => { grid.querySelectorAll('.flip').forEach(b => { b.setAttribute('aria-pressed', 'true'); b.classList.add('seen'); }); updSost(); });
$('#flip-reset').addEventListener('click', () => { grid.querySelectorAll('.flip').forEach(b => { b.setAttribute('aria-pressed', 'false'); b.classList.remove('seen'); }); updSost(); });

/* ───── 02 · Corpo ───── */
const ORGANI = [
  { id: 'cervello', x: 44, y: 6, k: 'Cervello', t: 'Dipendenza e ictus', l: ['La nicotina raggiunge il cervello in pochi secondi e crea dipendenza molto rapidamente.', 'Il rischio di ictus è da 2 a 4 volte più alto.', 'Negli adolescenti il cervello è ancora in sviluppo: la nicotina può peggiorare attenzione, memoria e controllo degli impulsi.'] },
  { id: 'occhi', x: 62, y: 9.5, k: 'Occhi', t: 'Vista a rischio', l: ['Aumenta il rischio di cataratta (cristallino opaco).', 'Aumenta il rischio di degenerazione maculare, una delle principali cause di perdita della vista.', 'Il fumo irrita gli occhi e li secca.'] },
  { id: 'bocca', x: 50, y: 15, k: 'Bocca e gola', t: 'Denti, gusto e tumori', l: ['Denti gialli, alito cattivo, carie e malattie delle gengive.', 'Gusto e olfatto peggiorano.', 'Aumenta il rischio di tumori di bocca, lingua, laringe ed esofago.'] },
  { id: 'polmoni', x: 40, y: 29, k: 'Polmoni', t: 'BPCO, enfisema, tumore', l: ['Bronchite cronica ed enfisema (BPCO): fiato corto che peggiora negli anni.', '8–9 tumori del polmone su 10 sono legati al fumo.', 'Più infezioni respiratorie e asma più grave.'] },
  { id: 'cuore', x: 58, y: 32, k: 'Cuore e vasi', t: 'Arterie che si chiudono', l: ['Le pareti delle arterie si danneggiano e si formano placche (aterosclerosi).', 'Il rischio di infarto è da 2 a 4 volte più alto.', 'Il sangue coagula più facilmente: trombosi e cattiva circolazione a gambe e piedi.'] },
  { id: 'stomaco', x: 50, y: 42, k: 'Apparato digerente', t: 'Stomaco e pancreas', l: ['Più reflusso e ulcere.', 'Aumenta il rischio di tumori di stomaco, pancreas, fegato e colon-retto.'] },
  { id: 'reni', x: 50, y: 51, k: 'Reni e vescica', t: 'Le tossine passano dalle urine', l: ['Le sostanze cancerogene vengono filtrate dai reni e restano a contatto con la vescica.', 'Il fumo è la prima causa evitabile di tumore della vescica e aumenta quello dei reni.'] },
  { id: 'pelle', x: 13, y: 44, k: 'Pelle', t: 'Invecchiamento precoce', l: ['Meno sangue e ossigeno alla pelle: rughe precoci e colorito spento.', 'Le ferite guariscono più lentamente.', 'Aumenta il rischio di psoriasi.'] },
  { id: 'riproduttivo', x: 58, y: 57, k: 'Apparato riproduttivo', t: 'Fertilità e gravidanza', l: ['Fertilità ridotta in donne e uomini; nei maschi aumenta il rischio di disfunzione erettile.', 'In gravidanza aumenta il rischio di parto prematuro e di basso peso alla nascita.'] },
  { id: 'ossa', x: 41, y: 78, k: 'Ossa, muscoli e tendini', t: 'Più fragili, più lenti a guarire', l: ['Ossa meno dense (osteoporosi) e più fratture.', 'Fratture, distorsioni e lesioni tendinee guariscono più lentamente.', 'Meno forza e meno resistenza nello sport.'] },
];
const hs = $('#hotspots'), oK = $('#organ-k'), oT = $('#organ-t'), oL = $('#organ-l'), organ = $('#organ');
const onav = el('div', { class: 'organ-nav' });
const ostep = el('div', { class: 'organ-step' }, `<button class="btn btn-secondary" type="button" id="org-prev">‹ Precedente</button><span id="org-n">0 / ${10}</span><button class="btn btn-primary" type="button" id="org-next">Successivo ›</button>`);
organ.append(ostep, onav);
let oi = -1;
function showOrgan(o) {
  oi = ORGANI.indexOf(o); $('#org-n').textContent = `${oi + 1} / ${ORGANI.length}`;
  oK.textContent = o.k; oT.textContent = o.t;
  oL.innerHTML = o.l.map(t => `<li>${t}</li>`).join('');
  document.querySelectorAll('[data-organ]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.organ === o.id)));
}
ORGANI.forEach((o, i) => {
  const b = el('button', { class: 'hs', type: 'button', 'data-organ': o.id, 'aria-pressed': 'false', 'aria-label': o.k, style: `left:${o.x}%;top:${o.y}%` }, String(i + 1));
  b.addEventListener('click', () => showOrgan(o));
  hs.append(b);
  const c = el('button', { type: 'button', 'data-organ': o.id, 'aria-pressed': 'false' }, o.k);
  c.addEventListener('click', () => showOrgan(o));
  onav.append(c);
});

$('#org-prev').addEventListener('click', () => showOrgan(ORGANI[(oi - 1 + ORGANI.length) % ORGANI.length]));
$('#org-next').addEventListener('click', () => showOrgan(ORGANI[(oi + 1) % ORGANI.length]));

/* ───── 03 · Sport: carbossiemoglobina ───── */
const hb = $('#hb-grid'), cig = $('#cig'), cigV = $('#cig-val'), cohb = $('#cohb');
const cells = Array.from({ length: 100 }, () => hb.appendChild(el('span', { class: 'hb' })));
// ordine casuale ma stabile per "accendere" i globuli bloccati
const order = cells.map((_, i) => i).sort((a, b) => ((a * 37) % 101) - ((b * 37) % 101));
function updHb() {
  const n = +cig.value;
  const p = Math.min(15, 1 + 0.25 * n); // stima didattica: ~1% di base + ~0,25% per sigaretta/die
  cigV.textContent = n;
  cohb.textContent = nf(p, 1) + '%';
  const k = Math.round(p);
  order.forEach((idx, j) => cells[idx].classList.toggle('co', j < k));
  document.querySelectorAll('#cig-chips button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === n)));
  cig.style.background = `linear-gradient(90deg,var(--sano),var(--fumo))`;
}
cig.addEventListener('input', updHb);
document.querySelectorAll('#cig-chips button').forEach(b => b.addEventListener('click', () => { cig.value = b.dataset.v; updHb(); }));
updHb();

/* ───── 04 · Calcolatore ───── */
const ci = $('#c-cig'), ca = $('#c-anni'), cp = $('#c-prezzo');
function durata(min) {
  const giorni = min / 60 / 24;
  if (giorni < 1) return nf(min / 60, 0) + ' ore';
  if (giorni < 60) return nf(giorni, 0) + ' giorni';
  if (giorni < 365) return nf(giorni / 30.4, 0) + ' mesi';
  return nf(giorni / 365, 1) + ' anni';
}
function calc() {
  const c = +ci.value, a = +ca.value, p = +cp.value;
  $('#c-cig-v').textContent = c; $('#c-anni-v').textContent = a === 1 ? '1 anno' : a + ' anni'; $('#c-prezzo-v').textContent = nf(p, 2) + ' €';
  const tot = c * 365 * a, soldi = tot / 20 * p, anno = c * 365 / 20 * p;
  $('#r-soldi').textContent = eur(soldi);
  $('#r-tot').textContent = nf(tot);
  $('#r-vita').textContent = '≈ ' + durata(tot * 20);
  $('#r-anno').textContent = eur(anno);
  const scarpe = Math.floor(soldi / 120), palestra = soldi / (40 * 12);
  $('#r-equiv').innerHTML = soldi > 0
    ? `Con questa cifra potresti comprare <strong>${nf(scarpe)} paia di scarpe da running</strong> (120 €) oppure pagarti <strong>${nf(palestra, 1)} anni di palestra</strong> (40 € al mese).`
    : 'Inserisci i dati per vedere il risultato.';
}
[ci, ca, cp].forEach(i => i.addEventListener('input', calc)); calc();

/* ───── 05 · Smettere ───── */
const TL = [
  { k: '20 minuti', t: 'Il cuore si calma', d: 'Frequenza cardiaca e pressione arteriosa iniziano a scendere.' },
  { k: '12 ore', t: 'Via il monossido di carbonio', d: 'Il livello di CO nel sangue torna normale: l’emoglobina può di nuovo trasportare tutto l’ossigeno.' },
  { k: '2–12 settimane', t: 'Più fiato, anche nello sport', d: 'La circolazione migliora e la funzione polmonare aumenta: correre e salire le scale diventa più facile.' },
  { k: '1–9 mesi', t: 'Tosse e fiato corto diminuiscono', d: 'Le ciglia dei bronchi riprendono a funzionare e a ripulire le vie aeree dal muco.' },
  { k: '1 anno', t: 'Cuore protetto a metà', d: 'Il rischio di malattia coronarica è circa la metà di quello di chi continua a fumare.' },
  { k: '5 anni', t: 'Meno rischio di ictus', d: 'Tra 5 e 15 anni dopo aver smesso, il rischio di ictus scende al livello di chi non ha mai fumato.' },
  { k: '10 anni', t: 'Tumore del polmone dimezzato', d: 'Il rischio di morire di tumore del polmone è circa la metà di quello di un fumatore; diminuisce anche il rischio di tumori di bocca, gola, esofago, vescica e pancreas.' },
  { k: '15 anni', t: 'Come chi non ha mai fumato', d: 'Il rischio di malattia coronarica torna simile a quello di un non fumatore.' },
];
const tl = $('#tl'), steps = $('#tl-steps');
TL.forEach((s, i) => {
  const li = el('li'); const b = el('button', { type: 'button' }, s.k);
  b.addEventListener('click', () => { tl.value = i; updTl(); });
  li.append(b); steps.append(li);
});
function updTl() {
  const i = +tl.value, s = TL[i];
  $('#tl-k').textContent = 'Dopo ' + s.k; $('#tl-t').textContent = s.t; $('#tl-d').textContent = s.d;
  $('#tl-prev').disabled = i === 0; $('#tl-next').disabled = i === TL.length - 1;
  tl.style.setProperty('--p', (i / 7 * 100) + '%');
  steps.querySelectorAll('button').forEach((b, j) => { b.classList.toggle('done', j < i); j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
}
tl.addEventListener('input', () => { stopPlay(); updTl(); });
const go = d => { tl.value = Math.min(7, Math.max(0, +tl.value + d)); updTl(); };
$('#tl-prev').addEventListener('click', () => { stopPlay(); go(-1); });
$('#tl-next').addEventListener('click', () => { stopPlay(); go(1); });
let timer = null; const playBtn = $('#tl-play');
function stopPlay() { clearInterval(timer); timer = null; playBtn.textContent = '▶ Riproduci'; }
playBtn.addEventListener('click', () => {
  if (timer) return stopPlay();
  if (+tl.value === 7) { tl.value = 0; updTl(); }
  playBtn.textContent = '❚❚ Pausa';
  timer = setInterval(() => { if (+tl.value >= 7) return stopPlay(); go(1); }, 2800);
});
updTl();

/* ───── 06 · Miti ───── */
const MITI = [
  { q: 'Fumare poche sigarette al giorno non fa male.', v: false, a: 'Non esiste una soglia sicura. Anche 1 sigaretta al giorno comporta circa la metà dell’aumento di rischio di infarto di chi ne fuma 20 (BMJ, 2018).' },
  { q: 'Le sigarette “light” sono meno dannose.', v: false, a: 'Chi le fuma tende a tirare più forte e a trattenere di più il fumo. In Unione Europea diciture come “light” sono vietate proprio perché ingannevoli.' },
  { q: 'Lo svapo è solo vapore acqueo.', v: false, a: 'È un aerosol che contiene nicotina (crea dipendenza), particelle fini, sostanze irritanti e tracce di metalli. Gli effetti a lungo termine non sono ancora noti.' },
  { q: 'Il fumo passivo fa male anche a chi non fuma.', v: true, a: 'Vero: non esiste un livello sicuro di esposizione. Secondo l’OMS il fumo passivo causa ogni anno oltre un milione di morti tra i non fumatori.' },
  { q: 'Fumare aiuta a rilassarsi.', v: false, a: 'La “calma” è solo il sollievo dall’astinenza da nicotina, che la sigaretta stessa ha provocato. Chi smette, dopo qualche settimana, ha in media meno ansia e stress.' },
  { q: 'Se fumo da anni, ormai smettere non serve.', v: false, a: 'Smettere conviene a ogni età. Chi smette prima dei 40 anni elimina circa il 90% dell’eccesso di rischio di morte legato al fumo.' },
  { q: 'Il tabacco riscaldato non fa male perché non brucia.', v: false, a: 'Rilascia comunque nicotina e sostanze tossiche. Non ci sono prove che riduca i danni rispetto alle sigarette tradizionali.' },
  { q: 'Fare sport “pulisce” i polmoni dal fumo.', v: false, a: 'L’attività fisica non elimina catrame né ripara gli alveoli distrutti. Anzi: il fumo peggiora resistenza, recupero e prestazioni.' },
];
const myths = $('#myths');
MITI.forEach(m => {
  const c = el('div', { class: 'card myth reveal' }, `<q>${m.q}</q>
    <div class="row"><button class="btn btn-secondary" type="button" data-v="1">Vero</button><button class="btn btn-secondary" type="button" data-v="0">Falso</button></div>
    <p class="ans" aria-live="polite"></p>`);
  c.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const guess = b.dataset.v === '1', ok = guess === m.v;
    c.classList.remove('ok', 'ko'); c.classList.add('done', ok ? 'ok' : 'ko');
    c.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    updMyth();
    c.querySelector('.ans').innerHTML = `<span class="verdict">${ok ? 'Esatto!' : 'Non proprio.'} È ${m.v ? 'VERO' : 'FALSO'}.</span> ${m.a}`;
  }));
  myths.append(c);
});
function updMyth() { $('#myth-count').textContent = `Risposte esatte: ${myths.querySelectorAll('.ok').length} / ${MITI.length} · date: ${myths.querySelectorAll('.done').length}`; }
$('#myth-reset').addEventListener('click', () => { myths.querySelectorAll('.myth').forEach(c => { c.classList.remove('done', 'ok', 'ko'); c.querySelector('.ans').innerHTML = ''; c.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false')); }); updMyth(); });
updMyth();

/* ───── 07 · Quiz ───── */
const QUIZ = [
  { q: 'Quante sostanze chimiche contiene, circa, il fumo di una sigaretta?', o: ['70', '700', '7.000', '70.000'], c: 2, e: 'Oltre 7.000 sostanze, di cui circa 70 sono cancerogene.' },
  { q: 'Quale sostanza del fumo è responsabile della dipendenza?', o: ['Catrame', 'Nicotina', 'Monossido di carbonio', 'Ammoniaca'], c: 1, e: 'La nicotina agisce sul sistema di ricompensa del cervello e crea dipendenza.' },
  { q: 'Perché il fumo peggiora le prestazioni sportive?', o: ['Perché fa aumentare la massa muscolare', 'Perché il CO si lega all’emoglobina al posto dell’ossigeno', 'Perché abbassa la frequenza cardiaca', 'Non le peggiora'], c: 1, e: 'Il monossido di carbonio “occupa” l’emoglobina: arriva meno ossigeno ai muscoli.' },
  { q: 'Cosa succede agli alveoli nell’enfisema?', o: ['Diventano più numerosi', 'Si riempiono di catrame e si induriscono', 'Le pareti si rompono e si forma meno superficie di scambio', 'Si trasformano in bronchi'], c: 2, e: 'Gli alveoli si fondono in bolle più grandi: meno superficie per scambiare ossigeno, più fiato corto.' },
  { q: 'Quanti tumori del polmone su 10 sono legati al fumo?', o: ['2–3', 'Circa 5', '8–9', 'Tutti e 10'], c: 2, e: 'Il fumo è la causa di circa 8–9 tumori del polmone su 10.' },
  { q: 'Dopo quanto tempo dall’ultima sigaretta il CO nel sangue torna normale?', o: ['20 minuti', '12 ore', '1 anno', '10 anni'], c: 1, e: 'Bastano circa 12 ore: il corpo inizia a recuperare subito.' },
  { q: 'Chi fuma 1 sola sigaretta al giorno…', o: ['Non ha alcun rischio in più', 'Ha circa la metà dell’aumento di rischio di infarto di chi ne fuma 20', 'Ha lo stesso rischio di chi non fuma', 'Ha meno rischio di chi non fuma'], c: 1, e: 'Non esiste una dose sicura: anche poche sigarette danneggiano cuore e vasi.' },
  { q: 'Quanti adulti italiani (18–69 anni) fumano?', o: ['1 su 10', '1 su 4', '1 su 2', '3 su 4'], c: 1, e: 'Circa il 24%: un adulto su quattro (sorveglianza PASSI, ISS).' },
];
const qb = $('#quiz-box'); let qi = 0, score = 0;
function renderQ() {
  if (qi >= QUIZ.length) {
    const msg = score === QUIZ.length ? 'Perfetto! Sei pronto a spiegarlo ai tuoi compagni.' : score >= 6 ? 'Ottimo lavoro!' : score >= 4 ? 'Buona base: ripassa le sezioni dove hai sbagliato.' : 'Riesplora il modello 3D e le sezioni, poi riprova!';
    qb.innerHTML = `<div class="q-end"><span class="score">${score}/${QUIZ.length}</span><p class="q-text">${msg}</p><button class="btn btn-primary" type="button" id="q-again">Rifai il quiz</button></div>`;
    $('#q-again').addEventListener('click', () => { qi = 0; score = 0; renderQ(); });
    return;
  }
  const Q = QUIZ[qi];
  qb.innerHTML = `<div class="q-top"><span>Domanda ${qi + 1} di ${QUIZ.length}</span><span>Punteggio: ${score}</span></div>
    <div class="q-bar"><i style="width:${qi / QUIZ.length * 100}%"></i></div>
    <p class="q-text">${Q.q}</p>
    <div class="q-opts">${Q.o.map((o, i) => `<button class="q-opt" type="button" data-i="${i}"><span class="q-key">${i + 1}</span>${o}</button>`).join('')}</div>
    <div class="q-after"></div>`;
  qb.querySelectorAll('.q-opt').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i, ok = i === Q.c; if (ok) score++;
    qb.querySelectorAll('.q-opt').forEach((x, j) => { x.disabled = true; if (j === Q.c) x.classList.add('right'); else if (j === i) x.classList.add('wrong'); });
    const after = $('.q-after', qb);
    after.innerHTML = `<p class="q-exp"><strong>${ok ? 'Giusto!' : 'Sbagliato.'}</strong> ${Q.e}</p><div class="row" style="margin-top:12px"><button class="btn btn-primary" type="button">${qi === QUIZ.length - 1 ? 'Vedi il risultato' : 'Avanti →'}</button></div>`;
    $('button', after).addEventListener('click', () => { qi++; renderQ(); });
    $('button', after).focus();
  }));
}
renderQ();
document.addEventListener('keydown', e => {
  if (e.target.closest('input,textarea') || e.altKey || e.ctrlKey || e.metaKey) return;
  const r = qb.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
  if (/^[1-4]$/.test(e.key)) { const b = qb.querySelector(`.q-opt[data-i="${+e.key - 1}"]`); if (b && !b.disabled) b.click(); }
});

/* ───── Numeri animati, nav attiva, comparsa allo scroll ───── */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const counted = new WeakSet();
function countUp(n) {
  if (counted.has(n) || reduce) return; counted.add(n);
  const to = +n.dataset.count, t0 = performance.now(), dur = 1200;
  (function f(t) { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); n.textContent = nf(Math.round(to * e)); if (k < 1) requestAnimationFrame(f); })(t0);
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target.classList.contains('reveal')) e.target.classList.add('in');
    if (e.target.dataset.count) countUp(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal,[data-count]').forEach(n => io.observe(n));

  const links = [...document.querySelectorAll('#nav-links a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const navIo = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('active'));
    const a = map.get(e.target.id); if (a) { a.classList.add('active'); const nl = a.parentElement; nl.scrollTo({ left: a.offsetLeft - nl.clientWidth / 2 + a.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' }); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) navIo.observe(s); });
} else {
  document.querySelectorAll('.reveal').forEach(n => n.classList.add('in'));
}
})();
