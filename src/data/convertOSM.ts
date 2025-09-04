// src/data/convertOSM.ts
export type FountainLite = {
    id: string;
    lat: number;
    lng: number;
    title: string;
    note?: string;
    imageKey?: string | null;
  };
  
  type Feature = {
    type: "Feature";
    id?: string;
    properties?: Record<string, any>;
    geometry: {
      type: "Point" | string;
      coordinates: [number, number] | number[];
    };
  };
  
  type FeatureCollection = {
    type: "FeatureCollection";
    features: Feature[];
  };
  
  export function convertOSMGeoJSON(geo: FeatureCollection): FountainLite[] {
    const out: FountainLite[] = [];
    for (const f of geo.features || []) {
      if (!f?.geometry || f.geometry.type !== "Point") continue;
      const coords = f.geometry.coordinates as [number, number];
      const lon = Number(coords?.[0]);
      const lat = Number(coords?.[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  
      const p = f.properties || {};
      // Заголовок по тегам (английские подписи)
      const title =
        p.name ||
        p.description ||
        (p.ref ? `Drinking fountain #${p.ref}` : "Drinking fountain");
  
      const bits: string[] = [];
      if (p.operator) bits.push(p.operator);
      if (p.access) bits.push(`access: ${p.access}`);
      if (p.seasonal) bits.push(`seasonal: ${p.seasonal}`);
      if (p.bottle) bits.push(`bottle: ${p.bottle}`);
  
      out.push({
        id: String(p["@id"] || f.id || `${lat.toFixed(6)},${lon.toFixed(6)}`),
        lat,
        lng: lon,
        title,
        note: bits.join(" • ") || undefined,
        imageKey: null, // у OSM нет фото
      });
    }
    return out;
  }
  
  // Небольшой помощник — склеить с локальными точками и убрать дубли ближе 10 м
  export function mergeFountains(seed: FountainLite[], osm: FountainLite[]): FountainLite[] {
    const out = [...seed];
    const toRad = (v: number) => (v * Math.PI) / 180;
    function isNear(a: FountainLite, b: FountainLite) {
      const R = 6371000;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lng - a.lng);
      const sa = Math.sin(dLat / 2);
      const sb = Math.sin(dLon / 2);
      const A = sa * sa + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sb * sb;
      const d = 2 * R * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
      return d < 10; // 10 м — считаем дубликатом
    }
    osm.forEach((o) => {
      const dup = out.find((s) => isNear(s, o));
      if (!dup) out.push(o);
    });
    return out;
  }
  