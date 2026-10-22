/* Layout för panelraden i anteckningssektionen — flytta panelerna och
   dra i deras bredd. Ordning och bredd sparas per panel i localStorage
   och skrivs ut som grid-template-columns.

   Bredderna gäller bara i fyrkolumnsläget, över 1480 px. På smalare
   skärmar staplas panelerna som förut, men ordningen följer med. */

(function(){
  var grid = document.querySelector('.ngrid');
  if(!grid) return;

  var NYCKEL = 'layout';
  var NAMN = {nAvtalPanel:'Avtal', nAaPanel:'Åldersavdrag',
              nMallPanel:'Mall',  nPhonePanel:'Telefonlista'};
  var STANDARD = {
    ordning: ['nAvtalPanel','nAaPanel','nMallPanel','nPhonePanel'],
    bredd:   {nAvtalPanel:0.95, nAaPanel:0.85, nMallPanel:1.2, nPhonePanel:0.9}
  };

  var lay = JSON.parse(JSON.stringify(STANDARD));
  var egen = false;   /* true när användaren flyttat eller dragit själv */

  var stil = document.createElement('style');
  document.head.appendChild(stil);

  function las(){
    try{
      var r = JSON.parse(localStorage.getItem(NYCKEL) || 'null');
      if(!r || !r.ordning || !r.bredd) return;
      /* Bara paneler som faktiskt finns kvar, och inget får tappas bort
         om sidan fått en panel till sedan valet sparades. */
      var giltiga = r.ordning.filter(function(id){ return document.getElementById(id); });
      STANDARD.ordning.forEach(function(id){ if(giltiga.indexOf(id) < 0) giltiga.push(id); });
      lay.ordning = giltiga;
      STANDARD.ordning.forEach(function(id){
        lay.bredd[id] = (typeof r.bredd[id] === 'number' && r.bredd[id] > 0.25)
                      ? r.bredd[id] : STANDARD.bredd[id];
      });
      egen = !!r.egen;
    }catch(e){}
  }
  function spara(){
    try{
      localStorage.setItem(NYCKEL, JSON.stringify({ordning:lay.ordning, bredd:lay.bredd, egen:egen}));
    }catch(e){}
  }

  function tillamp(){
    lay.ordning.forEach(function(id, i){
      var el = document.getElementById(id);
      if(el) el.style.order = i;
    });
    if(egen){
      /* Egen layout ersätter breddknapparnas förval. */
      grid.classList.remove('mall-bred','mall-full');
      var kol = lay.ordning.map(function(id){ return lay.bredd[id].toFixed(3) + 'fr'; }).join(' ');
      stil.textContent = '@media (min-width:1481px){.ngrid{grid-template-columns:' + kol + '}}';
      document.querySelectorAll('#nBredd button').forEach(function(b){ b.classList.remove('on'); });
    } else {
      stil.textContent = '';
    }
  }

  STANDARD.ordning.forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;

    var v = document.createElement('div');
    v.className = 'pVerktyg';
    v.innerHTML = '<button type="button" data-flytt="-1" aria-label="Flytta ' + NAMN[id] + ' åt vänster">&#9664;</button>' +
                  '<span class="pNamn" draggable="true">' + NAMN[id] + '</span>' +
                  '<button type="button" data-flytt="1" aria-label="Flytta ' + NAMN[id] + ' åt höger">&#9654;</button>';
    el.appendChild(v);

    v.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(e){
        e.stopPropagation();
        var i = lay.ordning.indexOf(id), j = i + Number(b.dataset.flytt);
        if(j < 0 || j >= lay.ordning.length) return;
        lay.ordning.splice(j, 0, lay.ordning.splice(i, 1)[0]);
        egen = true;                     /* bredden följer med panelen */
        spara(); tillamp();
      });
    });

    var namn = v.querySelector('.pNamn');
    namn.addEventListener('dragstart', function(e){
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('drar');
    });
    namn.addEventListener('dragend', function(){
      el.classList.remove('drar');
      document.querySelectorAll('.npanel.mal').forEach(function(x){ x.classList.remove('mal'); });
    });
    el.addEventListener('dragover', function(e){
      if(!grid.classList.contains('redigera')) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      el.classList.add('mal');
    });
    el.addEventListener('dragleave', function(){ el.classList.remove('mal'); });
    el.addEventListener('drop', function(e){
      e.preventDefault(); el.classList.remove('mal');
      var kalla = e.dataTransfer.getData('text/plain');
      if(!kalla || kalla === id) return;
      var i = lay.ordning.indexOf(kalla), j = lay.ordning.indexOf(id);
      lay.ordning.splice(i, 1);
      lay.ordning.splice(j, 0, kalla);
      egen = true;
      spara(); tillamp();
    });

    /* Greppet på panelens högerkant fördelar om bredden mot grannen. */
    var g = document.createElement('div');
    g.className = 'pGrip';
    g.setAttribute('aria-hidden','true');
    el.appendChild(g);

    g.addEventListener('pointerdown', function(e){
      var i = lay.ordning.indexOf(id);
      if(i >= lay.ordning.length - 1) return;      /* sista panelen har ingen granne */
      e.preventDefault();
      g.setPointerCapture(e.pointerId);

      var vanster = lay.ordning[i], hoger = lay.ordning[i + 1];
      var startX = e.clientX;
      var a0 = lay.bredd[vanster];
      var summa = a0 + lay.bredd[hoger];
      var total = lay.ordning.reduce(function(t, x){ return t + lay.bredd[x]; }, 0);
      var pxPerFr = grid.getBoundingClientRect().width / total;

      function ror(ev){
        var d = (ev.clientX - startX) / pxPerFr;
        /* Golvet hindrar att en panel kläms ihop tills innehållet kapas. */
        var a = Math.max(0.55, Math.min(summa - 0.55, a0 + d));
        lay.bredd[vanster] = a;
        lay.bredd[hoger] = summa - a;
        egen = true;
        tillamp();
      }
      function slut(ev){
        try{ g.releasePointerCapture(ev.pointerId); }catch(err){}
        g.removeEventListener('pointermove', ror);
        g.removeEventListener('pointerup', slut);
        spara();
      }
      g.addEventListener('pointermove', ror);
      g.addEventListener('pointerup', slut);
    });
  });

  /* Klickar man på ett breddförval lämnar man sin egen layout. */
  document.querySelectorAll('#nBredd button').forEach(function(b){
    b.addEventListener('click', function(){ egen = false; spara(); tillamp(); });
  });

  var knapp = document.getElementById('uLayoutKnapp');
  var hjalp = document.getElementById('uLayoutHjalp');
  if(knapp){
    knapp.addEventListener('click', function(){
      var pa = grid.classList.toggle('redigera');
      knapp.classList.toggle('pa', pa);
      knapp.textContent = pa ? '✓ Klar' : '✥ Anpassa layout';
      if(hjalp) hjalp.hidden = !pa;
    });
  }

  /* Används av utseendepanelen för återställning och designkoden. */
  window.uLayoutAterstall = function(){
    lay = JSON.parse(JSON.stringify(STANDARD));
    egen = false;
    try{ localStorage.removeItem(NYCKEL); }catch(e){}
    tillamp();
  };
  window.uLayoutData = function(){ return {ordning:lay.ordning, bredd:lay.bredd, egen:egen}; };
  window.uLayoutSatt = function(r){
    if(!r || !r.ordning) return;
    lay.ordning = r.ordning.slice();
    lay.bredd = Object.assign({}, r.bredd);
    egen = !!r.egen;
    spara(); tillamp();
  };

  las();
  tillamp();
})();
