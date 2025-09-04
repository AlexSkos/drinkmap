// src/data/fetchFountainsFromOSM.ts
export type OSMPoi = {
    id: number;
    type: "node" | "way" | "relation";
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  };
  
  export type FountainData = {
    id: string;
    lat: number;
    lng: number;
    title: string;
    note?: string;
    imageKey?: string | null; // у OSM фото нет — пусть будет null
  };
  
  // Overpass запрос (València/Valencia, admin_level=8)
  const OVERPASS_Q = `
  [out:json][timeout:60];
  area[boundary=administrative]["name"~"^Val(è|e)ncia$|^Valencia$"]["admin_level"="8"]->.a;
  (
    node["amenity"="drinking_water"](area.a);
    way["amenity"="drinking_water"](area.a);
    relation["amenity"="drinking_water"](area.a);
  );
  out center tags;`;
  
  const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
  
  export async function fetchValenciaFountainsFromOSM(): Promise<FountainData[]> {
    const body = new URLSearchParams({ data: OVERPASS_Q }).toString();
  
    const resp = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body,
    });
  
    if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
    const json = await resp.json();
  
    const elements: OSMPoi[] = json?.elements ?? [];
    const out: FountainData[] = [];
  
    for (const el of elements) {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (typeof lat !== "number" || typeof lon !== "number") continue;
  
      const t = el.tags || {};
      // Заголовок по тэгам, иначе — тех.имя
      const title =
        t.name ||
        t["ref"] ||
        (t["water_source"] ? `Drinking water (${t["water_source"]})` : "Drinking fountain");
  
      // Небольшая примечалка из тегов
      const bits: string[] = [];
      if (t.access) bits.push(`access: ${t.access}`);
      if (t.seasonal) bits.push(`seasonal: ${t.seasonal}`);
      if (t.bottle) bits.push(`bottle: ${t.bottle}`);
      if (t["drinking_water"]) bits.push(`drinking_water: ${t["drinking_water"]}`);
      const note = bits.join(" • ");
  
      out.push({
        id: `${el.type}/${el.id}`,
        lat,
        lng: lon,
        title,
        note,
        imageKey: null,
      });
    }
  
    return out;
  }
  