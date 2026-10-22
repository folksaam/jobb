/* Layout för panelraden i anteckningssektionen.

   Panelerna ligger i rader. Varje panel kan flyttas i sidled inom sin
   rad, upp eller ner till en annan rad, och dras bredare eller smalare
   mot sin granne. Allt sparas i localStorage.

   Raderna byggs här i stället för i stilmallen, eftersom antalet
   paneler per rad ändras av användaren. Laddas inte den här filen
   faller sidan tillbaka på .ngrid i stil.css, som ser ut som förut. */

(function(){
  var grid = document.querySelector('.ngrid');
  if(!grid) return;

  var NYCKEL = 'layout';
  var NAMN = {nAvtalPanel:'Avtal', nAaPanel:'Åldersavdrag', nMallPanel:'Mall',
              nPhonePanel:'Telefonlista', nEkPanel:'Egenkontroll'};
  var ALLA = ['nAvtalPanel','nAaPanel','nMallPanel','nPhonePanel','nEkPanel'];

  /* Samma fördelning som .ngrid hade i stil.css, så standardläget ser
     likadant ut som innan filen fanns. */
  var STANDARD = {
    rader: [ALLA.slice()],
    bredd: {nAvtalPanel:0.95, nAaPanel:0.85, nMallPanel:1.2, nPhonePanel:0.9, nEkPanel:0.9}
  };

  /* Breddknapparna i mallpanelen blir startlägen för radmodellen. */
  var FORVAL = {
    normal: {rader:[ALLA.slice()],
             bredd:{nAvtalPanel:0.95, nAaPanel:0.85, nMallPanel:1.2, nPhonePanel:0.9, nEkPanel:0.9}},
    bred:   {rader:[ALLA.slice()],
             bredd:{nAvtalPanel:0.8,  nAaPanel:0.7,  nMallPanel:2.3, nPhonePanel:0.85, nEkPanel:0.85}},
    full:   {rader:[['nAvtalPanel','nAaPanel','nPhonePanel','nEkPanel'],['nMallPanel']],
             bredd:{nAvtalPanel:1, nAaPanel:1, nMallPanel:1, nPhonePanel:1, nEkPanel:1}}
  };

  var lay = kopia(STANDARD);
  function kopia(o){ return JSON.parse(JSON.stringify(o)); }

  /* ---------- lagring ---------- */
  function las(){
    try{
      var r = JSON.parse(localStorage.getItem(NYCKEL) || 'null');
      if(!r) return;
      /* Äldre sparning hade en platt ordning i stället för rader. */
      var rader = r.rader || (r.ordning ? [r.ordning] : null);
      if(!rader) return;
      rader = rader.map(function(rad){
        return rad.filter(function(id){ return ALLA.indexOf(id) >= 0 && document.getElementById(id); });
      }).filter(function(rad){ return rad.length; });
      /* Paneler som saknas i sparningen läggs sist, så inget försvinner. */
      var sedda = [].concat.apply([], rader);
      ALLA.forEach(function(id){
        if(sedda.indexOf(id) < 0 && document.getElementById(id)) rader[rader.length-1].push(id);
      });
      if(!rader.length) return;
      lay.rader = rader;
      ALLA.forEach(function(id){
        var v = r.bredd && r.bredd[id];
        lay.bredd[id] = (typeof v === 'number' && v > 0.25) ? v : STANDARD.bredd[id];
      });
    }catch(e){}
  }
  function spara(){
    try{ localStorage.setItem(NYCKEL, JSON.stringify({rader:lay.rader, bredd:lay.bredd})); }catch(e){}
  }

  /* ---------- hitta en panel ---------- */
  function plats(id){
    for(var r = 0; r < lay.rader.length; r++){
      var i = lay.rader[r].indexOf(id);
      if(i >= 0) return {rad:r, i:i};
    }
    return null;
  }
  function stadaRader(){
    lay.rader = lay.rader.filter(function(rad){ return rad.length; });
    if(!lay.rader.length) lay.rader = [ALLA.slice()];
  }

  /* ---------- rita upp ---------- */
  var radEl = [];
  function tillamp(){
    stadaRader();
    grid.classList.add('egenlayout');
    grid.classList.remove('mall-bred','mall-full');

    /* Återanvänd radbehållarna, så inputfält inte tappar fokus vid varje
       omritning. Panelerna flyttas med appendChild. */
    while(radEl.length < lay.rader.length){
      var d = document.createElement('div');
      d.className = 'rad';
      grid.appendChild(d);
      radEl.push(d);
    }

    /* Panelerna flyttas FÖRE att överblivna rader tas bort. Tvärtom
       ordning river bort raden med panelen kvar i sig, och då försvinner
       panelen ur sidan. */
    lay.rader.forEach(function(rad, r){
      var behallare = radEl[r];
      rad.forEach(function(id, i){
        var el = document.getElementById(id);
        if(!el) return;
        /* Sätts in på sin plats i stället för att läggas sist, så ordningen
           inom raden blir rätt och paneler som redan står rätt inte flyttas
           i onödan. */
        var pa_platsen = behallare.children[i];
        if(pa_platsen !== el) behallare.insertBefore(el, pa_platsen || null);
        el.style.order = '';
      });
    });

    while(radEl.length > lay.rader.length){
      var bort = radEl.pop();
      if(bort.parentNode) bort.parentNode.removeChild(bort);
    }

    kolumner();
    markeraForval();
  }

  /* Kolumnbredderna räknas här i stället för i stilmallen, eftersom
     antalet paneler per rad varierar. */
  function kolumner(){
    var bred = window.innerWidth;
    lay.rader.forEach(function(rad, r){
      var behallare = radEl[r];
      if(!behallare) return;
      var mall;
      if(bred <= 780)       mall = '1fr';
      else if(bred <= 1480) mall = rad.length === 1 ? '1fr' : '1fr 1fr';
      else mall = rad.map(function(id){ return lay.bredd[id].toFixed(3) + 'fr'; }).join(' ');
      behallare.style.gridTemplateColumns = mall;
    });
  }
  window.addEventListener('resize', kolumner);

  function markeraForval(){
    var aktuell = null;
    Object.keys(FORVAL).forEach(function(k){
      if(JSON.stringify(FORVAL[k].rader) === JSON.stringify(lay.rader) &&
         JSON.stringify(FORVAL[k].bredd) === JSON.stringify(lay.bredd)) aktuell = k;
    });
    document.querySelectorAll('#nBredd button').forEach(function(b){
      b.classList.toggle('on', b.dataset.v === aktuell);
    });
  }

  /* ---------- flytta ---------- */
  function flyttaISidled(id, steg){
    var p = plats(id); if(!p) return;
    var rad = lay.rader[p.rad];
    var j = p.i + steg;
    if(j < 0 || j >= rad.length) return;
    rad.splice(j, 0, rad.splice(p.i, 1)[0]);
    spara(); tillamp();
  }
  function flyttaRad(id, steg){
    var p = plats(id); if(!p) return;
    var fran = lay.rader[p.rad];
    var mal = p.rad + steg;

    /* Är panelen ensam på sin rad finns ingen ny rad att skapa åt den. */
    if(mal < 0){
      if(fran.length === 1) return;
      lay.rader.unshift([]);
      mal = 0; p.rad += 1;
      fran = lay.rader[p.rad];
    } else if(mal >= lay.rader.length){
      if(fran.length === 1) return;
      lay.rader.push([]);
    }
    fran.splice(fran.indexOf(id), 1);
    lay.rader[mal].push(id);
    spara(); tillamp();
  }

  /* ---------- verktygsrad och grepp ---------- */
  ALLA.forEach(function(id){
    var el = document.getElementById(id);
    if(!el) return;

    var v = document.createElement('div');
    v.className = 'pVerktyg';
    v.innerHTML =
      '<button type="button" data-flytt="-1" aria-label="Flytta ' + NAMN[id] + ' åt vänster">&#9664;</button>' +
      '<button type="button" data-flytt="1"  aria-label="Flytta ' + NAMN[id] + ' åt höger">&#9654;</button>' +
      '<span class="pNamn" draggable="true">' + NAMN[id] + '</span>' +
      '<button type="button" data-rad="-1" aria-label="Flytta ' + NAMN[id] + ' en rad upp">&#9650;</button>' +
      '<button type="button" data-rad="1"  aria-label="Flytta ' + NAMN[id] + ' en rad ner">&#9660;</button>';
    el.appendChild(v);

    v.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(e){
        e.stopPropagation();
        if(b.dataset.flytt) flyttaISidled(id, Number(b.dataset.flytt));
        else                flyttaRad(id, Number(b.dataset.rad));
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
      var fran = plats(kalla), till = plats(id);
      if(!fran || !till) return;
      lay.rader[fran.rad].splice(fran.i, 1);
      till = plats(id);                      /* kan ha flyttats av borttagningen */
      lay.rader[till.rad].splice(till.i, 0, kalla);
      spara(); tillamp();
    });

    var g = document.createElement('div');
    g.className = 'pGrip';
    g.setAttribute('aria-hidden','true');
    el.appendChild(g);

    g.addEventListener('pointerdown', function(e){
      var p = plats(id); if(!p) return;
      var rad = lay.rader[p.rad];
      if(p.i >= rad.length - 1) return;      /* sist i raden, ingen granne */
      e.preventDefault();
      g.setPointerCapture(e.pointerId);

      var vanster = rad[p.i], hoger = rad[p.i + 1];
      var startX = e.clientX;
      var a0 = lay.bredd[vanster];
      var summa = a0 + lay.bredd[hoger];
      var total = rad.reduce(function(t, x){ return t + lay.bredd[x]; }, 0);
      var pxPerFr = (radEl[p.rad] || grid).getBoundingClientRect().width / total;

      function ror(ev){
        var d = (ev.clientX - startX) / pxPerFr;
        /* Golvet hindrar att en panel kläms ihop tills innehållet kapas. */
        var a = Math.max(0.55, Math.min(summa - 0.55, a0 + d));
        lay.bredd[vanster] = a;
        lay.bredd[hoger] = summa - a;
        kolumner(); markeraForval();
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

  /* Breddknapparna sätter ett startläge man sedan kan dra vidare från. */
  document.querySelectorAll('#nBredd button').forEach(function(b){
    b.addEventListener('click', function(){
      var f = FORVAL[b.dataset.v];
      if(!f) return;
      lay = kopia(f);
      spara(); tillamp();
    });
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
    lay = kopia(STANDARD);
    try{ localStorage.removeItem(NYCKEL); }catch(e){}
    tillamp();
  };
  window.uLayoutData = function(){ return {rader:lay.rader, bredd:lay.bredd}; };
  window.uLayoutSatt = function(r){
    if(!r) return;
    var rader = r.rader || (r.ordning ? [r.ordning] : null);
    if(!rader) return;
    lay.rader = kopia(rader);
    lay.bredd = Object.assign({}, STANDARD.bredd, r.bredd || {});
    spara(); tillamp();
  };

  las();
  tillamp();
})();
