/* Utseende, layout, mörkt läge och copyrightårtal — delas av alla sidor.

   Valen sparas i localStorage under 'utseende' och 'layout', och gäller
   därmed hela sajten. Panelen byggs här i stället för att ligga som
   markup i varje sida, så den bara finns på ett ställe.

   OBS: snutten som läser in valen INNAN sidan ritas upp ligger kvar
   inline i <head> på varje sida. Den måste köras direkt, annars hinner
   sidan blinka i fel bredd, storlek och färg. */

(function(){
  var root = document.documentElement;

  /* Årtal i copyright hålls aktuellt av sig självt. */
  document.querySelectorAll('.cpYear').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  /* ================= UTSEENDE ================= */

  var NYCKEL = 'utseende';
  var STANDARD = {tema:'system', wrap:'860px', skala:'1', luft:'1',
                  radie:'1', typsnitt:'serif', accent:'#005B94'};

  /* Anteckningssektionen är medvetet bredare än resten och följer med i samma steg. */
  var BRETT = {'720px':'1200px','860px':'1600px','1040px':'1900px','100%':'100%'};

  var TYPSNITT = {
    serif:  {brod:"'Source Serif 4',Georgia,serif", rubrik:"'Archivo',sans-serif"},
    sans:   {brod:"'Archivo',system-ui,sans-serif", rubrik:"'Archivo',system-ui,sans-serif"},
    system: {brod:"system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
             rubrik:"system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"}
  };

  var val = Object.assign({}, STANDARD);

  function las(){
    try{
      var r = JSON.parse(localStorage.getItem(NYCKEL) || 'null');
      if(r){ Object.keys(STANDARD).forEach(function(k){ if(r[k]) val[k] = r[k]; }); return; }
      /* Faller tillbaka på det gamla temavalet, så ingen tappar sitt mörka läge. */
      var gammalt = localStorage.getItem('theme');
      if(gammalt === 'dark') val.tema = 'mork';
      else if(gammalt === 'light') val.tema = 'ljus';
    }catch(e){}
  }
  function spara(){
    try{
      localStorage.setItem(NYCKEL, JSON.stringify(val));
      /* Hålls i synk för den inline-snutt som fortfarande läser 'theme'. */
      localStorage.setItem('theme', val.tema === 'mork' ? 'dark'
                                  : val.tema === 'ljus' ? 'light' : '');
    }catch(e){}
  }

  function tillampa(){
    if(val.tema === 'mork')      root.setAttribute('data-theme','dark');
    else if(val.tema === 'ljus') root.setAttribute('data-theme','light');
    else if(window.matchMedia('(prefers-color-scheme: dark)').matches)
                                 root.setAttribute('data-theme','dark');
    else                         root.removeAttribute('data-theme');

    var s = root.style;
    s.setProperty('--wrap', val.wrap);
    s.setProperty('--wrap-brett', BRETT[val.wrap] || '1600px');
    s.setProperty('--skala', val.skala);
    s.setProperty('--luft',  val.luft);
    s.setProperty('--radie', val.radie);
    s.setProperty('--accent', val.accent);
    var t = TYPSNITT[val.typsnitt] || TYPSNITT.serif;
    s.setProperty('--brodtext', t.brod);
    s.setProperty('--rubrik',   t.rubrik);

    if(!panel) return;
    panel.querySelectorAll('.uVal').forEach(function(g){
      var k = g.dataset.styr;
      g.querySelectorAll('button').forEach(function(b){
        b.classList.toggle('on', b.dataset.v === val[k]);
      });
    });
    panel.querySelectorAll('.uFarg').forEach(function(b){
      b.classList.toggle('on', b.dataset.v.toLowerCase() === val.accent.toLowerCase());
    });
    var egen = document.getElementById('uEgen');
    if(egen) egen.value = val.accent;
    var kodf = document.getElementById('uKod');
    if(kodf) kodf.value = kod();
    syncToggle();
  }

  /* Designkod: hela uppsättningen packad till en sträng som går att skicka vidare. */
  function kod(){
    try{
      var allt = Object.assign({}, val);
      if(window.uLayoutData) allt._l = window.uLayoutData();
      return btoa(unescape(encodeURIComponent(JSON.stringify(allt)))).replace(/=+$/,'');
    }catch(e){ return ''; }
  }
  function frankod(str){
    try{
      var p = str.trim().replace(/\s/g,'');
      var r = JSON.parse(decodeURIComponent(escape(atob(p + '==='.slice((p.length + 3) % 4)))));
      var nytt = {};
      Object.keys(STANDARD).forEach(function(k){ nytt[k] = r[k] || STANDARD[k]; });
      if(r._l && window.uLayoutSatt) window.uLayoutSatt(r._l);
      return nytt;
    }catch(e){ return null; }
  }

  /* ---------- panelen byggs här ---------- */
  var GRUPPER = [
    ['tema','Läge',            [['ljus','Ljust'],['mork','Mörkt'],['system','System']]],
    ['wrap','Sidbredd',        [['720px','Smal'],['860px','Normal'],['1040px','Bred'],['100%','Full']]],
    ['skala','Textstorlek',    [['0.92','Liten'],['1','Normal'],['1.12','Stor'],['1.25','Störst']]],
    ['luft','Täthet',          [['0.72','Kompakt'],['1','Normal'],['1.3','Luftig']]],
    ['radie','Hörn',           [['0','Skarpa'],['1','Mjuka'],['1.9','Runda']]],
    ['typsnitt','Typsnitt',    [['serif','Serif'],['sans','Sans'],['system','System']]]
  ];
  var FARGER = [['#005B94','Folksamblå'],['#1A6349','Grön'],['#6B3FA0','Lila'],
                ['#A63A2B','Tegel'],['#0E1C26','Grafit']];

  var panel = null, skugga = null;

  function bygg(){
    var oppna = document.createElement('button');
    oppna.id = 'uOppna'; oppna.type = 'button';
    oppna.setAttribute('aria-haspopup','dialog');
    oppna.textContent = '⚙ Utseende';

    skugga = document.createElement('div');
    skugga.id = 'uSkugga';

    panel = document.createElement('div');
    panel.id = 'uPanel'; panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Utseende');

    var h = '<button id="uStang" type="button" aria-label="Stäng">&#10005;</button>' +
            '<h2>Utseende</h2>' +
            '<p class="uLede">Dina val sparas i den här webbläsaren och gäller alla sidor.</p>';
    GRUPPER.forEach(function(g){
      h += '<div class="uGrupp"><span class="uTitel">' + g[1] + '</span>' +
           '<div class="uVal" data-styr="' + g[0] + '">' +
           g[2].map(function(v){
             return '<button type="button" data-v="' + v[0] + '">' + v[1] + '</button>';
           }).join('') + '</div></div>';
    });
    h += '<div class="uGrupp"><span class="uTitel">Accentfärg</span><div class="uFarger">' +
         FARGER.map(function(f){
           return '<button type="button" class="uFarg" data-v="' + f[0] +
                  '" style="background:' + f[0] + '" aria-label="' + f[1] + '"></button>';
         }).join('') +
         '<input type="color" id="uEgen" aria-label="Egen färg"></div>' +
         '<p class="uHjalp">Den ljusa tonen bakom citat och rutor räknas fram ur accenten automatiskt.</p></div>' +
         '<div class="uFot">' +
         '<button type="button" id="uAterstall">Återställ till standard</button>' +
         '<span class="uTitel" style="margin-top:14px">Dela din design</span>' +
         '<input type="text" id="uKod" readonly aria-label="Designkod">' +
         '<button type="button" id="uKopiera" style="margin-top:8px">Kopiera koden</button>' +
         '<button type="button" id="uKlistra">Klistra in en kod</button>' +
         '<p class="uHjalp">Skicka koden till en kollega så får de samma utseende och layout.</p></div>';
    panel.innerHTML = h;

    document.body.appendChild(skugga);
    document.body.appendChild(panel);
    document.body.appendChild(oppna);

    panel.querySelectorAll('.uVal').forEach(function(g){
      g.querySelectorAll('button').forEach(function(b){
        b.addEventListener('click', function(){
          val[g.dataset.styr] = b.dataset.v; spara(); tillampa();
        });
      });
    });
    panel.querySelectorAll('.uFarg').forEach(function(b){
      b.addEventListener('click', function(){ val.accent = b.dataset.v; spara(); tillampa(); });
    });
    document.getElementById('uEgen').addEventListener('input', function(e){
      val.accent = e.target.value; spara(); tillampa();
    });
    document.getElementById('uAterstall').addEventListener('click', function(){
      val = Object.assign({}, STANDARD); spara(); tillampa();
      if(window.uLayoutAterstall) window.uLayoutAterstall();
    });
    document.getElementById('uKopiera').addEventListener('click', function(){
      var f = document.getElementById('uKod'), b = this;
      f.select();
      try{ navigator.clipboard.writeText(f.value); }
      catch(e){ try{ document.execCommand('copy'); }catch(e2){} }
      b.textContent = 'Kopierad!';
      setTimeout(function(){ b.textContent = 'Kopiera koden'; }, 1400);
    });
    document.getElementById('uKlistra').addEventListener('click', function(){
      var s = prompt('Klistra in designkoden:');
      if(!s) return;
      var nytt = frankod(s);
      if(!nytt){ alert('Koden gick inte att läsa. Kontrollera att hela koden kom med.'); return; }
      val = nytt; spara(); tillampa();
    });

    oppna.addEventListener('click', function(){ panel.classList.add('pa'); skugga.classList.add('pa'); });
    document.getElementById('uStang').addEventListener('click', stang);
    skugga.addEventListener('click', stang);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') stang(); });
  }
  function stang(){
    if(panel){ panel.classList.remove('pa'); skugga.classList.remove('pa'); }
  }

  /* Den gamla snabbknappen finns kvar och skriver till samma inställning. */
  var toggle = document.getElementById('themeToggle');
  function syncToggle(){
    if(!toggle) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    toggle.textContent = dark ? '☀️ Ljust' : '🌙 Mörkt';
    toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    toggle.setAttribute('aria-label', dark ? 'Byt till ljust läge' : 'Byt till mörkt läge');
  }
  if(toggle){
    toggle.addEventListener('click', function(){
      val.tema = root.getAttribute('data-theme') === 'dark' ? 'ljus' : 'mork';
      spara(); tillampa();
    });
  }

  /* Följ systemets läge så länge inget eget val gjorts. */
  try{
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
      if(val.tema === 'system') tillampa();
    });
  }catch(e){}

  las();
  bygg();
  tillampa();
})();
