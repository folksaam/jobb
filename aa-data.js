/* Åldersavdrag — tabell och beräkning, delad av alla sidor.
   Ändra här, så följer båda sidorna med.
   no_deduction_years = fria år · deduction_rate = avdrag per år · max_years = max livslängd */
/* Höjs när sidorna börjar kräva något nytt härifrån. Sidorna kontrollerar
   den, så att en gammal kvarglömd kopia upptäcks direkt i stället för att
   få en panel att sluta räkna i tysthet. */
const AA_VERSION = 2;

const AA_ITEMS = [
  {"name":"Ackumulatortank","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Altantak (plast)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Annan väggbeklädnad (ej våtrum)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Avfuktare som fast installation (krypgrundsavfuktare)","no_deduction_years":5,"deduction_rate":0.08,"max_years":12},
  {"name":"Avloppspump","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Avloppstank (septitank)","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Badrumsskåp (inredning)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Badtunna","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Bergvärmepump/jordvärmepump/sjövärmepump","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Braskamin","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Bredbandsledning (exempelvis fiber)","no_deduction_years":20,"deduction_rate":0.05,"max_years":40},
  {"name":"Centraldammsugare maskin","no_deduction_years":5,"deduction_rate":0.1,"max_years":12},
  {"name":"Centraldammsugare rörsystem","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Diskmaskin","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Duschdörr/duschvägg (räknas som sanitetsgods)","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Dörr - FOLKSAM","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Dörr - 3KRONOR","no_deduction_years":10000,"deduction_rate":0.00001,"max_years":1000},
  {"name":"Elinstallation (ej elradiator, ej lampa/armatur)","no_deduction_years":20,"deduction_rate":0.05,"max_years":40},
  {"name":"Elpanna","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Elradiator","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Expansionskärl","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Fiberoptiksledning (exempelvis bredband)","no_deduction_years":20,"deduction_rate":0.05,"max_years":40},
  {"name":"Fjärrvärme","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Frys/kyl","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Frånluftsvärmepump","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"FTX/FX (värmeväxlare)","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Fönster - FOLKSAM","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Fönster - 3KRONOR","no_deduction_years":10000,"deduction_rate":0.00001,"max_years":1000},
  {"name":"Förbränningstoalett","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Garageport - FOLKSAM","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Garageport - 3KRONOR","no_deduction_years":10000,"deduction_rate":0.000001,"max_years":1000},
  {"name":"Golvbeläggning (ej våtrum) - Homogent trä","no_deduction_years":20,"deduction_rate":0.05,"max_years":36},
  {"name":"Golvbeläggning (ej våtrum) - Keramiska plattor (kakel/klinker)","no_deduction_years":15,"deduction_rate":0.05,"max_years":31},
  {"name":"Golvbeläggning (ej våtrum) - Lamellträ (parkett)","no_deduction_years":15,"deduction_rate":0.05,"max_years":31},
  {"name":"Golvbeläggning (ej våtrum) - Laminat","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Golvbeläggning (ej våtrum) - Linoleum","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Golvbeläggning (ej våtrum) - Plast","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Golvbeläggning (ej våtrum) - Textilia","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Golvmatta, trådsvetsad (våtrumsbeklädnad, inklusive tätskikt)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Golvvärme, elslinga - FOLKSAM (B14 gäller EJ i våtrumsgolv)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Golvvärme, elslinga - 3KRONOR","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Golvvärme, vattenburen","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Golvvärmetermostat","no_deduction_years":20,"deduction_rate":0.05,"max_years":40},
  {"name":"Gummidukstak","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Homogent trägolv (ej våtrum)","no_deduction_years":20,"deduction_rate":0.05,"max_years":36},
  {"name":"Hushållsmaskin (exempelvis vitvaror)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Hydroforpump","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Kakelugn","no_deduction_years":25,"deduction_rate":0.02,"max_years":75},
  {"name":"Keramiska plattor, kakel/klinker (ej våtrum)","no_deduction_years":15,"deduction_rate":0.05,"max_years":31},
  {"name":"Keramiska plattor, kakel/klinker (våtrumsbeklädnad, inklusive tätskikt)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Keramisk eldstad i värmepanna","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Krypgrundsavfuktare","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Kollektorslang till bergvärme/jordvärme","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Kyl/frys (även vinkyl)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Köksfläkt","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Köksinredning","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Larm - FOLKSAM","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Larm - 3KRONOR","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Lamellträ golvbeläggning - parkett (ej våtrum)","no_deduction_years":15,"deduction_rate":0.05,"max_years":31},
  {"name":"Laminat golvbeläggning (ej våtrum)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Ledningar för fiberoptik och bredband (dataöverföring)","no_deduction_years":20,"deduction_rate":0.05,"max_years":40},
  {"name":"Liner (till pool)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Linoleum golvbeläggning (ej våtrum)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Luft/luft värmepumpsanläggning","no_deduction_years":2,"deduction_rate":0.15,"max_years":9},
  {"name":"Luft/vatten värmepumpsanläggning","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Lås - FOLKSAM","no_deduction_years":15,"deduction_rate":0.05,"max_years":31},
  {"name":"Lås - 3KRONOR","no_deduction_years":10000,"deduction_rate":0.00001,"max_years":1000},
  {"name":"Markis","no_deduction_years":2,"deduction_rate":0.1,"max_years":10},
  {"name":"Maskinell utrustning (ej hushållsmaskin)","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Mulltoa","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Murad öppen spis","no_deduction_years":25,"deduction_rate":0.02,"max_years":65},
  {"name":"Målning in- och utvändig (ej våtrum)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Målning i våtrum (samt övrig beklädnad)","no_deduction_years":2,"deduction_rate":0.1,"max_years":10},
  {"name":"Natursten (våtrumsbeklädnad, inklusive tätskikt)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Oljecistern","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Panna","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Panna (kopplad till värmepump, exempelvis keramisk eldstad)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Papptak","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Parkett golvbeläggning - lamellträ (ej våtrum)","no_deduction_years":15,"deduction_rate":0.05,"max_years":31},
  {"name":"Pelletsbrännare","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Plastgolvbeläggning (ej våtrum)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Plasttak","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Pool - maskinell utrustning","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Poolduk/konstruktion","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Pooldammsugare/poolrobot","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Poolvärmepump","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Radioantenn/mast","no_deduction_years":2,"deduction_rate":0.1,"max_years":10},
  {"name":"Radonett/radonsug/radonavskiljare","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Reningsverk","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Rörsystem (kall/varmvatten, värmesystem, avlopp, blandare, diskho)","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Sanitetsgods (toalettstol, badkar, tvättställ (ej maskinell utrustning))","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Skorsten (annat material, ej plåt eller stål)","no_deduction_years":25,"deduction_rate":0.02,"max_years":65},
  {"name":"Skorsten (plåt, stål)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Skåp (fast inredning)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Smarta hem","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Solfångare","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Solpanel (solceller)","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Spabad utomhus - FOLKSAM","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Spabad utomhus - 3KRONOR","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Spis","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Takbeläggning (papp, plast eller gummiduk)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Takbeläggning (övrigt, ej papp, plast eller gummiduk)","no_deduction_years":25,"deduction_rate":0.02,"max_years":65},
  {"name":"Takvärme","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Tapetsering","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Textilia golvbeläggning (ej våtrum)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Trägolv, homogent (ej våtrum)","no_deduction_years":20,"deduction_rate":0.05,"max_years":36},
  {"name":"TV-antenn/parabol","no_deduction_years":2,"deduction_rate":0.1,"max_years":10},
  {"name":"Tvättmaskin","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Vakuumtoalett","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Varmvattenberedare (fristående)","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Varmvattenberedare (kopplad till värmepump)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Vattenpump (djupvattenpump)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Vattenradiator","no_deduction_years":10,"deduction_rate":0.05,"max_years":30},
  {"name":"Vedpanna/gaspanna","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Vindkraftverk","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Våtrumsbeklädnad inklusive tätskikt - golv- & väggmatta (trådsvetsad)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Våtrumsbeklädnad inklusive tätskikt - keramiska plattor (kakel/klinker)","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Våtrumsbeklädnad inklusive tätskikt - målning i våtrum","no_deduction_years":2,"deduction_rate":0.1,"max_years":10},
  {"name":"Våtrumsbeklädnad inklusive tätskikt - natursten","no_deduction_years":10,"deduction_rate":0.05,"max_years":26},
  {"name":"Våtrumsbeklädnad inklusive tätskikt - övriga golv- & väggbeklädnad","no_deduction_years":2,"deduction_rate":0.1,"max_years":10},
  {"name":"Väggbeklädnad (annan, ej våtrum)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Väggmatta, trådsvetsad (våtrumsbeklädnad, inklusive tätskikt)","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Värmepanna","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Värmepanna (kopplad till värmepump, exempelvis keramisk eldstad)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Värmepumpsanläggning (ej luft/luft)","no_deduction_years":2,"deduction_rate":0.1,"max_years":12},
  {"name":"Värmepumpsanläggning (luft/luft)","no_deduction_years":2,"deduction_rate":0.15,"max_years":9},
  {"name":"Värmeväxlare (FTX/FX)","no_deduction_years":5,"deduction_rate":0.08,"max_years":18},
  {"name":"Öppen spis (murad)","no_deduction_years":25,"deduction_rate":0.02,"max_years":65},
  {"name":"Övrig maskininstallation","no_deduction_years":5,"deduction_rate":0.08,"max_years":15},
  {"name":"Duschkabin","no_deduction_years":5,"deduction_rate":0.08,"max_years":15}
];

/* ---------------------------------------------------------------------------
   Beräkningen bor här så att kalkylatorn, panelen på villkorssidan och
   villkorsassistenten omöjligt kan visa olika siffror för samma objekt.
   --------------------------------------------------------------------------- */

/* Andel åldersavdrag som decimal, t.ex. 0.6 för 60 %. */
function aaAndel(item, alder){
  if(!item || !isFinite(alder)) return 0;
  var avd = 0;
  if(alder > item.no_deduction_years){
    avd = (alder - item.no_deduction_years) * item.deduction_rate;
    var tak = item.deduction_rate * (item.max_years - item.no_deduction_years);
    if(avd > tak) avd = tak > 1 ? 1 : tak;
  }
  return avd;
}

/* Procent utan flyttalsbrus — 0.6000000000000001 blir "60 %", inte "60.00 %". */
function aaProcent(andel){
  var p = Math.round(andel * 1000) / 10;
  return (p % 1 ? p.toFixed(1) : p.toFixed(0)) + ' %';
}

/* Ålder i år från installationsdatum till jämförelsedatum.
   Påbörjat år räknas som helt — därav det avslutande ++. */
function aaAlderFranDatum(installDatum, jamforDatum){
  if(!installDatum) return NaN;
  var idag = jamforDatum ? new Date(jamforDatum) : new Date();
  var satt = new Date(installDatum);
  if(isNaN(idag) || isNaN(satt)) return NaN;
  var alder = idag.getFullYear() - satt.getFullYear();
  if(idag.getMonth() < satt.getMonth() ||
     (idag.getMonth() === satt.getMonth() && idag.getDate() < satt.getDate())){
    alder--;
  }
  return alder + 1;
}
