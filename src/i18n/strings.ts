// src/i18n/strings.ts
export type Lang = "en" | "es";

export const STR = {
  en: {
    // --- Main menu / navigation ---
    map: "Map of fountains",
    report: "Report an error",
    guide: "Valencia fountains guide",
    contact: "Contact us",
    support: "Support project",
    favorites: "Favorites",
    menu: "Menu",
    all: "All",
    back_to_menu: "Back to menu",

    // --- Report screen ---
    reportTitle: "Report an error",
    send_message: "Send message",
    issue_placeholder: "Describe the issue…",
    send: "Send",
    thanks: "Thanks!",
    message_queued_stub: "Your message has been queued (stub).",

    // --- Splash / misc ---
    appVersionPrefix: "v",
    coordinates: "Coordinates",

    // --- mapmenu  ---
    map_menu: "Menu",
    map_all: "All",
    getting_location: "Getting location…",

// History
    historyText: `History of Drinking Fountains in Valencia

1. Water supply and the first structures

In the mid-19th century, during the modernization of the water distribution system, Valencia built its first potable water reservoir, designed by engineer Calixto Santa Cruz and completed in 1850. The building in Mislata became a key element of the city's water infrastructure. Soon after, the first public fountains received water through pipes, and the ceremony of water flowing at Plaza del Negrito became one of the earliest public water supply events in Spain.

2. Art reliefs and symbolism

Many fountains in the city show complex symbolism: intertwined fish and snakes. The fish represents water, life, and the unconscious, while the snake often symbolizes energy, rebirth, and knowledge. This artistic language may have roots in pre-Islamic traditions or the broader cultural heritage of the region.

3. The “Pink Panther” Fountain

A more recent symbol is the Fuente Pública, popularly known as the “Pink Panther”. Designed by architect Miquel Navarro in 1984, the 22-meter-tall fountain commemorates the Turia-Júcar canal, which provided Valencia with drinking water. Its striking appearance quickly made it a city landmark.

4. The Turia Fountain on Plaza de la Virgen

On Plaza de la Virgen, the historical heart of Valencia, stands the Turia Fountain, designed in the 1970s by sculptor Manuel Silvestre Montesinos. It depicts a majestic Neptune-like figure (symbolizing the Turia River), surrounded by representations of irrigation canals that have sustained Valencia for centuries.

5. Modern drinking fountains

Today, Valencia has installed around 50 modern filtered drinking fountains across the city, where anyone can freely refill bottles. This initiative promotes both sustainability and accessibility.`,
  },

  es: {
    // --- Menú / navegación ---
    map: "Mapa de fuentes",
    report: "Informar de un error",
    guide: "Guía de fuentes de Valencia",
    contact: "Contáctanos",
    support: "Apoyar el proyecto",
    favorites: "Favoritos",
    menu: "Menú",
    all: "Todos",
    back_to_menu: "Volver al menú",

    // --- Pantalla de reporte ---
    reportTitle: "Informar de un error",
    send_message: "Enviar mensaje",
    issue_placeholder: "Describe el problema…",
    send: "Enviar",
    thanks: "¡Gracias!",
    message_queued_stub: "Tu mensaje ha sido puesto en cola (demo).",

    // --- Splash / varios ---
    appVersionPrefix: "v",
    coordinates: "Coordenadas",

    // --- mapmenu  ---
    map_menu: "Menú",
    map_all: "Todos",
    getting_location: "Obteniendo ubicación…",

    // History
    historyText: `Historia de las Fuentes de Agua Potable en Valencia
    
1. El suministro de agua y las primeras instalaciones

A mediados del siglo XIX, durante la modernización de la red de distribución, Valencia construyó su primer depósito de agua potable, diseñado por el ingeniero Calixto Santa Cruz y terminado en 1850. El edificio en Mislata se convirtió en un elemento clave de la infraestructura hídrica de la ciudad. Poco después, los primeros fuentes públicas comenzaron a recibir agua a través de tuberías, y la ceremonia de la llegada del agua en la Plaza del Negrito fue uno de los primeros hitos del abastecimiento público en España.

2. Relieves artísticos y simbolismo

Muchos de los fuentes presentan símbolos complejos: peces y serpientes entrelazados. El pez representa el agua, la vida y el inconsciente; la serpiente, en cambio, simboliza energía, renacimiento y conocimiento. Este lenguaje artístico puede tener raíces en tradiciones preislámicas o en el rico patrimonio cultural de la región.

3. La Fuente “Pantera Rosa”

Un símbolo más reciente es la Fuente Pública, conocida popularmente como la “Pantera Rosa”. Creada en 1984 por el arquitecto Miquel Navarro, con unos 22 metros de altura, conmemora el canal Turia-Júcar, que garantizó agua potable a la ciudad. Su aspecto llamativo la convirtió rápidamente en un referente urbano.

4. La Fuente del Turia en la Plaza de la Virgen

En la Plaza de la Virgen, el corazón histórico de Valencia, se encuentra la Fuente del Turia, diseñada en los años 70 por el escultor Manuel Silvestre Montesinos. Representa a una figura majestuosa de estilo Neptuno (el río Turia), rodeada por canales de riego que nutren los campos valencianos desde hace siglos.

5. Fuentes modernas

Hoy en día, Valencia cuenta con unas 50 fuentes potables modernas con filtrado, donde cualquiera puede rellenar su botella de forma gratuita. Una medida que fomenta la sostenibilidad y el acceso universal al agua.
    `,

  },
} as const;

