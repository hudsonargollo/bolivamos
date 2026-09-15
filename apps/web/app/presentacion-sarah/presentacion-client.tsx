"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lang = "es" | "en";
type SpeakerFilter = "all" | "hudson" | "steff";

interface SpeakerNotes {
  hudson: { es: string; en: string };
  steff: { es: string; en: string };
}

interface SlideData {
  id: number;
  tag: { es: string; en: string };
  tagColor: string;
  title: { es: string; en: string };
  subtitle?: { es: string; en: string };
  badge?: { es: string; en: string };
  speakerNotes: SpeakerNotes;
  content: (lang: Lang) => React.ReactNode;
}

export default function PresentacionClient() {
  const [lang, setLang] = useState<Lang>("es");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [speakerFilter, setSpeakerFilter] = useState<SpeakerFilter>("all");
  const [viewMode, setViewMode] = useState<"slides" | "doc">("slides");
  const [activeAudienceTab, setActiveAudienceTab] = useState<"locales" | "turistas" | "comercios" | "municipio">("locales");

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (viewMode !== "slides") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key.toLowerCase() === "n") {
        setShowNotes((prev) => !prev);
      } else if (e.key.toLowerCase() === "l") {
        setLang((prev) => (prev === "es" ? "en" : "es"));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  const t = {
    es: {
      subheading: "Santa Cruz Smart City",
      meetingWith: "Reunión con Lic. Sarah Mansilla · Asesora de Cultura y Turismo",
      slidesMode: "Diapositivas",
      docMode: "Documento Completo",
      speakerNotesBtn: "Notas Oradores",
      notesTitle: "Notas de Exposición para la Reunión",
      allSpeakers: "Todos",
      hudsonOnly: "Hudson (Tech & Datos)",
      steffOnly: "Steff (Alianzas & Comunidad)",
      prev: "Anterior",
      next: "Siguiente",
      slideWord: "Diapositiva",
      destinataryLabel: "Destinataria de la Sesión",
      destinataryName: "Lic. Sarah Mansilla · Asesora de Cultura y Turismo de Santa Cruz",
      presenters: "Hudson Argollo (Tecnología & Producto) & Steff (Alianzas & Comunidad)",
      pppBadge: "Alianza Público-Privada",
      liveDemoTitle: "Explorar la Plataforma en Vivo",
      liveDemoDesc: "Acceso directo a los módulos clave para demostración inmediata durante la reunión.",
      liveLinks: {
        map: "🗺️ Abrir Mapa 3D",
        events: "📅 Feed de Eventos",
        concierge: "✦ Probar bolivIA",
        bolipass: "🎫 Ver BoliPass",
      },
      tabs: {
        locales: "👥 Para el Ciudadano Local",
        turistas: "✈️ Para el Turista",
        comercios: "🏬 Para Negocios y Creadores",
        municipio: "🏛️ Para la Ciudad y el Municipio",
      },
    },
    en: {
      subheading: "Santa Cruz Smart City",
      meetingWith: "Meeting with Lic. Sarah Mansilla · Advisor for Culture & Tourism",
      slidesMode: "Slides View",
      docMode: "Full Document",
      speakerNotesBtn: "Speaker Notes",
      notesTitle: "Meeting Speaking Notes & Strategy",
      allSpeakers: "All",
      hudsonOnly: "Hudson (Tech & Data)",
      steffOnly: "Steff (Partnerships & PR)",
      prev: "Previous",
      next: "Next",
      slideWord: "Slide",
      destinataryLabel: "Session Guest of Honor",
      destinataryName: "Lic. Sarah Mansilla · Advisor for Culture & Tourism of Santa Cruz",
      presenters: "Hudson Argollo (Tech & Product) & Steff (Partnerships & Community)",
      pppBadge: "Public-Private Partnership",
      liveDemoTitle: "Explore Live Platform",
      liveDemoDesc: "Direct access to core live modules for interactive presentation & testing.",
      liveLinks: {
        map: "🗺️ Open 3D Map",
        events: "📅 Event Feed",
        concierge: "✦ Try bolivIA Concierge",
        bolipass: "🎫 Explore BoliPass",
      },
      tabs: {
        locales: "👥 For Local Citizens",
        turistas: "✈️ For Tourists",
        comercios: "🏬 For Local Businesses",
        municipio: "🏛️ For the City & Municipality",
      },
    },
  };

  const slides: SlideData[] = [
    // Slide 1: Portada
    {
      id: 1,
      tag: {
        es: "Propuesta Estratégica Institucional",
        en: "Institutional Strategic Proposal",
      },
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      title: {
        es: "BoliVibes: La Infraestructura Digital Inteligente para el Turismo y la Cultura de Santa Cruz",
        en: "BoliVibes: The Smart Digital Infrastructure for Tourism & Culture in Santa Cruz",
      },
      subtitle: {
        es: "Conectando en tiempo real a ciudadanos, turistas y comerciantes con el patrimonio cultural, gastronómico y artístico de nuestra ciudad.",
        en: "Connecting citizens, tourists, and merchants in real time with our city's vibrant cultural, gastronomic, and artistic heritage.",
      },
      badge: {
        es: "Smart Tourism · Santa Cruz 2026",
        en: "Smart Tourism · Santa Cruz 2026",
      },
      speakerNotes: {
        hudson: {
          es: "Licenciada Sarah: Santa Cruz produce una cantidad inmensa de cultura y entretenimiento, pero carecía de una infraestructura digital unificada de Smart City. BoliVibes soluciona esto con tecnología ligera en la nube, mapas 3D y analíticas en tiempo real sin costo de software para el municipio.",
          en: "Lic. Sarah: Santa Cruz generates an enormous amount of culture, but lacked a unified Smart City digital infrastructure. BoliVibes provides lightweight edge technology, 3D maps, and real-time analytics with zero software licensing costs for the municipality.",
        },
        steff: {
          es: "Queremos unir a la comunidad. A través de nuestra experiencia en el terreno y eventos multiculturales como Parlana, sabemos que locales, extranjeros y familias cruceñas buscan constantemente qué hacer. BoliVibes es la casa digital donde toda esa oferta se vuelve accesible y atractiva.",
          en: "We are here to connect the community. Through our hands-on field experience and multicultural events like Parlana, we see that locals, expats, and families are constantly asking what to do. BoliVibes is the digital home that makes that entire ecosystem discoverable.",
        },
      },
      content: (l) => (
        <div className="space-y-6 pt-1">
          {/* Logo Clay Hero Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900/90 to-emerald-950/40 border border-amber-500/30 backdrop-blur">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <span>✨</span>
                <span>{l === "es" ? "Transformación Digital Cruceña" : "Cruceño Digital Transformation"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
                {l === "es" ? "Cultura, Turismo y Comercio en un Solo Ecosistema" : "Culture, Tourism & Commerce in One Ecosystem"}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                {l === "es"
                  ? "Una plataforma interactiva que posiciona a Santa Cruz a la par de las grandes capitales turísticas de la región."
                  : "An interactive platform positioning Santa Cruz alongside South America's premier cultural tourism capitals."}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                src="/api/assets/brand/logo-clay.webp"
                alt="BoliVibes Clay Logo"
                className="w-36 sm:w-44 md:w-52 h-auto drop-shadow-[0_12px_24px_rgba(255,196,31,0.25)] hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/imgs/logo-clay.webp";
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-3">
                🏛️
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Cultura Viva" : "Living Culture"}
              </h3>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                {l === "es"
                  ? "Difusión georreferenciada de museos, festivales municipales, centros culturales y arte independiente."
                  : "Geo-referenced promotion of museums, municipal festivals, cultural hubs, and indie performing arts."}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
                🗺️
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Turismo 3D Inteligente" : "Smart 3D Tourism"}
              </h3>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                {l === "es"
                  ? "Navegación interactiva 3D con rutas autoguiadas, Casco Viejo, polos gastronómicos y seguridad para el visitante."
                  : "Interactive 3D navigation featuring self-guided trails, the historic center, culinary corridors, and visitor safety."}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg mb-3">
                🤝
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Impacto Económico" : "Economic Impact"}
              </h3>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                {l === "es"
                  ? "Reactivación del comercio local, formalización digital y fidelización de flujo peatonal mediante BoliPass."
                  : "Revitalizing local merchants, digital empowerment, and foot-traffic retention driven by BoliPass."}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">{t[l].destinataryLabel}</p>
              <p className="text-stone-100 font-semibold text-sm">{t[l].destinataryName}</p>
              <p className="text-stone-400 text-xs mt-0.5">{t[l].presenters}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                {t[l].pppBadge}
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: El Diagnóstico
    {
      id: 2,
      tag: {
        es: "El Diagnóstico Actual",
        en: "Current Diagnosis",
      },
      tagColor: "bg-red-500/20 text-red-300 border-red-500/40",
      title: {
        es: "La Paradoja de la Oferta Cultural Cruceña",
        en: "The Paradox of Santa Cruz's Cultural Vibrancy",
      },
      subtitle: {
        es: "Santa Cruz genera más cultura y gastronomía que nunca, pero la información sigue atrapada en silos y algoritmos.",
        en: "Santa Cruz produces more culture and culinary experiences than ever, yet information remains trapped in silos and social algorithms.",
      },
      badge: {
        es: "Problema & Oportunidad",
        en: "Problem & Opportunity",
      },
      speakerNotes: {
        hudson: {
          es: "Técnicamente, el problema es que el 85% del contenido cultural en redes sociales es penalizado por algoritmos publicitarios. La información no está georreferenciada ni estructurada, haciendo imposible que un sistema inteligente ayude al usuario.",
          en: "Technically, the core problem is that 85% of cultural posts on social feeds are suppressed by ad algorithms. Data is neither geo-tagged nor structured, making it impossible for smart systems to guide the user in real time.",
        },
        steff: {
          es: "Lo vemos en el trato diario con gestores culturales y comercios: los museos tienen salas hermosas que se quedan vacías entre semana, y los turistas terminan siempre en los mismos 3 lugares por miedo a no saber moverse en la ciudad. El Casco Viejo se apaga al anochecer.",
          en: "We see this every day with venue owners and cultural creators: museum halls remain underattended on weekdays, while tourists stay confined to the same 3 spots due to lack of a trusted guide. Downtown goes quiet after dark.",
        },
      },
      content: (l) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-red-500/20 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                01
              </span>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Dispersión y Algoritmos Restrictivos" : "Fragmentation & Restrictive Algorithms"}
              </h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {l === "es"
                ? "La agenda municipal y los eventos independientes compiten contra contenido comercial en redes. El alcance orgánico de las actividades culturales es inferior al 10% de su público potencial."
                : "Municipal schedules and indie cultural events compete with commercial ads on social media. Organic reach for cultural content is below 10% of potential attendees."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                02
              </span>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "El Turista Desorientado" : "The Disoriented Tourist"}
              </h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {l === "es"
                ? "Quien llega a Santa Cruz suele limitarse a su hotel y 2 restaurantes conocidos por falta de un mapa interactivo centralizado que le guíe hacia Manzana 1, El Altillo o ferias típicas."
                : "Visitors often stay confined to their hotel zone and 2 well-known spots due to the lack of a centralized 3D interactive guide showing them historic gems like Manzana 1 and Altillo Beni."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-orange-500/20 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                03
              </span>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Dormición del Casco Viejo" : "Revitalizing the Historic Center"}
              </h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {l === "es"
                ? "El centro histórico necesita un catalizador digital que movilice a las nuevas generaciones, conectando la visita a museos y teatros con el consumo en cafeterías y librerías locales."
                : "The downtown core needs a digital catalyst that brings younger generations back, connecting museum and theater attendance with local coffee shop and bookshop visits."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-blue-500/20 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                04
              </span>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Carencia de Datos en Tiempo Real" : "Lack of Real-Time Urban Data"}
              </h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {l === "es"
                ? "La gestión pública carece de métricas directas y anónimas sobre qué actividades culturales generan mayor interés ciudadano y qué circuitos turísticos funcionan mejor."
                : "Public sector leadership lacks real-time, anonymized insights into which cultural initiatives attract actual demand, peak hours, and which districts require reinforcement."}
            </p>
          </div>
        </div>
      ),
    },

    // Slide 3: La Solución BoliVibes
    {
      id: 3,
      tag: {
        es: "La Solución Integral",
        en: "The Integrated Solution",
      },
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: {
        es: "BoliVibes: El Ecosistema 360° de Descubrimiento Urbano",
        en: "BoliVibes: The 360° Urban Discovery Ecosystem",
      },
      subtitle: {
        es: "Tecnología moderna diseñada para conectar cultura, ocio, gastronomía y comunidad en un solo lugar.",
        en: "Modern technology built to connect culture, leisure, gastronomy, and community in one unified place.",
      },
      badge: {
        es: "Ecosistema Tecnológico",
        en: "Tech Ecosystem",
      },
      speakerNotes: {
        hudson: {
          es: "Desarrollamos una arquitectura modular de última generación: el mapa 3D cruceño procesa edificios en tiempo real sin costos de licencias externas, el feed se sincroniza al instante y bolivIA responde en lenguaje natural contextualizado.",
          en: "We built a cutting-edge modular architecture: the Cruceño 3D map renders buildings dynamically without external licensing fees, the event feed synchronizes instantly, and bolivIA delivers localized contextual answers.",
        },
        steff: {
          es: "La clave no es sólo la tecnología, sino cómo enamora a la gente. Con BoliPass creamos una experiencia donde salir a un museo o a un café de especialidad te otorga sellos, beneficios y te hace sentir parte activa del movimiento cruceño.",
          en: "The key is user love and engagement. With BoliPass, visiting a museum or a specialty coffee shop earns digital stamps and perks, making everyone feel like an active part of Santa Cruz's cultural movement.",
        },
      },
      content: (l) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">
                🗺️
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Mapa 3D Interactivo" : "Interactive 3D Map"}
              </h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                {l === "es"
                  ? "Visualización tridimensional de la ciudad, distritos, museos y zonas gastronómicas con geolocalización precisa."
                  : "3D visualization of Santa Cruz districts, landmark museums, and culinary corridors with exact geolocations."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-emerald-400 font-semibold">
              ✓ OpenStreetMap + Three.js
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-4">
                📅
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "Agenda Viva 24/7" : "24/7 Live Agenda"}
              </h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                {l === "es"
                  ? "Feed dinámico organizado por fechas, categorías (Teatro, Música, Muestras, Ferias, Noche) y distritos."
                  : "Dynamic feed organized by dates, categories (Theater, Music, Art, Fairs, Nightlife), and urban districts."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-amber-400 font-semibold">
              {l === "es" ? "✓ Actualización en tiempo real" : "✓ Real-time updates"}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-orange-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl mb-4">
                ✦
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "bolivIA Concierge" : "bolivIA AI Concierge"}
              </h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                {l === "es"
                  ? "Asistente con IA que crea itinerarios culturales y gastronómicos personalizados según gustos y presupuesto."
                  : "Smart local AI assistant crafting tailored cultural, art, and dining itineraries on demand."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-orange-400 font-semibold">
              {l === "es" ? "✓ Itinerarios a medida" : "✓ Custom itinerary engine"}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4">
                🎫
              </div>
              <h3 className="font-bold text-stone-100 text-base">
                {l === "es" ? "BoliPass Club" : "BoliPass Club"}
              </h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                {l === "es"
                  ? "Gamificación con pasaporte digital, sellos culturales y beneficios 2x1 en comercios locales participantes."
                  : "Gamified cultural passports, digital stamps, and 2-for-1 perks across local partner venues."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-purple-400 font-semibold">
              {l === "es" ? "✓ Incentivo al consumo local" : "✓ Drives local foot traffic"}
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Matriz de Beneficios Cuádruple
    {
      id: 4,
      tag: {
        es: "Matriz de Valor 360°",
        en: "360° Value Matrix",
      },
      tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      title: {
        es: "Beneficios Tangibles para Todos los Actores",
        en: "Tangible Benefits for All Key Stakeholders",
      },
      subtitle: {
        es: "Un modelo 'Ganar-Ganar-Ganar-Ganar' que potencia toda la cadena de valor cruceña.",
        en: "A 4-way win model empowering citizens, tourists, local businesses, and city government.",
      },
      badge: {
        es: "Impacto Multidisciplinario",
        en: "Multi-Stakeholder Impact",
      },
      speakerNotes: {
        hudson: {
          es: "Para el Municipio, BoliVibes actúa como una consola de gestión de Smart Tourism: entregamos mapas de calor, afluencia por distritos y comportamiento del visitante sin costos de desarrollo de software ni mantenimiento para la Alcaldía.",
          en: "For the Municipality, BoliVibes serves as a Smart Tourism management cockpit: providing heatmaps, district foot-traffic insights, and visitor behaviors without software licensing or server maintenance fees.",
        },
        steff: {
          es: "Para los negocios y centros culturales, somos su mejor aliado. En vez de pagar cientos de dólares en publicidad que nadie mira, BoliVibes lleva personas reales a consumir su café, ver su obra de teatro o comprar su artesanía.",
          en: "For venue owners and cultural creators, we are their strongest ally. Instead of burning marketing dollars on ignored ads, BoliVibes sends real paying visitors through their doors.",
        },
      },
      content: (l) => (
        <div className="space-y-4 pt-2">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
            <button
              onClick={() => setActiveAudienceTab("locales")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "locales"
                  ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              {t[l].tabs.locales}
            </button>
            <button
              onClick={() => setActiveAudienceTab("turistas")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "turistas"
                  ? "bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              {t[l].tabs.turistas}
            </button>
            <button
              onClick={() => setActiveAudienceTab("comercios")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "comercios"
                  ? "bg-orange-500 text-stone-950 shadow-lg shadow-orange-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              {t[l].tabs.comercios}
            </button>
            <button
              onClick={() => setActiveAudienceTab("municipio")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "municipio"
                  ? "bg-purple-500 text-stone-950 shadow-lg shadow-purple-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              {t[l].tabs.municipio}
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[220px]">
            {activeAudienceTab === "locales" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">
                    {l === "es" ? "Fin a la Rutina y el Aburrimiento" : "Ending Daily Routine & Boredom"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Respuesta inmediata a '¿Qué hacemos hoy?'. Descubrimiento de ferias, muestras de arte, conciertos acústicos y movida urbana en segundos."
                      : "Instant answer to 'What should we do today?'. Quick discovery of art fairs, acoustic concerts, and urban happenings in seconds."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">
                    {l === "es" ? "Rescate del Orgullo e Identidad" : "Pride & Cultural Reconnection"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Reconexión con las tradiciones, obras de teatro costumbrista, festival barroco, danza y patrimonio histórico cruceño."
                      : "Reconnecting youth and families with traditions, local plays, baroque festivals, regional dance, and historical heritage."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">
                    {l === "es" ? "Beneficios Exclusivos (BoliPass)" : "Exclusive BoliPass Perks"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Ahorros reales en consumiciones, entradas y experiencias 2x1 en locales gastronómicos y culturales aliados."
                      : "Real savings and 2-for-1 deals at participating local cultural spots, cafes, bistros, and experience venues."}
                  </p>
                </div>
              </div>
            )}

            {activeAudienceTab === "turistas" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm">
                    {l === "es" ? "Circuitos Autoguiados y Seguros" : "Self-Guided & Safe Trails"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Rutas temáticas sugeridas: 'Ruta del Café de Especialidad', 'Milla de los Museos del Centro', 'Comida Típica Cruceña'."
                      : "Curated self-guided itineraries: 'Specialty Coffee Trail', 'Downtown Museum Mile', 'Authentic Cruceño Gastronomy'."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm">
                    {l === "es" ? "Información Oficial Verificada" : "Verified Official Information"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Horarios reales de museos, precios transparentes, reseñas confiables y geolocalización precisa sin temor a perderse."
                      : "Verified opening hours, transparent pricing, authentic reviews, and accurate 3D geolocation for peace of mind."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm">
                    {l === "es" ? "Atención Personalizada con IA" : "AI-Powered Bilingual Concierge"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "bolivIA responde en español o inglés dudas sobre costumbres, transporte seguro, platos típicos y recomendaciones según clima y horario."
                      : "bolivIA guides tourists in Spanish or English on local customs, safe transport, traditional dishes, and timely tips."}
                  </p>
                </div>
              </div>
            )}

            {activeAudienceTab === "comercios" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-orange-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-300 text-sm">
                    {l === "es" ? "Atracción de Tráfico Peatonal Real" : "Real Foot-Traffic Generation"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "A diferencia de la publicidad en redes sociales que se queda en likes vacíos, BoliVibes dirige a personas físicas a cruzar la puerta del local."
                      : "Unlike social media likes that never translate to visits, BoliVibes brings real people through the venue's doors."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-300 text-sm">
                    {l === "es" ? "Herramienta de Fidelización B2B" : "B2B Retention & Loyalty"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Campañas BoliPass personalizadas, control de canje QR sin fricción y retención de clientes recurrentes."
                      : "Customizable BoliPass perks, frictionless QR redemption, and customer retention metrics."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-300 text-sm">
                    {l === "es" ? "Visibilidad sin Costos Predatorios" : "Fair, Accessible Visibility"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Espacio para pequeños emprendimientos culturales, cafeterías y galerías de arte que no cuentan con grandes presupuestos publicitarios."
                      : "An accessible stage for independent cultural venues, boutique cafes, and art galleries with modest marketing budgets."}
                  </p>
                </div>
              </div>
            )}

            {activeAudienceTab === "municipio" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-purple-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">
                    {l === "es" ? "Canal Oficial Directo Sin Costo" : "Direct Official Channel at Zero Cost"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "La Alcaldía gana una plataforma digital moderna de turismo inteligente sin gastar un solo boliviano del presupuesto en software."
                      : "The Municipality gains an enterprise-grade Smart Tourism platform without spending public budget on software development."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">
                    {l === "es" ? "Reactivación Integral del Casco Viejo" : "Downtown Core Revitalization"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Atracción de jóvenes y familias a Plaza 24 de Septiembre, Manzana 1, El Altillo y Casa de la Cultura mediante incentivos digitales."
                      : "Re-engaging youth and families with Plaza 24 de Septiembre, Manzana 1, El Altillo, and Casa de la Cultura through gamified incentives."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">
                    {l === "es" ? "Métricas y Datos para Decisiones" : "Data-Driven Public Policy"}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {l === "es"
                      ? "Panel analítico con datos sobre qué eventos generan mayor tracción, horas pico de turismo y demanda por distritos."
                      : "Anonymized analytics highlighting top-performing cultural events, peak tourism hours, and neighborhood-level interest."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },

    // Slide 5: Revitalización del Casco Viejo
    {
      id: 5,
      tag: {
        es: "Foco Estratégico",
        en: "Strategic Focus",
      },
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: {
        es: "Plan de Revitalización: El Casco Viejo Activo y Digital",
        en: "Revitalization Action Plan: Active & Digital Downtown",
      },
      subtitle: {
        es: "Cómo transformar el centro histórico en el polo cultural y turístico más dinámico de Santa Cruz.",
        en: "How to transform our historic downtown into the city's most vibrant cultural and tourist hub.",
      },
      badge: {
        es: "Estrategia Casco Viejo",
        en: "Downtown Strategy",
      },
      speakerNotes: {
        hudson: {
          es: "La tecnología permite crear un circuito georreferenciado cerrado: cuando el usuario escanea un QR en Manzana 1 o en la Casa de la Cultura, nuestro sistema le sugiere automáticamente la ruta peatonal al Museo Altillo Beni o a una cafetería histórica cercana.",
          en: "Technology enables a closed geo-fenced circuit: when a visitor scans a QR code at Manzana 1 or Casa de la Cultura, our system automatically suggests the walking route to Altillo Beni or a nearby historic cafe.",
        },
        steff: {
          es: "Proponemos lanzar juntos el 'Pasaporte Cultural del Casco Viejo'. Al visitar 3 hitos culturales, los jóvenes y turistas ganan sellos y un beneficio en el café del centro. Convertimos el paseo cultural en un plan social completo.",
          en: "We propose launching the 'Downtown Cultural Passport' together. By visiting 3 heritage landmarks, youth and visitors earn stamps and a perk at a downtown coffee shop, turning a cultural walk into a full social experience.",
        },
      },
      content: (l) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-emerald-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg font-bold">
              🏛️
            </div>
            <h3 className="font-bold text-stone-100 text-base">
              {l === "es" ? "Ruta de los Museos 3D" : "3D Museum & Heritage Trail"}
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              {l === "es"
                ? "Mapeo destacado de hitos patrimoniales: Manzana 1, Museo de la Ciudad Altillo Beni, Casa Melchor Pinto, Museo de Arte Contemporáneo y Catedral Metropolitana."
                : "Prominent 3D mapping of key heritage landmarks: Manzana 1, Altillo Beni City Museum, Casa Melchor Pinto, Museum of Contemporary Art, and Cathedral."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg font-bold">
              🎯
            </div>
            <h3 className="font-bold text-stone-100 text-base">
              {l === "es" ? "Check-in Cultural Gamificado" : "Gamified Cultural Check-ins"}
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              {l === "es"
                ? "Insignias digitales ('Explorador del Centro', 'Amante del Barroco'). Al visitar 3 centros culturales, el usuario recibe un beneficio en cafeterías y librerías aliadas."
                : "Digital badges ('Historic Explorer', 'Baroque Aficionado'). Visiting 3 cultural spaces unlocks special perks in downtown specialty coffee shops and bookstores."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-orange-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center text-lg font-bold">
              🌙
            </div>
            <h3 className="font-bold text-stone-100 text-base">
              {l === "es" ? "Cultura Nocturna y Segura" : "Safe Evening Cultural Life"}
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              {l === "es"
                ? "Promoción de tertulias literarias, música acústica en vivo, teatro de cámara y recorridos nocturnos iluminados para devolver la vida familiar al centro tras el atardecer."
                : "Highlighting book clubs, live acoustic music, chamber theater, and illuminated evening walking routes, reviving safe family activity after dusk."}
            </p>
          </div>
        </div>
      ),
    },

    // Slide 6: Demostración Tecnológica
    {
      id: 6,
      tag: {
        es: "Capacidad Técnica Comprobada",
        en: "Proven Technology Stack",
      },
      tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      title: {
        es: "Tecnología en Vivo: Ya Desarrollada y Operativa",
        en: "Live Technology: Already Built & Operational",
      },
      subtitle: {
        es: "No es una promesa a futuro ni un concepto en borrador; es software funcional y listo para desplegar.",
        en: "Not a future mock-up or conceptual deck; it is functional software ready for immediate city rollout.",
      },
      badge: {
        es: "Demo en Vivo",
        en: "Live Demo",
      },
      speakerNotes: {
        hudson: {
          es: "Invito a Sarah y a su equipo técnico a probar en vivo bolivibes.clubemkt.digital en sus propios teléfonos. La velocidad es instantánea gracias a Cloudflare Edge y el mapa 3D corre fluido en cualquier dispositivo.",
          en: "I invite Sarah and her technical team to test bolivibes.clubemkt.digital live on their own smartphones. Page loads are instant on Cloudflare Edge and the 3D map runs smoothly on any device.",
        },
        steff: {
          es: "Mostremos en vivo cómo un usuario busca qué hacer esta noche, cómo bolivIA le recomienda actividades culturales y cómo un centro cultural municipal puede cargar y actualizar su cartelera en 60 segundos.",
          en: "Let's demonstrate live how a user discovers tonight's events, how bolivIA suggests cultural activities, and how a municipal venue can update its public calendar in 60 seconds.",
        },
      },
      content: (l) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
            <h3 className="font-bold text-cyan-300 text-base flex items-center gap-2">
              <span>⚡</span> {l === "es" ? "Arquitectura de Alto Rendimiento" : "High-Performance Architecture"}
            </h3>
            <ul className="text-xs text-stone-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>{l === "es" ? "Multiplataforma:" : "Cross-Platform:"}</strong>{" "}
                  {l === "es"
                    ? "Web instantánea (Next.js en Cloudflare Edge) + App nativa iOS y Android (Expo)."
                    : "Instant web app (Next.js on Cloudflare Edge) + Native iOS & Android apps (Expo)."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>{l === "es" ? "Mapa 3D Ligero:" : "Ultra-Fast 3D Map:"}</strong>{" "}
                  {l === "es"
                    ? "Modelos 3D optimizados para navegar con fluidez en conexiones 4G locales."
                    : "3D building models optimized to run smoothly even on standard mobile 4G."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>{l === "es" ? "IA Localizada:" : "Localized AI:"}</strong>{" "}
                  {l === "es"
                    ? "bolivIA entrenado con conocimiento de barrios, modismos y agenda cruceña."
                    : "bolivIA fine-tuned with local Cruceño geography, culture, food, and expressions."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>{l === "es" ? "Control QR en Local:" : "Venue QR Check-ins:"}</strong>{" "}
                  {l === "es"
                    ? "Validación de pases y vouchers sin necesidad de hardware adicional."
                    : "Seamless voucher validation without extra POS hardware required."}
                </span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-cyan-400 font-bold">{t[l].liveDemoTitle}</p>
              <h4 className="font-bold text-stone-100 text-lg mt-1">
                {l === "es" ? "Pruebe los Módulos en Tiempo Real" : "Test Core Modules in Real Time"}
              </h4>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">{t[l].liveDemoDesc}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <Link
                href="/map"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                {t[l].liveLinks.map}
              </Link>
              <Link
                href="/santa-cruz-de-la-sierra/eventos"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                {t[l].liveLinks.events}
              </Link>
              <Link
                href="/concierge"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                {t[l].liveLinks.concierge}
              </Link>
              <Link
                href="/bolipass"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                {t[l].liveLinks.bolipass}
              </Link>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 7: Propuesta de Alianza
    {
      id: 7,
      tag: {
        es: "Propuesta de Convenio",
        en: "Partnership Framework",
      },
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: {
        es: "Plan de Trabajo Conjunto: Piloto Institucional",
        en: "Joint Implementation Plan: 30-Day Institutional Pilot",
      },
      subtitle: {
        es: "Una colaboración ágil y sin burocracia para activar la ciudad en los próximos 30 días.",
        en: "An agile, low-friction collaboration to activate city culture over the next 30 days.",
      },
      badge: {
        es: "Alianza Estratégica",
        en: "Strategic Alliance",
      },
      speakerNotes: {
        hudson: {
          es: "Nosotros nos encargamos del 100% de la configuración técnica, alta de usuarios, integración de mapas y mantenimiento de servidores. Cero carga operativa para el equipo técnico municipal.",
          en: "We handle 100% of technical configuration, onboarding, map integration, and server maintenance. Zero workload or technical burden on municipal IT staff.",
        },
        steff: {
          es: "El equipo de campo se encarga de capacitar a los encargados de centros culturales y casetas turísticas. Entregamos material físico con código QR listo para exhibir y activamos a nuestra red de creadores de contenido.",
          en: "Our field team trains staff at cultural centers and tourist kiosks. We deliver ready-to-display physical QR kits and activate our network of cultural creators and influencers.",
        },
      },
      content: (l) => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {l === "es" ? "Fase 1 · Semana 1" : "Phase 1 · Week 1"}
            </span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">
              {l === "es" ? "Sello Cultural Oficial" : "Official Cultural Badge"}
            </h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              {l === "es"
                ? "Integración de la cartelera y festividades municipales con insignia de 'Evento Oficial Verificado'."
                : "Integrating municipal festival schedules with an 'Official Verified Event' badge."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {l === "es" ? "Fase 2 · Semana 2" : "Phase 2 · Week 2"}
            </span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">
              {l === "es" ? "Despliegue de Códigos QR" : "QR Hub Rollout"}
            </h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              {l === "es"
                ? "Stickers y stands informativos en Manzana 1, El Altillo, Casa de la Cultura y casetas de turismo."
                : "Information stands and stickers in Manzana 1, El Altillo, Casa de la Cultura, and tourist kiosks."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {l === "es" ? "Fase 3 · Semana 3" : "Phase 3 · Week 3"}
            </span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">
              {l === "es" ? "Piloto 'Casco Viejo Vivo'" : "'Active Downtown' Pilot"}
            </h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              {l === "es"
                ? "Campaña de 30 días incentivando a 2,000 cruceños y turistas a completar el circuito cultural del centro."
                : "30-day campaign engaging 2,000 locals & tourists to complete the downtown cultural trail."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-purple-500/30">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {l === "es" ? "Fase 4 · Semana 4" : "Phase 4 · Week 4"}
            </span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">
              {l === "es" ? "Reporte de Impacto y Métricas" : "Impact & Metrics Report"}
            </h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              {l === "es"
                ? "Entrega del primer informe con métricas de afluencia, interés cultural y flujo peatonal para la Alcaldía."
                : "Delivering the first comprehensive report on attendance, cultural traction, and foot traffic."}
            </p>
          </div>
        </div>
      ),
    },

    // Slide 8: Cierre
    {
      id: 8,
      tag: {
        es: "Compromiso y Cierre",
        en: "Closing & Next Steps",
      },
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      title: {
        es: "Hagamos que cada rincón de Santa Cruz cuente su historia",
        en: "Let Every Corner of Santa Cruz Tell Its Story",
      },
      subtitle: {
        es: "Uniendo voluntades para posicionar a Santa Cruz de la Sierra como la capital cultural y turística más dinámica de la región.",
        en: "Uniting vision and execution to position Santa Cruz as South America's most dynamic smart cultural hub.",
      },
      badge: {
        es: "Llamado a la Acción",
        en: "Call to Action",
      },
      speakerNotes: {
        hudson: {
          es: "La tecnología está lista y probada. Podemos firmar la carta de intenciones e iniciar la carga de la cartelera oficial esta misma semana.",
          en: "The technology is live and proven. We can sign the letter of intent and begin onboarding the official city agenda this week.",
        },
        steff: {
          es: "Licenciada Sarah, estamos listos para trabajar hombro a hombro con usted y su equipo. Juntos pondremos a Santa Cruz en el mapa cultural que merece.",
          en: "Lic. Sarah, we are ready to work side-by-side with you and your team. Together we will put Santa Cruz on the premier cultural map it deserves.",
        },
      },
      content: (l) => (
        <div className="space-y-6 pt-1">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-stone-900/90 to-emerald-500/10 border border-amber-500/30 text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/api/assets/brand/logo-clay.webp"
                alt="BoliVibes"
                className="w-28 sm:w-36 h-auto drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/imgs/logo-clay.webp";
                }}
              />
            </div>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              {l === "es" ? "Compromiso por Santa Cruz" : "Commitment to Santa Cruz"}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-100 max-w-2xl mx-auto">
              {l === "es"
                ? '"La tecnología al servicio de nuestra identidad, nuestros artistas y nuestra economía urbana."'
                : '"Technology in service of our identity, our artists, and our urban economy."'}
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              {l === "es"
                ? "Santa Cruz no tiene nada que envidiarle a Medellín, Buenos Aires o Curitiba en oferta cultural. Con BoliVibes, le damos la infraestructura digital que merece."
                : "Santa Cruz has world-class cultural richness. With BoliVibes, we give our city the modern digital infrastructure it deserves."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
              <h4 className="font-bold text-stone-200 text-sm">
                {l === "es" ? "Próximo Paso Inmediato" : "Immediate Next Step"}
              </h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                {l === "es"
                  ? "Coordinar la primera mesa técnica para cargar los hitos del calendario cultural de Septiembre Cruceño y festivales de temporada."
                  : "Organize the first working session to sync municipal festival milestones for Septiembre Cruceño and seasonal events."}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
              <h4 className="font-bold text-stone-200 text-sm">
                {l === "es" ? "Contacto Directo" : "Direct Contact"}
              </h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                <strong>Hudson Argollo & Steff</strong> · BoliVibes / ClubeMkt<br />
                {l === "es" ? "Plataforma:" : "Platform:"} <span className="text-amber-400">bolivibes.clubemkt.digital</span>
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const fallbackSlide: SlideData = slides[0] as SlideData;
  const slide: SlideData = slides[currentSlide] ?? fallbackSlide;

  return (
    <div className="min-h-screen bg-[#120c09] text-[#f7e9cc] font-sans antialiased selection:bg-amber-500 selection:text-stone-950 flex flex-col justify-between p-4 sm:p-6 md:p-10">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Top Header & Toolbar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/api/assets/brand/logo-icon.webp"
                alt="BoliVibes Icon"
                className="w-9 h-9 object-contain drop-shadow-[0_4px_12px_rgba(255,196,31,0.3)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/imgs/bolivibes-icon.webp";
                }}
              />
              <div>
                <span className="font-bold text-base tracking-tight text-stone-100 group-hover:text-amber-300 transition-colors">
                  BoliVibes
                </span>
                <span className="text-[10px] text-stone-400 block -mt-1 font-medium">{t[lang].subheading}</span>
              </div>
            </Link>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <span className="text-xs text-amber-400/90 font-semibold hidden sm:inline">
              {t[lang].meetingWith}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Toggle */}
            <div className="bg-stone-900/90 border border-stone-800 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setLang("es")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lang === "es"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                title="Español (Tecla L)"
              >
                ES
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lang === "en"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                title="English (Key L)"
              >
                EN
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-stone-900/90 border border-stone-800 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode("slides")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "slides" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {t[lang].slidesMode}
              </button>
              <button
                onClick={() => setViewMode("doc")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "doc" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {t[lang].docMode}
              </button>
            </div>

            {/* Notes Toggle */}
            {viewMode === "slides" && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                title={lang === "es" ? "Alternar notas del orador (Tecla N)" : "Toggle speaker notes (Key N)"}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showNotes
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-stone-900/90 text-stone-400 border-stone-800 hover:text-stone-200"
                }`}
              >
                <span>🎙️</span>
                <span className="hidden sm:inline">{t[lang].speakerNotesBtn}</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        {viewMode === "slides" ? (
          <main className="my-auto py-8 flex flex-col justify-center min-h-[460px]">
            <div className="space-y-4 animate-fadeIn">
              {/* Slide Meta Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${slide.tagColor}`}
                >
                  {slide.tag[lang]}
                </span>
                {slide.badge && (
                  <span className="text-[11px] font-semibold text-stone-400 bg-stone-900/90 px-3 py-1 rounded-full border border-stone-800">
                    {slide.badge[lang]}
                  </span>
                )}
              </div>

              {/* Slide Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
                  {slide.title[lang]}
                </h1>
                {slide.subtitle && (
                  <p className="text-sm sm:text-base text-stone-400 mt-2 max-w-4xl leading-relaxed">
                    {slide.subtitle[lang]}
                  </p>
                )}
              </div>

              {/* Dynamic Slide Body */}
              <div className="pt-2">{slide.content(lang)}</div>

              {/* Speaker Notes Drawer (Hudson & Steff) */}
              {showNotes && (
                <div className="mt-6 p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md animate-fadeIn space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                      🎙️ {t[lang].notesTitle}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        onClick={() => setSpeakerFilter("all")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          speakerFilter === "all" ? "bg-amber-500 text-stone-950 font-bold" : "text-amber-200/70 hover:text-amber-100"
                        }`}
                      >
                        {t[lang].allSpeakers}
                      </button>
                      <button
                        onClick={() => setSpeakerFilter("hudson")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          speakerFilter === "hudson" ? "bg-amber-500 text-stone-950 font-bold" : "text-amber-200/70 hover:text-amber-100"
                        }`}
                      >
                        Hudson
                      </button>
                      <button
                        onClick={() => setSpeakerFilter("steff")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          speakerFilter === "steff" ? "bg-amber-500 text-stone-950 font-bold" : "text-amber-200/70 hover:text-amber-100"
                        }`}
                      >
                        Steff
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {(speakerFilter === "all" || speakerFilter === "hudson") && (
                      <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                        <span className="text-emerald-400 text-xs font-bold block">
                          💻 Hudson (Tech & Smart City):
                        </span>
                        <p className="text-stone-200 text-xs sm:text-sm italic leading-relaxed">
                          "{slide.speakerNotes.hudson[lang]}"
                        </p>
                      </div>
                    )}

                    {(speakerFilter === "all" || speakerFilter === "steff") && (
                      <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                        <span className="text-amber-400 text-xs font-bold block">
                          🤝 Steff (Alianzas, Cultura & Comunidad):
                        </span>
                        <p className="text-stone-200 text-xs sm:text-sm italic leading-relaxed">
                          "{slide.speakerNotes.steff[lang]}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        ) : (
          /* Document Full-Page Mode */
          <main className="py-8 space-y-12 animate-fadeIn">
            {slides.map((s, idx) => (
              <section key={s.id} className="p-6 sm:p-8 rounded-3xl bg-stone-950/70 border border-stone-800/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${s.tagColor}`}
                  >
                    {t[lang].slideWord} {idx + 1}: {s.tag[lang]}
                  </span>
                  {s.badge && (
                    <span className="text-[11px] font-semibold text-stone-400 bg-stone-900/90 px-3 py-1 rounded-full border border-stone-800">
                      {s.badge[lang]}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-100">{s.title[lang]}</h2>
                {s.subtitle && <p className="text-sm text-stone-400">{s.subtitle[lang]}</p>}
                <div className="pt-2">{s.content(lang)}</div>

                <div className="mt-4 p-5 rounded-2xl bg-amber-950/30 border border-amber-500/20 space-y-3">
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">{t[lang].notesTitle}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                      <span className="text-emerald-400 text-xs font-bold block mb-1">💻 Hudson:</span>
                      <p className="text-stone-300 text-xs italic">"{s.speakerNotes.hudson[lang]}"</p>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                      <span className="text-amber-400 text-xs font-bold block mb-1">🤝 Steff:</span>
                      <p className="text-stone-300 text-xs italic">"{s.speakerNotes.steff[lang]}"</p>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </main>
        )}

        {/* Slide Navigation Footer */}
        {viewMode === "slides" && (
          <footer className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-400 tabular-nums">
                {String(currentSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    title={`${t[lang].slideWord} ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide
                        ? "w-8 bg-amber-500 shadow-sm shadow-amber-500/50"
                        : "w-2 bg-stone-800 hover:bg-stone-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
                disabled={currentSlide === 0}
                className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-xs font-bold text-stone-200 disabled:opacity-40 disabled:hover:bg-stone-900 transition-all flex items-center gap-1.5"
              >
                <span>←</span>
                <span>{t[lang].prev}</span>
              </button>

              <button
                onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
                disabled={currentSlide === slides.length - 1}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>{t[lang].next}</span>
                <span>→</span>
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
