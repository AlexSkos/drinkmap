// src/screens/MapScreen.tsx
import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

import fountainsData from "../data/fountains_with_photos.json";
import { getRating, setRatingOnce } from "../storage/ratings";
import { useLang } from "../i18n/LanguageContext";

type RootStackParamList = { Menu: undefined; Map: undefined };
type Props = NativeStackScreenProps<RootStackParamList, "Map">;

type Fountain = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note?: string;
  imageKey?: string | null;
  ext?: string | null;
};

const ALL_FOUNTAINS: Fountain[] = (fountainsData as any[])
  .map((f: any, idx: number) => {
    const lon = f?.geometry?.coordinates?.[0];
    const lat = f?.geometry?.coordinates?.[1];
    return {
      id: String(f?.properties?.["@id"] || f?.id || `F${idx + 1}`),
      lat: Number(lat),
      lng: Number(lon),
      title: f?.properties?.description || "Drinking fountain",
      note: f?.properties?.operator || "",
      imageKey: null,
      ext: f?.properties?.imageUrl || null,
    };
  })
  .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

const MAP_FILTER: "none" | "bw" | "blue" = "blue";
const RADIUS_KM = 1;
const ALL_LIMIT = 1500;

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function getFallbackBase64(): Promise<string | null> {
  try {
    const asset = Asset.fromModule(require("../../assets/fountain_defolt.jpg"));
    await asset.downloadAsync(); // no-op в релизе, но безопасно
    const uri = asset.localUri || asset.uri;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpg;base64,${base64}`;
  } catch (e) {
    return null;
  }
}

// прозрачный 1×1 PNG как мгновенный фолбэк (пока грузим твой jpg)
const TRANSPARENT_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AApsB4oY8p0sAAAAASUVORK5CYII=";

export default function MapScreen({ navigation }: Props) {
  const webRef = React.useRef<WebView>(null);
  const { t } = useLang();

  const [userPos, setUserPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [loadingLoc, setLoadingLoc] = React.useState(true);
  const fallbackRef = React.useRef<string>(TRANSPARENT_DATA_URL); // держим актуальный фолбэк тут

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setUserPos({ lat: 39.4699, lng: -0.3763 });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        setUserPos({ lat: 39.4699, lng: -0.3763 });
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  // грузим base64 фолбэк в фоне и заинжектим его в WebView
  React.useEffect(() => {
    (async () => {
      const b64 = await getFallbackBase64();
      if (!b64) return;
      fallbackRef.current = b64;
      // прокидываем внутрь уже отрисованной страницы
      webRef.current?.injectJavaScript(`
        (function(){
          window.__FALLBACK = ${JSON.stringify(b64)};
        })();
        true;
      `);
    })();
  }, []);

  const nearby: Fountain[] = React.useMemo(() => {
    if (!userPos) return [];
    const latTol = RADIUS_KM / 111;
    const lngTol = latTol / Math.max(Math.cos((userPos.lat * Math.PI) / 180), 0.2);
    const bboxPref = ALL_FOUNTAINS.filter(
      f =>
        Math.abs(f.lat - userPos.lat) <= latTol &&
        Math.abs(f.lng - userPos.lng) <= lngTol
    );
    return bboxPref
      .map(f => ({ f, d: haversineKm(userPos.lat, userPos.lng, f.lat, f.lng) }))
      .filter(x => x.d <= RADIUS_KM)
      .sort((a, b) => a.d - b.d)
      .map(x => x.f);
  }, [userPos]);

  const html = React.useMemo(() => {
    const center = userPos ?? { lat: 39.4699, lng: -0.3763 };

    const dataNearby = JSON.stringify(
      nearby.map(f => ({
        id: f.id, lat: f.lat, lng: f.lng,
        title: f.title, note: f.note ?? "",
        imageKey: f.imageKey ?? null, ext: f.ext ?? null,
      }))
    );

    const dataAll = JSON.stringify(
      ALL_FOUNTAINS.slice(0, ALL_LIMIT).map(f => ({
        id: f.id, lat: f.lat, lng: f.lng,
        title: f.title, note: f.note ?? "",
        imageKey: f.imageKey ?? null, ext: f.ext ?? null,
      }))
    );

    const MENU_TXT = t("menu");
    const ALL_TXT  = t("all");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{height:100%;margin:0}
  .leaflet-control-attribution{font-size:10px}
  .leaflet-tile-pane.filter-bw{filter:grayscale(1) contrast(1.05)}
  .leaflet-tile-pane.filter-blue{filter:grayscale(1) sepia(.15) hue-rotate(190deg) saturate(2)}

  .card{width:260px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .photo{width:100%;height:150px;border-radius:14px;object-fit:cover;display:block;background:#eee}
  .title{font-weight:800;margin:10px 0 6px;font-size:15px}
  .note{color:#333;font-size:13px;margin-top:2px}
  .stars{display:flex;gap:6px;margin:8px 0 2px}
  .star{font-size:20px;line-height:1;cursor:pointer}
  .star.gray{color:#b7bcc6}
  .star.gold{color:#22c55e}

  .pin{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.2);color:#fff;font-size:16px;line-height:28px;user-select:none;pointer-events:auto;border:2px solid rgba(0,0,0,.15)}
  .pin-blue { background:#0ea5e9; }
  .pin-red  { background:#ef4444; }
  .pin-gold { background:#22c55e; color:#08230f; }

  .locate-btn{width:34px;height:34px;border:1px solid #bbb;border-radius:6px;background:#fff;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.2);font-weight:700}

  .bottom-bar{
    position: fixed; left: 50%; transform: translateX(-50%);
    bottom: 0px; z-index: 99999;
    width: min(700px, calc(100% - 20px));
    background:#6c97b0; border-radius:16px; box-shadow:0 -4px 12px rgba(0,0,0,.12);
    display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; align-items:center;
    padding:12px; padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
  }
  .bbtn{
    width:100%; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:12px;
    padding:12px 14px; font-weight:700; font-size:14px; color:#111827; text-align:center; cursor:pointer;
  }
  .bbtn:active{ transform: translateY(1px); }
  .bbtn.toggle.active{ background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
  .bbtn.fav.active{ background:#22c55e; color:#fff; border-color:#22c55e; }
</style>
</head>
<body>
<div id="map"></div>
<div class="bottom-bar" id="bar">
  <button class="bbtn" id="btnMenu">${MENU_TXT}</button>
  <button class="bbtn toggle" id="btnAll">${ALL_TXT}</button>
  <button class="bbtn fav" id="btnFav">⭐</button>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const NEARBY_POINTS = ${dataNearby};
  const ALL_POINTS    = ${dataAll};
  const center = [${center.lat}, ${center.lng}];

  // моментальный фолбэк (прозрачный), может быть заменён из RN: window.__FALLBACK
  window.__FALLBACK = window.__FALLBACK || ${JSON.stringify(TRANSPARENT_DATA_URL)};

  const map = L.map('map', { zoomControl:false }).setView(center, 15);

  function ensureBar(){ const bar = document.getElementById('bar'); if (bar){ bar.style.display='grid'; bar.style.zIndex='99999'; } }
  ensureBar(); map.whenReady(ensureBar); setTimeout(ensureBar,0); setTimeout(ensureBar,300);

  const zoom = L.control.zoom({ position:'topright' }).addTo(map);
  const zc = zoom.getContainer(); zc.style.marginTop='50px'; zc.style.marginRight='8px'; zc.style.zIndex = 1000;

  const MyLocate = L.Control.extend({
    onAdd(){
      const btn = L.DomUtil.create('button','locate-btn');
      btn.textContent='●'; btn.title='Center on me';
      btn.onclick=()=>map.setView(center, 15);
      return btn;
    }
  });
  (new MyLocate({position:'topright'})).addTo(map);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

  const applyFilter = mode => {
    const pane = document.querySelector('.leaflet-tile-pane');
    if(!pane) return;
    pane.classList.remove('filter-bw','filter-blue');
    if (mode==='bw') pane.classList.add('filter-bw');
    if (mode==='blue') pane.classList.add('filter-blue');
  };
  applyFilter(${JSON.stringify(MAP_FILTER)});
  map.whenReady(()=>applyFilter(${JSON.stringify(MAP_FILTER)}));
  map.on('layeradd',()=>applyFilter(${JSON.stringify(MAP_FILTER)}));

  L.circleMarker(center,{radius:7,weight:2,color:'#0ea5e9',fillColor:'#0ea5e9',fillOpacity:.3})
    .addTo(map).bindPopup('You are here');

  const makeIcon = (c)=> L.divIcon({ className:'pin pin-'+c, html:'💧', iconSize:[28,28], iconAnchor:[14,14] });
  const ICONS = { blue:makeIcon('blue'), red:makeIcon('red'), gold:makeIcon('gold') };
  let markersById = Object.create(null);

  const ratingMap = Object.create(null);

  function starsRow(id,v){ v=Math.max(0,Math.min(5,v|0)); const lock=v>0;
    let h='<div class="stars'+(lock?' locked':'')+'" data-id="'+id+'">';
    for(let i=1;i<=5;i++) h += '<span class="'+(i<=v?'star gold':'star gray')+'" data-v="'+i+'">★</span>';
    return h+'</div>';
  }
  function updateStarsInDom(id,v){
    const row=document.querySelector('.stars[data-id="'+id+'"]'); if(!row) return;
    row.classList.toggle('locked', v>0);
    [...row.querySelectorAll('.star')].forEach((el,idx)=>{
      el.classList.toggle('gold', idx+1<=v);
      el.classList.toggle('gray', idx+1>v);
    });
  }
  function setMarkerColorByRating(id,v){
    const m=markersById[id]; if(!m) return;
    if (v>=4) m.setIcon(ICONS.gold); else if (v>=1) m.setIcon(ICONS.red); else m.setIcon(ICONS.blue);
  }
  window.applyRating=(id,v)=>{
    ratingMap[id]=v||0;
    updateStarsInDom(id,v||0);
    setMarkerColorByRating(id,v||0);
  };

  function clearMarkers(){
    Object.values(markersById).forEach((m)=> map.removeLayer(m));
    markersById = Object.create(null);
  }

  function imgTagFor(p){
    const src = (p.ext && p.ext.length>0) ? p.ext : window.__FALLBACK;
    // корректный onerror c одинарными кавычками внутри
    return '<img class="photo" src=\"'+src+'\" alt=\"fountain\" '+
           'onerror=\"this.onerror=null; this.src=\\''+window.__FALLBACK+'\\';\" />';
  }

  function render(points){
    clearMarkers();
    points.forEach(p=>{
      const m=L.marker([p.lat,p.lng], {icon:ICONS.blue, riseOnHover:true, title:p.title}).addTo(map);
      markersById[p.id]=m;

      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'getRating', id:p.id}));

      const html =
        '<div class="card" data-id="'+p.id+'">'+
          imgTagFor(p)+
          '<div class="title">'+(p.title||'Fountain')+'</div>'+
          (p.note ? '<div class="note">'+p.note+'</div>' : '')+
          starsRow(p.id, ratingMap[p.id]||0)+
        '</div>';
      m.bindPopup(html,{maxWidth:320,autoPan:true,closeButton:true});

      m.on('popupopen', ()=>{
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'getRating', id:p.id}));
        const row=document.querySelector('.card[data-id="'+p.id+'"] .stars');
        if(!row) return;
        row.addEventListener('click', (e)=>{
          if (row.classList.contains('locked')) return;
          const el=e.target; if(!el || !el.getAttribute) return;
          const v=parseInt(el.getAttribute('data-v')||'0',10); if(!v) return;
          ratingMap[p.id]=v;
          updateStarsInDom(p.id,v); setMarkerColorByRating(p.id,v);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'setRatingOnce', id:p.id, value:v}));
        });
      });
    });
  }

  let showAll=false;
  let favOnly=false;
  render(NEARBY_POINTS);

  const btnMenu=document.getElementById('btnMenu');
  const btnAll =document.getElementById('btnAll');
  const btnFav =document.getElementById('btnFav');

  btnMenu.onclick=()=>{ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type:'goMenu' })); };

  function applyDataset(){
    const base = showAll ? ALL_POINTS : NEARBY_POINTS;
    const filtered = favOnly ? base.filter(p => (ratingMap[p.id]||0) > 0) : base;
    render(filtered);
  }

  btnAll.onclick=()=>{ showAll=!showAll; btnAll.classList.toggle('active', showAll); applyDataset(); };
  btnFav.onclick=()=>{ favOnly=!favOnly; btnFav.classList.toggle('active', favOnly); applyDataset(); };
</script>
</body>
</html>`;
    // eslint-disable-next-line
  }, [nearby, userPos, t]);

  const onMessage = async (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "getRating" && msg.id) {
        const value = await getRating(msg.id);
        webRef.current?.injectJavaScript(
          `window.applyRating(${JSON.stringify(msg.id)}, ${JSON.stringify(value)}); true;`
        );
      }
      if (msg.type === "setRatingOnce" && msg.id && typeof msg.value === "number") {
        const value = await setRatingOnce(msg.id, msg.value);
        webRef.current?.injectJavaScript(
          `window.applyRating(${JSON.stringify(msg.id)}, ${JSON.stringify(value)}); true;`
        );
      }
      if (msg.type === "goMenu") {
        navigation.replace("Menu");
      }
    } catch {}
  };

  if (loadingLoc || !userPos) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#6b7280" }}>{t("getting_location")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
        />
      </View>
      {/* подпорка снизу (оставляем как у тебя) */}
      <View style={styles.footerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  footerSpacer: { height: 50, backgroundColor: "#6b97b0" },
});
