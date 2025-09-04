// src/data/fountains.ts
export type FountainData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note?: string;
  imageKey?: string; // ключ к локальной картинке (см. assetsMap)
};

export const FOUNTAINS: FountainData[] = [
  {
    id: "F1",
    lat: 39.47235,
    lng: -0.3769,
    title: "Plaza del Ayuntamiento",
    note: "Питьевой фонтан у площади",
    imageKey: "f1",
  },
  {
    id: "F2",
    lat: 39.4686,
    lng: -0.3748,
    title: "Jardín del Turia",
    note: "Фонтан у дорожки",
    imageKey: "f2",
  },
  {
    id: "F3",
    lat: 39.477988618177335,
    lng: -0.3275202162957573,
    title: "Plaça del Llibertador Simón Bolívar, 7",
    note: "Poblats Marítims, València",
    imageKey: "bolivar",
  },
];
