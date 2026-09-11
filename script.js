
const SUPABASE_URL = "https://hjuhkahwegrpnkuloffv.supabase.co";
const SUPABASE_KEY = "sb_publishable_mQo_zNFS4VkO2CltL4yRCA__zuhaMXP";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (s, scope=document) => scope.querySelector(s);
const $$ = (s, scope=document) => [...scope.querySelectorAll(s)];


// ==================== BASIC PHOTO PROTECTION ====================
// Membuat pengambilan foto dari halaman menjadi lebih sulit.
// Ini bukan proteksi 100% karena screenshot/DevTools tetap bisa dilakukan.

// Blokir klik kanan/context menu.
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
}, {passive:false});

// Blokir drag/drop untuk gambar.
document.addEventListener("dragstart", (e) => {
  if (e.target?.tagName === "IMG" || e.target?.closest?.("img, .photo-card, .hero-polaroid")) {
    e.preventDefault();
  }
}, {passive:false});

// Blokir select/copy pada gambar.
document.addEventListener("selectstart", (e) => {
  if (e.target?.closest?.("img, .photo-card, .hero-polaroid")) {
    e.preventDefault();
  }
}, {passive:false});

// Blokir shortcut umum untuk save/source/devtools.
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // Ctrl/Cmd + S
  if ((e.ctrlKey || e.metaKey) && key === "s") {
    e.preventDefault();
    return;
  }

  // Ctrl/Cmd + U
  if ((e.ctrlKey || e.metaKey) && key === "u") {
    e.preventDefault();
    return;
  }

  // Ctrl/Cmd + Shift + I/J/C
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i","j","c"].includes(key)) {
    e.preventDefault();
    return;
  }

  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }
}, {passive:false});

// Pastikan semua gambar baru dari Supabase/lazy loading juga terlindungi.
function protectImages(scope=document){
  $$("img", scope).forEach((img) => {
    img.setAttribute("draggable", "false");
    img.setAttribute("oncontextmenu", "return false");
  });
}

// Jalankan awal dan pantau gambar yang ditambahkan secara dinamis.
protectImages();

const imageProtectionObserver = new MutationObserver(() => protectImages());
imageProtectionObserver.observe(document.body, {childList:true, subtree:true});


const modal = $("#modal");
const modalInner = $("#modalInner");
const toast = $("#toast");
const heartRain = $("#heartRain");
const cursorFlowerLayer = $("#cursorFlowerLayer");

// Soft flower particles trail the cursor on desktop.
const flowerSymbols = ["✿", "❀", "✧", "❁"];
const flowerColors = ["#78bdf2", "#9fd8ff", "#ff9fca", "#b5a8ff"];
let lastFlowerAt = 0;

function spawnCursorFlower(x, y){
  if(!cursorFlowerLayer || window.matchMedia("(pointer: coarse)").matches) return;
  const now = performance.now();
  if(now - lastFlowerAt < 55) return;
  lastFlowerAt = now;
  const flower = document.createElement("span");
  flower.className = "cursor-flower";
  flower.textContent = flowerSymbols[Math.floor(Math.random()*flowerSymbols.length)];
  flower.style.left = `${x}px`;
  flower.style.top = `${y}px`;
  flower.style.setProperty("--flower-color", flowerColors[Math.floor(Math.random()*flowerColors.length)]);
  flower.style.setProperty("--flower-size", `${12 + Math.random()*9}px`);
  flower.style.setProperty("--fx", `${(Math.random()*34 - 17).toFixed(1)}px`);
  flower.style.setProperty("--fy", `${(-18 - Math.random()*28).toFixed(1)}px`);
  flower.style.setProperty("--fr", `${Math.round(Math.random()*80 - 40)}deg`);
  cursorFlowerLayer.appendChild(flower);
  setTimeout(()=>flower.remove(), 1000);
}

window.addEventListener("pointermove", (e)=>spawnCursorFlower(e.clientX, e.clientY), {passive:true});

// Hide the navbar at the very top; reveal it as a compact sticky bar once the page scrolls.
const navWrap = document.querySelector(".nav-wrap");
function updateNavVisibility(){
  navWrap?.classList.toggle("nav-visible", window.scrollY > 40);
}
window.addEventListener("scroll", updateNavVisibility, {passive:true});
updateNavVisibility();

function openModal(html){
  modalInner.innerHTML = html;
  modal.classList.add("show");
}
function closeModal(){ modal.classList.remove("show"); }
$("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if(e.target === modal) closeModal(); });

function notify(text){
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>toast.classList.remove("show"),2200);
}

// ==================== BACKGROUND MUSIC ====================
const bgMusic = $("#bgMusic");
const musicBtn = $("#musicBtn");
let musicStarted = false;

function setMusicButton(){
  if(!musicBtn || !bgMusic) return;
  const playing = !bgMusic.paused;
  const lang = document.documentElement.lang === "id" ? "id" : "en";
  const labels = lang === "id"
    ? { play: "Putar lagu", pause: "Jeda lagu" }
    : { play: "Play music", pause: "Pause music" };
  musicBtn.textContent = playing ? "♫" : "♪";
  musicBtn.classList.toggle("music-playing", playing);
  musicBtn.title = playing ? labels.pause : labels.play;
  musicBtn.setAttribute("aria-label", playing ? labels.pause : labels.play);
}

async function startBackgroundMusic(){
  if(!bgMusic || musicStarted) return;
  try{
    bgMusic.volume = 0.24;
    await bgMusic.play();
    musicStarted = true;
    setMusicButton();
  }catch(_){
    // Browser may block autoplay with sound. The first user interaction will start it.
  }
}

function startMusicFromInteraction(){
  if(musicStarted || !bgMusic) return;
  bgMusic.volume = 0.24;
  bgMusic.play().then(()=>{
    musicStarted = true;
    setMusicButton();
  }).catch(()=>{});
}

window.addEventListener("load", startBackgroundMusic);
["pointerdown","keydown","touchstart"].forEach(eventName=>{
  window.addEventListener(eventName, startMusicFromInteraction, {once:true, passive:true});
});

musicBtn?.addEventListener("click", async ()=>{
  if(!bgMusic) return;
  if(bgMusic.paused){
    bgMusic.volume = 0.24;
    try{ await bgMusic.play(); musicStarted = true; }catch(_){}
  }else{
    bgMusic.pause();
  }
  setMusicButton();
});

function hearts(amount=16){
  for(let i=0;i<amount;i++){
    const h=document.createElement("span");
    h.className="heart";
    h.textContent=["♡","♥","✦","✧"][Math.floor(Math.random()*4)];
    h.style.left=(10+Math.random()*80)+"%";
    h.style.setProperty("--dx",(Math.random()*160-80)+"px");
    h.style.animationDelay=(Math.random()*.3)+"s";
    heartRain.appendChild(h);
    setTimeout(()=>h.remove(),2100);
  }
}

