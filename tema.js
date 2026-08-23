/* Mörkt läge och copyrightårtal — delas av alla sidor.
   Valet sparas i localStorage och gäller därmed hela sajten.

   OBS: den lilla snutten som sätter data-theme INNAN sidan ritas upp
   ligger kvar inline i <head> på varje sida. Den måste köras direkt,
   annars hinner sidan blinka vitt i mörkt läge. */

(function(){
  /* Årtal i copyright hålls aktuellt av sig självt. */
  document.querySelectorAll('.cpYear').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  var root = document.documentElement;
  var btn  = document.getElementById('themeToggle');
  if(!btn) return;

  function sync(){
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀️ Ljust' : '🌙 Mörkt';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Byt till ljust läge' : 'Byt till mörkt läge');
  }

  btn.addEventListener('click', function(){
    var dark = root.getAttribute('data-theme') === 'dark';
    if(dark) root.removeAttribute('data-theme');
    else     root.setAttribute('data-theme','dark');
    try{ localStorage.setItem('theme', dark ? 'light' : 'dark'); }catch(e){}
    sync();
  });

  /* Följ systemets läge så länge inget eget val gjorts. */
  try{
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
      if(localStorage.getItem('theme')) return;
      if(e.matches) root.setAttribute('data-theme','dark');
      else          root.removeAttribute('data-theme');
      sync();
    });
  }catch(e){}

  sync();
})();
