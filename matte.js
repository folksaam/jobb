/* Räknar ut uttryck som skrivs direkt i anteckningsmallen.

   Raden som markören står på tolkas löpande. Står det ett giltigt
   uttryck visas svaret under rutan, och skriver man ett likhetstecken
   sist på raden skrivs svaret in. Allt som inte går att tolka ignoreras
   tyst, så vanlig text aldrig stökas till.

   Uttrycket tolkas av en egen parser i stället för eval, dels för att
   inget en kund dikterar ska kunna köras som kod, dels för att svenska
   tal med mellanslag som tusentalsavgränsare och komma som decimaltecken
   inte går att ge till JavaScript rakt av. */

(function(){
  var ruta = document.getElementById('nNote');
  var strip = document.getElementById('nMatte');
  if(!ruta || !strip) return;

  var uttryckEl = document.getElementById('mUttryck');
  var svarEl    = document.getElementById('mSvar');
  var inKnapp   = document.getElementById('mIn');

  /* ---------- tal ---------- */
  /* "12 000,50" och "12000.50" ska båda bli 12000.5. Mellanslag räknas
     som tusentalsavgränsare bara när det följs av exakt tre siffror. */
  var TAL = /^\d{1,3}(?:[  ]\d{3})+(?:[.,]\d+)?|^\d+(?:[.,]\d+)?/;

  function tolkaTal(txt){
    return parseFloat(txt.replace(/[  ]/g,'').replace(',','.'));
  }

  /* ---------- lexer ---------- */
  function dela(rad){
    var t = [], i = 0;
    while(i < rad.length){
      var c = rad[i];
      if(c === ' ' || c === ' ' || c === '\t'){ i++; continue; }

      var rest = rad.slice(i);
      var m = rest.match(TAL);
      if(m){ t.push({typ:'tal', v:tolkaTal(m[0])}); i += m[0].length; continue; }

      /* "av" som i "20 % av 40 000" */
      var ord = rest.match(/^av\b/i);
      if(ord){ t.push({typ:'av'}); i += 2; continue; }

      if('+-*/()%'.indexOf(c) >= 0){ t.push({typ:c}); i++; continue; }
      if(c === '×' || c === '·'){ t.push({typ:'*'}); i++; continue; }
      if(c === '÷' || c === '∕'){ t.push({typ:'/'}); i++; continue; }
      if(c === 'x' || c === 'X'){ t.push({typ:'*'}); i++; continue; }

      return null;                       /* något annat — ingen räkning */
    }
    return t;
  }

  /* ---------- parser ----------
     uttryck := term (('+'|'-') term)*      procent i additionsledet
                                             räknas på vänsterledet
     term    := faktor (('*'|'/') faktor)*
     faktor  := tal ['%' 'av' term] | '(' uttryck ')' | '-' faktor      */
  function rakna(t){
    var i = 0;

    function faktor(){
      var tk = t[i];
      if(!tk) return null;

      if(tk.typ === '-'){ i++; var f = faktor(); return f === null ? null : -f; }
      if(tk.typ === '+'){ i++; return faktor(); }

      if(tk.typ === '('){
        i++;
        var inre = uttryck();
        if(inre === null || !t[i] || t[i].typ !== ')') return null;
        i++;
        return inre;
      }

      if(tk.typ === 'tal'){
        i++;
        /* "20 % av 40 000" */
        if(t[i] && t[i].typ === '%' && t[i+1] && t[i+1].typ === 'av'){
          i += 2;
          var bas = term();
          return bas === null ? null : tk.v / 100 * bas;
        }
        return tk.v;
      }
      return null;
    }

    function term(){
      var v = faktor();
      if(v === null) return null;
      while(t[i] && (t[i].typ === '*' || t[i].typ === '/')){
        var op = t[i].typ; i++;
        var h = faktor();
        if(h === null) return null;
        if(op === '/' && h === 0) return null;
        v = op === '*' ? v * h : v / h;
      }
      return v;
    }

    function uttryck(){
      var v = term();
      if(v === null) return null;
      while(t[i] && (t[i].typ === '+' || t[i].typ === '-')){
        var op = t[i].typ; i++;
        /* "40 000 - 20 %" drar av tjugo procent av vänsterledet */
        if(t[i] && t[i].typ === 'tal' && t[i+1] && t[i+1].typ === '%' &&
           !(t[i+2] && t[i+2].typ === 'av')){
          var andel = v * t[i].v / 100;
          v = op === '+' ? v + andel : v - andel;
          i += 2;
          continue;
        }
        var h = term();
        if(h === null) return null;
        v = op === '+' ? v + h : v - h;
      }
      return v;
    }

    var svar = uttryck();
    if(svar === null || i !== t.length) return null;        /* skräp kvar */
    return isFinite(svar) ? svar : null;
  }

  /* ---------- formatering ---------- */
  function formatera(n){
    var avrundat = Math.round(n * 100) / 100;
    return avrundat.toLocaleString('sv-SE', {maximumFractionDigits:2});
  }

  /* ---------- raden markören står på ---------- */
  function aktuellRad(){
    var pos = ruta.selectionStart;
    var text = ruta.value;
    var start = text.lastIndexOf('\n', pos - 1) + 1;
    var slut = text.indexOf('\n', pos);
    if(slut < 0) slut = text.length;
    return {text:text.slice(start, slut), start:start, slut:slut};
  }

  /* Etiketten före kolon hör till mallen, inte till uträkningen. */
  function uttryckDelen(rad){
    var kolon = rad.lastIndexOf(':');
    return kolon >= 0 ? rad.slice(kolon + 1) : rad;
  }

  function tolka(rad){
    var del = uttryckDelen(rad).replace(/\bkr\b/gi, '').trim();
    if(!del) return null;
    /* Datum ser ut som räkning men är det inte. Dag/månad kräver rimliga
       tal, annars blockeras division som 15000/4. */
    if(/\b\d{4}-\d{1,2}-\d{1,2}\b/.test(del)) return null;
    var dm = del.match(/\b(\d{1,2})\/(\d{1,2})\b/);
    if(dm && +dm[1] >= 1 && +dm[1] <= 31 && +dm[2] >= 1 && +dm[2] <= 12) return null;
    /* Ett ensamt tal är inget att räkna ut. */
    if(!/[+\-*/×·÷x%]/i.test(del)) return null;
    if(!/\d/.test(del)) return null;
    var t = dela(del);
    if(!t || !t.length) return null;
    var svar = rakna(t);
    return svar === null ? null : {text:del, svar:svar};
  }

  var senaste = null;

  function visa(){
    var rad = aktuellRad();
    var r = tolka(rad.text);
    senaste = r ? {rad:rad, r:r} : null;
    if(!r){ strip.hidden = true; return; }
    var enhet = /\bkr\b/i.test(rad.text) ? ' kr' : '';
    uttryckEl.textContent = r.text.replace(/\s+/g,' ').trim() + '  =';
    svarEl.textContent = formatera(r.svar) + enhet;
    strip.hidden = false;
  }

  /* Skriver in svaret sist på raden. */
  function skrivIn(){
    if(!senaste) return;
    var rad = aktuellRad();
    var r = tolka(rad.text);
    if(!r) return;
    var enhet = /\bkr\b/i.test(rad.text) ? ' kr' : '';
    var ny = rad.text.replace(/[\s=]*$/, '') + ' = ' + formatera(r.svar) + enhet;
    ruta.value = ruta.value.slice(0, rad.start) + ny + ruta.value.slice(rad.slut);
    var pos = rad.start + ny.length;
    ruta.setSelectionRange(pos, pos);
    ruta.focus();
    strip.hidden = true;
    if(typeof saveNote === 'function') saveNote();
    if(typeof checkOklar === 'function') checkOklar();
  }

  ruta.addEventListener('input', function(){
    /* Likhetstecken sist på raden betyder "räkna ut det här". */
    var rad = aktuellRad();
    if(/=\s*$/.test(rad.text) && ruta.selectionStart === rad.slut){
      var utan = rad.text.replace(/=\s*$/, '');
      if(tolka(utan)){
        var r = tolka(utan);
        var enhet = /\bkr\b/i.test(rad.text) ? ' kr' : '';
        var ny = utan.replace(/\s*$/, '') + ' = ' + formatera(r.svar) + enhet;
        ruta.value = ruta.value.slice(0, rad.start) + ny + ruta.value.slice(rad.slut);
        var pos = rad.start + ny.length;
        ruta.setSelectionRange(pos, pos);
        strip.hidden = true;
        if(typeof saveNote === 'function') saveNote();
        return;
      }
    }
    visa();
  });

  ['click','keyup','focus'].forEach(function(h){
    ruta.addEventListener(h, visa);
  });
  ruta.addEventListener('blur', function(){
    /* Knappen ska hinna klickas innan remsan försvinner. */
    setTimeout(function(){ if(document.activeElement !== inKnapp) strip.hidden = true; }, 150);
  });
  inKnapp.addEventListener('click', skrivIn);

  /* Exponeras för testning och för panelen om den vill räkna själv. */
  window.nMatteRakna = function(rad){
    var r = tolka(rad);
    return r ? r.svar : null;
  };
})();