function applyTheme(theme, announce=false){
  const dark = theme === "dark";
  document.body.classList.toggle("dark", dark);
  const btn = $("#themeBtn");
  if(btn){
    btn.textContent = dark ? "☾" : "☼";
    btn.title = dark ? "Light mode" : "Dark mode";
    btn.setAttribute("aria-label", dark ? "Light mode" : "Dark mode");
  }
  localStorage.setItem("archiveTheme", dark ? "dark" : "light");
  if(announce){
    const lang = document.documentElement.lang === "id" ? "id" : "en";
    notify(dark ? (lang === "id" ? "mode gelap ♡" : "dark mode ♡") : (lang === "id" ? "mode terang ♡" : "light mode ♡"));
  }
}

$("#themeBtn").addEventListener("click", ()=>{
  applyTheme(document.body.classList.contains("dark") ? "light" : "dark", true);
});

// Dark mode sebagai default, tetapi pilihan terakhir tetap disimpan.
applyTheme(localStorage.getItem("archiveTheme") || "dark", false);

$("#menuBtn").addEventListener("click", ()=>$("#mobileMenu").classList.toggle("show"));
$$(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>$("#mobileMenu").classList.remove("show")));

let archivePhotos = [];
let photoCards = $$(".photo-card");
const filters = $$(".filter");

function esc(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizePhoto(row, index){
  return {
    ...row,
    id: row.id ?? index + 1,
    image_url: row.image_url || `assets/memory-${String(index + 1).padStart(2,"0")}.jpg`,
    title: row.title || `Memory ${index + 1}`,
    caption: row.caption || "saved immediately.",
    category: row.category || "random",
    is_favorite: !!row.is_favorite,
    is_hero: !!row.is_hero
  };
}

function photoLayoutClass(index){
  if(index === 0) return "tall";
  if(index === 4) return "wide";
  return "";
}

function renderGallery(photos){
  const grid = $("#galleryGrid");
  if(!grid) return;
  grid.innerHTML = photos.map((photo, index)=>{
    const layout = photoLayoutClass(index);
    const photoClass = `photo real-photo photo${index+1}`;
    return `
      <button class="photo-card glass ${layout}" data-id="${esc(photo.id)}" data-category="${esc(photo.category)}" data-title="${esc(photo.title)}" data-caption="${esc(photo.caption)}" data-photo="${esc(photo.image_url)}">
        <span class="${photoClass}"><img src="${esc(photo.image_url)}" alt="${esc(photo.title)}" loading="lazy" /></span>
        <span class="card-caption"><b>${esc(photo.title)}</b><small>${esc(photo.caption)}</small></span>
      </button>
    `;
  }).join("");

  photoCards = $$(".photo-card", grid);
  photoCards.forEach(card=>card.addEventListener("click",()=>showPhoto(card)));
  $("#photoCount") && ($("#photoCount").textContent = photos.length);
  applyPhotoFilter($(".filter.active")?.dataset.filter || "all");
}

function applyPhotoFilter(filter){
  photoCards.forEach(card=>{
    card.style.display = (filter === "all" || card.dataset.category === filter) ? "" : "none";
  });
}

filters.forEach(f=>{
  f.addEventListener("click",()=>{
    filters.forEach(x=>x.classList.remove("active"));
    f.classList.add("active");
    applyPhotoFilter(f.dataset.filter);
  });
});

function showPhoto(card){
  const title=card.dataset.title;
  const caption=card.dataset.caption;
  const image=card.dataset.photo;
  const lang = document.documentElement.lang === "id" ? "id" : "en";
  const note = lang === "id" ? "Disimpan di arsip website." : "Stored in the website archive.";
  openModal(`
    <small>photo archive</small>
    <h3>${esc(title)}</h3>
    <img class="modal-photo" src="${esc(image)}" alt="${esc(title)}">
    <p>${esc(caption)}</p>
    <div class="modal-note">${note}</div>
  `);
}

photoCards.forEach(card=>card.addEventListener("click",()=>showPhoto(card)));

function randomVisibleCard(){
  const visible=photoCards.filter(c=>getComputedStyle(c).display!=="none");
  return visible[Math.floor(Math.random()*visible.length)];
}
function randomPhoto(){
  const card=randomVisibleCard();
  if(!card)return;
  hearts(8);
  showPhoto(card);
}
$("#randomPhoto")?.addEventListener("click",randomPhoto);
$("#randomHero")?.addEventListener("click",()=>{
  $("#gallery")?.scrollIntoView({behavior:"smooth"});
  setTimeout(randomPhoto,450);
});
$("#photoCount") && ($("#photoCount").textContent=photoCards.length);

const notesContainer = $(".note-stack");
function bindNotes(){
  $$(".open-note", notesContainer || document).forEach(note=>note.addEventListener("click",()=>{
    $("#previewTitle").textContent=note.dataset.title;
    $("#previewBody").textContent=note.dataset.body;
    hearts(5);
  }));
}
bindNotes();
$(".open-note", notesContainer || document)?.click?.();

$("#addNote")?.addEventListener("click",()=>openAdminPanel("notes"));

$("#secretBtn").addEventListener("click",()=>{
  hearts(22);
  openModal(`
    <div style="font-size:3.7rem;color:var(--pink);line-height:1">♡</div>
    <small>secret corner</small>
    <h3>Okay, you found it.</h3>
    <p>Isi rahasianya belum dimasukkan. Tempat ini bisa kamu pakai nanti untuk foto paling favorit, video, tulisan panjang, atau sesuatu yang cuma kamu yang tahu.</p>
    <div class="modal-note">Pintu rahasianya sengaja dibuat simpel. Nanti password, animasi, dan isinya bisa kamu tentukan sendiri.</div>
  `);
});

document.addEventListener("dblclick", e=>{
  if(e.target.closest(".photo-card") || e.target.closest(".hero-polaroid")){
    hearts(14);
    notify(document.documentElement.lang === "id" ? "oke... foto itu memang pantas dilihat lagi ♡" : "okay... that photo deserved another look ♡");
  }
});

let heroPhotos=[
 {src:"assets/memory-02.jpg",title:"Tiny Smile",caption:"dangerously cute."},
 {src:"assets/memory-03.jpg",title:"Soft Pink Day",caption:"saved immediately."},
 {src:"assets/memory-04.jpg",title:"Close Up",caption:"zero context, full charm."},
 {src:"assets/memory-05.jpg",title:"A Good Day",caption:"a little too adorable."},
 {src:"assets/memory-06.jpg",title:"That Look",caption:"saved on sight."},
 {src:"assets/memory-01.jpg",title:"The Pretty One",caption:"no explanation needed."}
];

async function loadPhotosFromSupabase(){
  try{
    const { data, error } = await db.from("photos").select("*").order("id", {ascending:true});
    if(error) throw error;
    if(!Array.isArray(data) || data.length === 0) return;

    archivePhotos = data.map(normalizePhoto);
    renderGallery(archivePhotos);

    const heroData = [
      ...archivePhotos.filter(p=>p.is_hero),
      ...archivePhotos.filter(p=>!p.is_hero)
    ];
    heroPhotos = heroData.slice(0, Math.min(6, heroData.length)).map(p=>({
      src:p.image_url,
      title:p.title,
      caption:p.caption || "saved immediately."
    }));
    if(heroPhotos.length){
      heroPhotoIndex = 0;
      showHeroPhoto(0);
      resetHeroTimer();
    }
  }catch(error){
    console.error("Supabase photos error:", error);
  }
}

async function loadNotesFromSupabase(){
  if(!notesContainer) return;
  try{
    const {data,error}=await db.from("notes").select("*").eq("is_visible",true).order("created_at",{ascending:false});
    if(error) throw error;
    if(!data?.length) return;
    notesContainer.innerHTML=data.map((note,i)=>`
      <button class="note-card glass open-note" data-title="${esc(note.title)}" data-body="${esc(note.body)}">
        <span>${String(i+1).padStart(2,"0")}</span><b>${esc(note.title)}</b><small>“${esc(note.body).slice(0,42)}${String(note.body).length>42?"…":""}”</small>
      </button>
    `).join("");
    bindNotes();
    notesContainer.querySelector(".open-note")?.click();
  }catch(error){ console.error("Supabase notes error:", error); }
}

async function loadFavoritesFromSupabase(){
  const ranking=$(".ranking");
  if(!ranking) return;
  try{
    const {data,error}=await db.from("favorites").select("*").order("sort_order",{ascending:true});
    if(error) throw error;
    if(!data?.length) return;
    ranking.innerHTML=data.map((item,i)=>{
      const rating=Math.max(0,Math.min(5,Number(item.rating)||0));
      return `<li><span>${String(i+1).padStart(2,"0")}</span><b>${esc(item.title)}</b><em>${"★".repeat(rating)}${"☆".repeat(5-rating)}</em></li>`;
    }).join("");
  }catch(error){ console.error("Supabase favorites error:", error); }
}

let firstMet = new Date("2026-08-20T19:18:00+07:00");
async function loadSettingsFromSupabase(){
  try{
    const {data,error}=await db.from("settings").select("*").order("id",{ascending:true}).limit(1);
    if(error) throw error;
    const settings=data?.[0];
    if(!settings) return;
    if(settings.site_title){
      document.title = settings.site_title + " ♡";
    }
    if(settings.default_language && !localStorage.getItem("archiveLang")) setLanguage(settings.default_language);
    if(settings.first_met){
      const parsed = new Date(settings.first_met);
      if(!Number.isNaN(parsed.getTime())) firstMet=parsed;
    }
    if(settings.music_url && bgMusic) bgMusic.src=settings.music_url;
    if(Number.isFinite(Number(settings.music_volume)) && bgMusic) bgMusic.volume=Math.max(0,Math.min(1,Number(settings.music_volume)));
    if(typeof settings.dark_mode === "boolean" && !localStorage.getItem("archiveTheme")) applyTheme(settings.dark_mode ? "dark" : "light", false);
  }catch(error){ console.error("Supabase settings error:", error); }
}

// ==================== SPOTIFY EMBED ====================
// Paste a Spotify playlist URL and load Spotify's official website embed.
const spotifyInput = $("#spotifyInput");
const spotifyFrame = $("#spotifyFrame");
const spotifyOpen = $("#spotifyOpen");
const loadSpotify = $("#loadSpotify");

function spotifyPlaylistId(value){
  try{
    const url = new URL(value.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.indexOf("playlist");
    if(index >= 0 && parts[index + 1]) return parts[index + 1].split("?")[0];
  }catch(_){}
  const match = value.match(/spotify:playlist:([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

function loadSpotifyPlaylist(){
  const id = spotifyPlaylistId(spotifyInput.value);
  if(!id){
    notify(document.documentElement.lang === "id"
      ? "Link playlist Spotify belum valid."
      : "That doesn't look like a valid Spotify playlist link.");
    return;
  }
  const clean = `https://open.spotify.com/playlist/${id}`;
  spotifyFrame.src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
  spotifyOpen.href = clean;
  localStorage.setItem("spotifyPlaylistUrl", clean);
  notify(document.documentElement.lang === "id" ? "Playlist Spotify dimuat ♫" : "Spotify playlist loaded ♫");
}

loadSpotify.addEventListener("click", loadSpotifyPlaylist);
spotifyInput.addEventListener("keydown", e=>{ if(e.key === "Enter") loadSpotifyPlaylist(); });

const savedSpotify = localStorage.getItem("spotifyPlaylistUrl");
if(savedSpotify){
  spotifyInput.value = savedSpotify;
  const savedId = spotifyPlaylistId(savedSpotify);
  if(savedId){
    spotifyFrame.src = `https://open.spotify.com/embed/playlist/${savedId}?utm_source=generator&theme=0`;
    spotifyOpen.href = savedSpotify;
  }
}


const translations = {
  en: {
    navGallery:"Gallery", navThings:"Little Things", navNotes:"Unsent Notes", navFavorites:"Favorites", navSince:"Since We Met", navPlaylist:"Playlist", musicPlay:"Play music", musicPause:"Pause music", themeDark:"Dark mode", themeLight:"Light mode", menu:"Menu", settings:"Settings",
    eyebrow:"a very small corner of the internet ♡",
    heroTitle:"Just a little place<br><em>for her.</em> 🌷",
    openArchive:"Open the archive →", surpriseMe:"Surprise me ✨",
    statPhotos:"favorite photos", micro1:"quietly saved", micro2:"one favorite girl", cardLabel:"HER LITTLE ARCHIVE", heroCardMini:"CURRENT FAVORITE", caption1:"probably my favorite", heroHint:"move your cursor · tap the photo · watch it change", statZoom:"times I've zoomed in", statGirl:"very pretty girl", statReason:"reason to keep scrolling",
    archiveTitle:"Photos I couldn't just leave alone.", randomPhoto:"Random photo ♡", viewAll:"view all ♡",
    littleTitle:"Things about her that are unfairly adorable.", notesTitle:"Unsent little notes.", writeNote:"+ write a note",
    favTitle:"The extremely important ranking.", secretTitle:"There is a secret corner.", knock:"Knock knock ♡",
    footerLeft:"made quietly, with way too much fondness. ♡", footerRight:"Her Little Archive · 2026",
    notePreview:"Click a note on the left. It will not be sent anywhere. Promise.",
    timelineDesc:"Add your own dates and captions later. The structure is ready.",
    sinceKicker:"since we first met",
    sinceTitle:"A tiny clock for a not-so-tiny memory.",
    sinceDesc:"Keeping count from the moment our story first started with a simple hello.",
    years:"years", months:"months", days:"days", hours:"hours", minutes:"minutes", seconds:"seconds", spotifyKicker:"spotify playlist", spotifyTitle:"Songs that remind me of her.", spotifyOpen:"Open Spotify ↗", spotifyHelp:"Paste any Spotify playlist URL above. The website converts it into Spotify's official embedded player."
  },
  id: {
    navGallery:"Galeri", navThings:"Hal-Hal Kecil", navNotes:"Catatan Belum Terkirim", navFavorites:"Favorit", navSince:"Sejak Bertemu", navPlaylist:"Playlist", musicPlay:"Putar lagu", musicPause:"Jeda lagu", themeDark:"Mode gelap", themeLight:"Mode terang", menu:"Menu", settings:"Pengaturan",
    eyebrow:"sudut kecil di internet yang cuma punya cerita tentang dia ♡",
    heroTitle:"Cuma sebuah tempat kecil<br><em>buat dia.</em> 🌷",
    heroLead:"Bukan apa-apa yang serius. Cuma tempat kecil untuk menyimpan foto-fotonya yang terasa terlalu sayang kalau dibiarkan tenggelam di galeri HP.",
    openArchive:"Buka arsipnya →", surpriseMe:"Kasih kejutan ✨",
    statPhotos:"foto favorit", micro1:"disimpan diam-diam", micro2:"satu cewek favorit", cardLabel:"ARSIP KECIL TENTANG DIA", heroCardMini:"FAVORIT SAAT INI", caption1:"mungkin favoritku", heroHint:"gerakkan kursor · klik foto · lihat fotonya berubah", statZoom:"berapa kali di-zoom", statGirl:"satu cewek cantik banget", statReason:"alasan buat terus scroll",
    archiveTitle:"Foto-foto yang nggak bisa dibiarkan begitu saja.", randomPhoto:"Foto acak ♡", viewAll:"lihat semua ♡",
    littleTitle:"Hal-hal tentang dia yang kelewat imut.", notesTitle:"Catatan kecil yang nggak jadi dikirim.", writeNote:"+ tulis catatan",
    favTitle:"Ranking yang sangat penting.", secretTitle:"Ada sudut rahasia di sini.", knock:"Tok tok ♡",
    footerLeft:"dibuat diam-diam dengan rasa suka yang kebanyakan. ♡", footerRight:"Her Little Archive · 2026",
    notePreview:"Klik salah satu catatan di sebelah kiri. Tenang, catatan ini tidak akan terkirim ke mana-mana.",
    timelineDesc:"Nanti tambahkan tanggal dan caption kalian sendiri. Strukturnya sudah siap.",
    sinceKicker:"sejak pertama kenal",
    sinceTitle:"Jam kecil untuk sebuah kenangan yang nggak kecil.",
    sinceDesc:"Menghitung dari saat pertama kali semuanya dimulai lewat sebuah sapaan sederhana.",
    years:"tahun", months:"bulan", days:"hari", hours:"jam", minutes:"menit", seconds:"detik", spotifyKicker:"playlist spotify", spotifyTitle:"Lagu-lagu yang mengingatkanku padanya.", spotifyOpen:"Buka Spotify ↗", spotifyHelp:"Tempel link playlist Spotify di atas. Website akan mengubahnya menjadi pemutar resmi Spotify."
  }
};

function setLanguage(lang){
  const t = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  localStorage.setItem("archiveLang", lang);

  $$("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  $$("[data-i18n-html]").forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  $$(".lang").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === lang));

  // Update non-text interface labels that do not use inner text.
  const dark = document.body.classList.contains("dark");
  const themeBtn = $("#themeBtn");
  const menuBtn = $("#menuBtn");
  if(themeBtn){
    const label = dark ? t.themeLight : t.themeDark;
    themeBtn.title = label;
    themeBtn.setAttribute("aria-label", label);
  }
  if(menuBtn){
    menuBtn.title = t.menu;
    menuBtn.setAttribute("aria-label", t.menu);
  }
  const adminBtn = $("#adminBtn");
  if(adminBtn){
    adminBtn.title = t.settings;
    adminBtn.setAttribute("aria-label", t.settings);
  }
  const adminMenuBtn = $("#adminMenuBtn");
  if(adminMenuBtn){
    const span = $("[data-i18n=\"settings\"]", adminMenuBtn);
    if(span) span.textContent = t.settings;
  }
  setMusicButton();

  // Keep the filter language in sync.
  const labels = lang === "id"
    ? ["semua","cantik","imut","acak","outfit"]
    : ["all","pretty","cute","random","outfit"];
  $$(".filter").forEach((btn,i) => { btn.textContent = labels[i] || ""; });
}

$$(".lang").forEach(btn => btn.addEventListener("click", () => setLanguage(btn.dataset.lang)));
setLanguage(localStorage.getItem("archiveLang") || "en");

// ---------- Interactive hero photo card ----------
let heroPhotoIndex=0,heroTimer=null;
const heroStage=document.getElementById("heroStage"),heroCard=document.getElementById("heroCard"),heroPhoto=document.getElementById("heroMainPhoto"),heroPhotoWindow=document.getElementById("heroPhotoWindow"),heroIndex=document.getElementById("heroIndex"),heroTitle=document.getElementById("heroPhotoTitle"),heroCaption=document.getElementById("heroPhotoCaption"),heroDots=document.getElementById("heroDots"),peekBack=document.getElementById("peekBack"),peekSide=document.getElementById("peekSide");
function buildHeroDots(){if(!heroDots)return;heroDots.innerHTML=heroPhotos.map((_,i)=>`<span class="hero-dot ${i===heroPhotoIndex?"active":""}"></span>`).join("")}
function showHeroPhoto(index){heroPhotoIndex=(index+heroPhotos.length)%heroPhotos.length;const item=heroPhotos[heroPhotoIndex];heroPhotoWindow.classList.add("changing");setTimeout(()=>{heroPhoto.src=item.src;heroTitle.textContent=item.title;heroCaption.textContent=item.caption;heroIndex.textContent=`${String(heroPhotoIndex+1).padStart(2,"0")} / 06`;peekBack.src=heroPhotos[(heroPhotoIndex+1)%heroPhotos.length].src;peekSide.src=heroPhotos[(heroPhotoIndex+heroPhotos.length-1)%heroPhotos.length].src;heroPhotoWindow.classList.remove("changing");buildHeroDots()},150)}
function resetHeroTimer(){clearInterval(heroTimer);heroTimer=setInterval(()=>{if(!document.hidden)showHeroPhoto(heroPhotoIndex+1)},5200)}
document.getElementById("nextHero")?.addEventListener("click",()=>{showHeroPhoto(heroPhotoIndex+1);resetHeroTimer()});document.getElementById("prevHero")?.addEventListener("click",()=>{showHeroPhoto(heroPhotoIndex-1);resetHeroTimer()});heroPhotoWindow?.addEventListener("click",()=>{showHeroPhoto(heroPhotoIndex+1);resetHeroTimer()});
document.getElementById("heroHeart")?.addEventListener("click",()=>{hearts(24);notify(document.documentElement.lang==="id"?"satu hati buat dia ♡":"one little heart for her ♡")});
heroStage?.addEventListener("pointermove",e=>{const r=heroStage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroStage.style.setProperty("--mx",`${50+x*24}%`);heroStage.style.setProperty("--my",`${50+y*22}%`);heroCard.style.transform=`translate3d(${x*12}px,${y*8}px,0) rotateX(${-y*9}deg) rotateY(${x*12}deg) rotateZ(2.2deg)`});
heroStage?.addEventListener("pointerleave",()=>{heroCard.style.transform="";heroStage.style.setProperty("--mx","50%");heroStage.style.setProperty("--my","50%")});
showHeroPhoto(0);resetHeroTimer();

// ==================== FIRST MET COUNTER ====================
// GANTI tanggal dan jam di baris ini sesuai kapan pertama kali kalian kenal.
// Format: YYYY-MM-DDTHH:MM:SS


function calendarDiff(from, to){
  if(to < from) return {years:0,months:0,days:0,hours:0,minutes:0,seconds:0};
  let cursor = new Date(from);
  let years = to.getFullYear() - cursor.getFullYear();
  cursor.setFullYear(cursor.getFullYear() + years);
  if(cursor > to){ years--; cursor.setFullYear(cursor.getFullYear() - 1); }

  let months = to.getMonth() - cursor.getMonth();
  if(months < 0) months += 12;
  cursor.setMonth(cursor.getMonth() + months);
  if(cursor > to){ months--; cursor.setMonth(cursor.getMonth() - 1); }

  let remaining = Math.floor((to - cursor) / 1000);
  const days = Math.floor(remaining / 86400); remaining %= 86400;
  const hours = Math.floor(remaining / 3600); remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return {years,months,days,hours,minutes,seconds};
}

function updateFirstMetClock(){
  const now = new Date();
  const d = calendarDiff(firstMet, now);
  $("#sinceYears").textContent = d.years;
  $("#sinceMonths").textContent = d.months;
  $("#sinceDays").textContent = d.days;
  $("#sinceHours").textContent = String(d.hours).padStart(2,"0");
  $("#sinceMinutes").textContent = String(d.minutes).padStart(2,"0");
  $("#sinceSeconds").textContent = String(d.seconds).padStart(2,"0");

  const lang = document.documentElement.lang === "id" ? "id-ID" : "en-US";
  $("#firstMetReadable").textContent =
    firstMet.toLocaleDateString(lang,{day:"numeric",month:"long",year:"numeric"}) +
    " · " +
    firstMet.toLocaleTimeString(lang,{hour:"2-digit",minute:"2-digit"});
}
updateFirstMetClock();
setInterval(updateFirstMetClock,1000);

async function loadSupabaseData(){
  await Promise.all([loadPhotosFromSupabase(), loadNotesFromSupabase(), loadFavoritesFromSupabase(), loadSettingsFromSupabase()]);
  updateFirstMetClock();
}

loadSupabaseData();


// ==================== ADMIN / SETTINGS ====================
const adminBtn = $("#adminBtn");
const adminMenuBtn = $("#adminMenuBtn");

const adminText = {
  en: {
    settings:"Settings", admin:"Admin", login:"Admin login", email:"Email", password:"Password", signIn:"Sign in", signOut:"Sign out",
    wrong:"Login failed. Check your admin email/password.", loginFirst:"Please login as admin first.", adminRequired:"This account is not registered as an admin.", close:"Close", save:"Save", add:"Add", edit:"Edit", delete:"Delete", cancel:"Cancel",
    notes:"Notes", favorites:"Favorites", photos:"Photos", settingsTab:"Settings", newNote:"New note", noteTitle:"Title", noteBody:"Note", visible:"Visible",
    newFavorite:"New favorite", favoriteTitle:"Title", favoriteDesc:"Description", rating:"Rating", order:"Order", newPhoto:"New photo", file:"Image file", photoTitle:"Title", photoCaption:"Caption", category:"Category", hero:"Hero photo", favorite:"Favorite",
    siteTitle:"Site title", defaultLanguage:"Default language", darkMode:"Dark mode", musicUrl:"Music URL", volume:"Music volume", firstMet:"First met", saved:"Saved", added:"Added", deleted:"Deleted", requiresAuth:"Only authenticated admin users can change website content."
  },
  id: {
    settings:"Pengaturan", admin:"Admin", login:"Login admin", email:"Email", password:"Password", signIn:"Masuk", signOut:"Keluar",
    wrong:"Login gagal. Cek email/password admin.", loginFirst:"Silakan login sebagai admin dulu.", adminRequired:"Akun ini belum terdaftar sebagai admin.", close:"Tutup", save:"Simpan", add:"Tambah", edit:"Edit", delete:"Hapus", cancel:"Batal",
    notes:"Catatan", favorites:"Favorit", photos:"Foto", settingsTab:"Pengaturan", newNote:"Catatan baru", noteTitle:"Judul", noteBody:"Isi catatan", visible:"Tampil",
    newFavorite:"Favorit baru", favoriteTitle:"Judul", favoriteDesc:"Deskripsi", rating:"Rating", order:"Urutan", newPhoto:"Foto baru", file:"File foto", photoTitle:"Judul", photoCaption:"Caption", category:"Kategori", hero:"Foto hero", favorite:"Favorit",
    siteTitle:"Judul website", defaultLanguage:"Bahasa default", darkMode:"Mode gelap", musicUrl:"URL musik", volume:"Volume musik", firstMet:"Pertama bertemu", saved:"Tersimpan", added:"Ditambahkan", deleted:"Dihapus", requiresAuth:"Hanya admin yang sudah login yang dapat mengubah isi website."
  }
};
function al(){ return adminText[document.documentElement.lang === "id" ? "id" : "en"]; }
function adminShell(content){
  return `<div class="admin-panel"><button class="modal-close" id="adminClose">×</button>${content}</div>`;
}

async function currentAdmin(){
  const { data } = await db.auth.getUser();
  const user = data?.user || null;
  if(!user) return null;
  const { data: isAdmin, error } = await db.rpc("is_admin");
  if(error || isAdmin !== true) return null;
  return user;
}

async function openAdminPanel(tab="settings"){
  const { data: sessionData } = await db.auth.getSession();
  const signedInUser = sessionData?.session?.user || null;
  if(!signedInUser){
    renderAdminLogin();
    return;
  }
  const admin = await currentAdmin();
  if(!admin){
    notify(document.documentElement.lang === "id"
      ? "Akun ini belum terdaftar sebagai admin."
      : "This account is not registered as an admin.");
    return;
  }
  renderAdminShell(tab, admin);
}

function renderAdminLogin(){
  const t=al();
  openModal(adminShell(`
    <div class="admin-auth">
      <span class="admin-kicker">${esc(t.settings)}</span>
      <h3>${esc(t.login)}</h3>
      <p class="admin-help">${esc(t.requiresAuth)}</p>
      <form class="admin-form" id="adminLoginForm">
        <label>${esc(t.email)}<input id="adminEmail" type="email" autocomplete="username" required /></label>
        <label>${esc(t.password)}<input id="adminPassword" type="password" autocomplete="current-password" required /></label>
        <div class="admin-actions"><button class="btn primary" type="submit">${esc(t.signIn)}</button></div>
      </form>
    </div>
  `));
  $("#adminClose")?.addEventListener("click", closeModal);
  $("#adminLoginForm")?.addEventListener("submit", async e=>{
    e.preventDefault();
    const email=$("#adminEmail").value.trim(), password=$("#adminPassword").value;
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error){ notify(t.wrong); return; }
    const admin = await currentAdmin();
    if(!admin){
      await db.auth.signOut();
      notify(document.documentElement.lang === "id"
        ? "Login berhasil, tetapi akun ini belum didaftarkan sebagai admin."
        : "Login succeeded, but this account is not registered as an admin.");
      return;
    }
    notify(t.saved);
    renderAdminShell("settings", admin);
  });
}

function adminTabs(active){
  const t=al();
  return `<div class="admin-tabs">
    ${["settings","photos","notes","favorites"].map(x=>`<button class="admin-tab ${active===x?"active":""}" data-admin-tab="${x}">${esc(t[x+"Tab"] || t[x])}</button>`).join("")}
  </div>`;
}

async function renderAdminShell(tab="settings", user=null){
  if(!user) user=await currentAdmin();
  if(!user){ renderAdminLogin(); return; }
  const t=al();
  openModal(adminShell(`<div class="admin-shell"><div><span class="admin-kicker">${esc(t.settings)}</span><h3>${esc(t.admin)}</h3><p class="admin-help">${esc(user.email || "")}</p></div>${adminTabs(tab)}<div id="adminContent"></div><div class="admin-actions"><button class="btn secondary small" id="adminLogout">${esc(t.signOut)}</button></div></div>`));
  $("#adminClose")?.addEventListener("click",closeModal);
  $$("[data-admin-tab]").forEach(b=>b.addEventListener("click",()=>renderAdminShell(b.dataset.adminTab,user)));
  $("#adminLogout")?.addEventListener("click",async()=>{await db.auth.signOut();closeModal();notify(t.signOut);});
  if(tab==="settings") await renderAdminSettings();
  if(tab==="photos") await renderAdminPhotos();
  if(tab==="notes") await renderAdminNotes();
  if(tab==="favorites") await renderAdminFavorites();
}

async function renderAdminSettings(){
  const t=al();
  const box=$("#adminContent"); if(!box)return;
  const {data}=await db.from("settings").select("*").order("id",{ascending:true}).limit(1);
  const s=data?.[0] || {};
  const vol=Number.isFinite(Number(s.music_volume))?Number(s.music_volume):0.24;
  box.innerHTML=`
    <form class="admin-form" id="settingsForm">
      <div class="admin-setting-grid">
        <div class="admin-card">
          <div><div class="admin-card-title">${esc(t.siteTitle)}</div><div class="admin-card-sub">${esc(document.documentElement.lang==="id"?"Judul yang tampil di website.":"The title shown across the website.")}</div></div>
          <input id="setSiteTitle" value="${esc(s.site_title||"Her Little Archive")}" />
        </div>
        <div class="admin-card">
          <div><div class="admin-card-title">${esc(t.defaultLanguage)}</div><div class="admin-card-sub">${esc(document.documentElement.lang==="id"?"Bahasa awal saat website dibuka.":"Language used when the site opens.")}</div></div>
          <select id="setLang"><option value="id" ${s.default_language==="id"?"selected":""}>ID</option><option value="en" ${s.default_language!=="id"?"selected":""}>EN</option></select>
        </div>
        <div class="admin-card">
          <div><div class="admin-card-title">${esc(t.darkMode)}</div><div class="admin-card-sub">${esc(document.documentElement.lang==="id"?"Tampilan gelap sebagai tema default.":"Use dark mode as the default theme.")}</div></div>
          <select id="setDark"><option value="true" ${s.dark_mode!==false?"selected":""}>On</option><option value="false" ${s.dark_mode===false?"selected":""}>Off</option></select>
        </div>
        <div class="admin-card">
          <div><div class="admin-card-title">${esc(t.volume)}</div><div class="admin-card-sub">${esc(document.documentElement.lang==="id"?"Volume musik latar saat mulai.":"Background music volume.")}</div></div>
          <div class="admin-range-row"><input id="setVolume" type="range" min="0" max="1" step="0.01" value="${vol}" /><output id="setVolumeOut">${Math.round(vol*100)}%</output></div>
        </div>
      </div>
      <div class="admin-card">
        <div><div class="admin-card-title">${esc(t.musicUrl)}</div><div class="admin-card-sub">${esc(document.documentElement.lang==="id"?"File audio atau URL musik latar.":"Audio file or background music URL.")}</div></div>
        <input id="setMusic" value="${esc(s.music_url||"assets/surat-cinta-untuk-starla.mp3")}" />
      </div>
      <div class="admin-card">
        <div><div class="admin-card-title">${esc(t.firstMet)}</div><div class="admin-card-sub">${esc(document.documentElement.lang==="id"?"Tanggal dan waktu yang dipakai oleh penghitung.":"Date and time used by the counter.")}</div></div>
        <input id="setFirstMet" type="datetime-local" value="${s.first_met ? new Date(s.first_met).toISOString().slice(0,16) : "2026-08-20T19:18"}" />
      </div>
      <div class="admin-actions"><button class="btn primary" type="submit">${esc(t.save)}</button></div>
    </form>`;
  $("#setVolume").addEventListener("input",()=>$("#setVolumeOut").textContent=Math.round(Number($("#setVolume").value)*100)+"%");
  $("#settingsForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const payload={site_title:$("#setSiteTitle").value.trim(), default_language:$("#setLang").value, dark_mode:$("#setDark").value==="true", music_url:$("#setMusic").value.trim(), music_volume:Number($("#setVolume").value), first_met:new Date($("#setFirstMet").value).toISOString(), updated_at:new Date().toISOString()};
    const {data:rows}=await db.from("settings").select("id").order("id",{ascending:true}).limit(1);
    let error; if(rows?.[0]?.id) ({error}=await db.from("settings").update(payload).eq("id",rows[0].id)); else ({error}=await db.from("settings").insert(payload));
    if(error){ console.error(error); notify(error.message); return; }
    localStorage.setItem("archiveLang", payload.default_language); localStorage.removeItem("archiveTheme"); setLanguage(payload.default_language); applyTheme(payload.dark_mode?"dark":"light",false);
    if(bgMusic){ bgMusic.src=payload.music_url; bgMusic.volume=payload.music_volume; }
    firstMet=new Date(payload.first_met); updateFirstMetClock(); notify(t.saved); renderAdminShell("settings");
  });
}

async function renderAdminPhotos(){
  const t=al(), box=$("#adminContent"); if(!box)return;
  const {data,error}=await db.from("photos").select("*").order("id",{ascending:true});
  if(error){ box.innerHTML=`<p class="admin-help">${esc(error.message)}</p>`; return; }
  box.innerHTML=`<form class="admin-form" id="photoForm">
    <input id="photoId" type="hidden" />
    <div class="admin-preview-wrap" id="photoPreviewWrap"><div class="admin-preview-empty" id="photoPreviewEmpty">${esc(document.documentElement.lang==="id"?"Pratinjau foto akan muncul di sini.":"Photo preview will appear here.")}</div></div>
    <label>${esc(t.file)}<input id="photoFile" type="file" accept="image/*" /></label>
    <div class="admin-row"><label>${esc(t.photoTitle)}<input id="photoTitle" required /></label><label>${esc(t.category)}<select id="photoCategory"><option>pretty</option><option>cute</option><option>random</option><option>outfit</option></select></label></div>
    <label>${esc(t.photoCaption)}<input id="photoCaption" /></label>
    <div class="admin-checkgrid">
      <label class="admin-checkcard"><span><span class="admin-checktitle">${esc(t.favorite)}</span><span class="admin-checkdesc">${esc(document.documentElement.lang==="id"?"Masukkan ke daftar favorit.":"Show this photo in favorites.")}</span></span><input id="photoFav" type="checkbox" /><span class="admin-checkmark">✓</span></label>
      <label class="admin-checkcard"><span><span class="admin-checktitle">${esc(t.hero)}</span><span class="admin-checkdesc">${esc(document.documentElement.lang==="id"?"Gunakan sebagai foto hero.":"Use this photo as the hero image.")}</span></span><input id="photoHero" type="checkbox" /><span class="admin-checkmark">✓</span></label>
    </div>
    <div class="admin-actions"><button class="btn primary" type="submit">${esc(t.save)}</button><button class="btn secondary" type="button" id="photoReset">${esc(t.cancel)}</button></div>
  </form>
  <div class="admin-list">${(data||[]).map(row=>`<div class="admin-item admin-list-photo"><img src="${esc(row.image_url||"")}" alt=""><div class="admin-item-main"><b>${esc(row.title)}</b><small>${esc(row.category||"")} · ${row.is_favorite?"★":""}</small></div><div class="admin-item-actions"><button class="admin-mini" data-photo-edit="${row.id}">${esc(t.edit)}</button><button class="admin-mini danger" data-photo-delete="${row.id}">${esc(t.delete)}</button></div></div>`).join("")}</div>`;
  const showPreview=(src)=>{ const wrap=$("#photoPreviewWrap"); wrap.innerHTML=src?`<img class="admin-photo-preview" src="${src}" alt="${esc(document.documentElement.lang==="id"?"Pratinjau foto":"Photo preview")}">`:`<div class="admin-preview-empty">${esc(document.documentElement.lang==="id"?"Pratinjau foto akan muncul di sini.":"Photo preview will appear here.")}</div>`; };
  $("#photoFile").addEventListener("change",()=>{const f=$("#photoFile").files[0]; if(!f)return; const r=new FileReader(); r.onload=e=>showPreview(e.target.result); r.readAsDataURL(f);});
  const reset=()=>{ $("#photoId").value=""; $("#photoFile").value=""; $("#photoTitle").value=""; $("#photoCaption").value=""; $("#photoCategory").value="random"; $("#photoFav").checked=false; $("#photoHero").checked=false; showPreview(null); };
  $("#photoReset").addEventListener("click",reset);
  $$('[data-photo-edit]').forEach(btn=>btn.addEventListener("click",()=>{ const r=data.find(x=>String(x.id)===btn.dataset.photoEdit); if(!r)return; $("#photoId").value=r.id; $("#photoTitle").value=r.title||""; $("#photoCaption").value=r.caption||""; $("#photoCategory").value=r.category||"random"; $("#photoFav").checked=!!r.is_favorite; $("#photoHero").checked=!!r.is_hero; showPreview(r.image_url||null); $("#adminContent").scrollIntoView({behavior:"smooth",block:"start"}); }));
  $$('[data-photo-delete]').forEach(btn=>btn.addEventListener("click",async()=>{ const r=data.find(x=>String(x.id)===btn.dataset.photoDelete); if(!r)return; if(!confirm(document.documentElement.lang==="id"?"Hapus foto ini?":"Delete this photo?")) return; const path=(r.image_url||"").split("/photos/")[1]; const storagePath=path?.split("?")[0]; if(storagePath) await db.storage.from("photos").remove([storagePath]); const {error}=await db.from("photos").delete().eq("id",r.id); if(error){notify(error.message);return;} notify(t.deleted); await loadPhotosFromSupabase(); renderAdminShell("photos"); }));
  $("#photoForm").addEventListener("submit",async e=>{ e.preventDefault(); const id=$("#photoId").value; const file=$("#photoFile").files[0]; const payload={title:$("#photoTitle").value.trim(),caption:$("#photoCaption").value.trim(),category:$("#photoCategory").value,is_favorite:$("#photoFav").checked,is_hero:$("#photoHero").checked}; let image_url=null;
    if(file){ const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-"); const path=`${Date.now()}-${safe}`; const up=await db.storage.from("photos").upload(path,file,{upsert:false}); if(up.error){notify(up.error.message);return;} image_url=db.storage.from("photos").getPublicUrl(path).data.publicUrl; }
    let err; if(id){ if(image_url) payload.image_url=image_url; ({error:err}=await db.from("photos").update(payload).eq("id",id)); } else { if(!image_url){notify(t.file);return;} payload.image_url=image_url; ({error:err}=await db.from("photos").insert(payload)); }
    if(err){notify(err.message);return;} notify(t.saved); await loadPhotosFromSupabase(); renderAdminShell("photos");
  });
}

async function renderAdminNotes(){
  const t=al(), box=$("#adminContent"); if(!box)return;
  const {data,error}=await db.from("notes").select("*").order("created_at",{ascending:false}); if(error){box.innerHTML=`<p class="admin-help">${esc(error.message)}</p>`;return;}
  box.innerHTML=`<form class="admin-form" id="noteForm"><input id="noteId" type="hidden"/><div class="admin-card"><label>${esc(t.noteTitle)}<input id="noteTitle" required/></label><label>${esc(t.noteBody)}<textarea id="noteBody" required></textarea></label><label class="admin-checkcard"><span><span class="admin-checktitle">${esc(t.visible)}</span><span class="admin-checkdesc">${esc(document.documentElement.lang==="id"?"Tampilkan catatan di website.":"Show this note on the website.")}</span></span><input id="noteVisible" type="checkbox" checked/><span class="admin-checkmark">✓</span></label></div><div class="admin-actions"><button class="btn primary" type="submit">${esc(t.save)}</button><button class="btn secondary" type="button" id="noteReset">${esc(t.cancel)}</button></div></form><div class="admin-list">${(data||[]).map(row=>`<div class="admin-item"><div class="admin-item-main"><b>${esc(row.title)}</b><small>${esc(row.body).slice(0,110)}</small></div><div class="admin-item-actions"><button class="admin-mini" data-note-edit="${row.id}">${esc(t.edit)}</button><button class="admin-mini danger" data-note-delete="${row.id}">${esc(t.delete)}</button></div></div>`).join("")}</div>`;
  const reset=()=>{$("#noteId").value="";$ ("#noteTitle")};
  const clear=()=>{ $("#noteId").value=""; $("#noteTitle").value=""; $("#noteBody").value=""; $("#noteVisible").checked=true; };
  $("#noteReset").addEventListener("click",clear);
  $$('[data-note-edit]').forEach(btn=>btn.addEventListener("click",()=>{const r=data.find(x=>String(x.id)===btn.dataset.noteEdit);if(!r)return;$("#noteId").value=r.id;$("#noteTitle").value=r.title;$("#noteBody").value=r.body;$("#noteVisible").checked=!!r.is_visible;$("#adminContent").scrollIntoView({behavior:"smooth",block:"start"});}));
  $$('[data-note-delete]').forEach(btn=>btn.addEventListener("click",async()=>{if(!confirm(document.documentElement.lang==="id"?"Hapus catatan ini?":"Delete this note?"))return;const {error}=await db.from("notes").delete().eq("id",btn.dataset.noteDelete);if(error){notify(error.message);return;}notify(t.deleted);await loadNotesFromSupabase();renderAdminShell("notes");}));
  $("#noteForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("#noteId").value;const payload={title:$("#noteTitle").value.trim(),body:$("#noteBody").value.trim(),is_visible:$("#noteVisible").checked};let error;if(id)({error}=await db.from("notes").update(payload).eq("id",id));else({error}=await db.from("notes").insert(payload));if(error){notify(error.message);return;}notify(t.saved);await loadNotesFromSupabase();renderAdminShell("notes");});
}

async function renderAdminFavorites(){
  const t=al(), box=$("#adminContent"); if(!box)return;
  const {data,error}=await db.from("favorites").select("*").order("sort_order",{ascending:true}); if(error){box.innerHTML=`<p class="admin-help">${esc(error.message)}</p>`;return;}
  box.innerHTML=`<form class="admin-form" id="favoriteForm"><input id="favId" type="hidden"/><div class="admin-card"><label>${esc(t.favoriteTitle)}<input id="favTitle" required/></label><label>${esc(t.favoriteDesc)}<textarea id="favDesc"></textarea></label><div class="admin-row"><label>${esc(t.rating)}<input id="favRating" type="number" min="0" max="5" value="5"/></label><label>${esc(t.order)}<input id="favOrder" type="number" value="0"/></label></div></div><div class="admin-actions"><button class="btn primary" type="submit">${esc(t.save)}</button><button class="btn secondary" type="button" id="favReset">${esc(t.cancel)}</button></div></form><div class="admin-list">${(data||[]).map(row=>`<div class="admin-item"><div class="admin-item-main"><b>${esc(row.title)}</b><small>${Number(row.rating)||0} ★ · #${Number(row.sort_order)||0}</small></div><div class="admin-item-actions"><button class="admin-mini" data-fav-edit="${row.id}">${esc(t.edit)}</button><button class="admin-mini danger" data-fav-delete="${row.id}">${esc(t.delete)}</button></div></div>`).join("")}</div>`;
  const reset=()=>{$("#favId").value="";$("#favTitle").value="";$("#favDesc").value="";$("#favRating").value=5;$("#favOrder").value=0;}; $("#favReset").addEventListener("click",reset);
  $$('[data-fav-edit]').forEach(btn=>btn.addEventListener("click",()=>{const r=data.find(x=>String(x.id)===btn.dataset.favEdit);if(!r)return;$("#favId").value=r.id;$("#favTitle").value=r.title;$("#favDesc").value=r.description||"";$("#favRating").value=r.rating||5;$("#favOrder").value=r.sort_order||0;$("#adminContent").scrollIntoView({behavior:"smooth",block:"start"});}));
  $$('[data-fav-delete]').forEach(btn=>btn.addEventListener("click",async()=>{if(!confirm(document.documentElement.lang==="id"?"Hapus favorit ini?":"Delete this favorite?"))return;const {error}=await db.from("favorites").delete().eq("id",btn.dataset.favDelete);if(error){notify(error.message);return;}notify(t.deleted);await loadFavoritesFromSupabase();renderAdminShell("favorites");}));
  $("#favoriteForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("#favId").value;const payload={title:$("#favTitle").value.trim(),description:$("#favDesc").value.trim(),rating:Math.max(0,Math.min(5,Number($("#favRating").value)||0)),sort_order:Number($("#favOrder").value)||0};let error;if(id)({error}=await db.from("favorites").update(payload).eq("id",id));else({error}=await db.from("favorites").insert(payload));if(error){notify(error.message);return;}notify(t.saved);await loadFavoritesFromSupabase();renderAdminShell("favorites");});
}

adminBtn?.addEventListener("click",()=>openAdminPanel("settings"));
adminMenuBtn?.addEventListener("click",e=>{e.preventDefault();$("#mobileMenu")?.classList.remove("show");openAdminPanel("settings");});
db.auth.onAuthStateChange(()=>{});
