"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lang = "es" | "en";

interface SlideData {
  id: number;
  tag: { es: string; en: string };
  tagColor: string;
  title: { es: string; en: string };
  subtitle?: { es: string; en: string };
  badge?: { es: string; en: string };
  speakerNotes: { es: string; en: string };
  content: (lang: Lang) => React.ReactNode;
}

export default function PresentacionClient() {
  const [lang, setLang] = useState<Lang>("es");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
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
      meetingWith: "Reunión con Lic. Sarah Mansilla",
      slidesMode: "Diapositivas",
      docMode: "Documento Completo",
      speakerNotesBtn: "Notas Orador",
      speakerNotesHeader: "🎙️ Guía / Notas para Hudson:",
      prev: "Anterior",
      next: "Siguiente",
      slideWord: "Diapositiva",
      pressHint: "Espacio o Flechas para navegar · N para notas · L para cambiar idioma",
      destinataryLabel: "Destinataria de la Sesión",
      destinataryName: "Lic. Sarah Mansilla · Asesora de Cultura y Turismo de Santa Cruz",
      presenter: "Presentado por Hudson Argollo — Fundador BoliVibes / ClubeMkt",
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
      meetingWith: "Meeting with Lic. Sarah Mansilla",
      slidesMode: "Slides View",
      docMode: "Full Document",
      speakerNotesBtn: "Speaker Notes",
      speakerNotesHeader: "🎙️ Hudson's Speaking Notes:",
      prev: "Previous",
      next: "Next",
      slideWord: "Slide",
      pressHint: "Space or Arrow keys to navigate · N for notes · L to toggle language",
      destinataryLabel: "Session Guest of Honor",
      destinataryName: "Lic. Sarah Mansilla · Advisor for Culture and Tourism of Santa Cruz",
      presenter: "Presented by Hudson Argollo — Founder, BoliVibes / ClubeMkt",
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
    // Slide 1: Portada / Title
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
        es: "Licenciada Sarah Mansilla: Santa Cruz es el motor económico y cultural de Bolivia. Sin embargo, existe una desconexión crítica entre todo lo que la ciudad produce culturalmente y cómo el ciudadano o turista lo descubre. BoliVibes no es una simple red social; es la plataforma de Ciudad Inteligente desarrollada para poner la cultura y el turismo cruceño en el bolsillo de todos.",
        en: "Lic. Sarah Mansilla: Santa Cruz is the economic and cultural engine of Bolivia. Yet, there is a critical disconnect between what the city produces and how locals and visitors discover it. BoliVibes is not just a social feed—it is a Smart Tourism infrastructure built to put Santa Cruz culture directly in everyone's pocket.",
      },
      content: (l) => (
        <div className="space-y-6 pt-2">
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

          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900/80 to-amber-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">{t[l].destinataryLabel}</p>
              <p className="text-stone-100 font-semibold text-sm sm:text-base">{t[l].destinataryName}</p>
              <p className="text-stone-400 text-xs mt-0.5">{t[l].presenter}</p>
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

    // Slide 2: El Diagnóstico / Problem
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
        es: "Hoy en día un turista o un cruceño se hace la misma pregunta: '¿Qué hay para hacer hoy?'. La agenda de la Alcaldía compite contra el algoritmo de Instagram y TikTok, donde el 80% del contenido cultural se pierde. En el Casco Viejo hay actividades maravillosas que quedan vacías porque la gente simplemente no se enteró a tiempo.",
        en: "Today, tourists and locals ask the exact same question: 'What is happening today?'. Municipal programs compete with social media feeds where over 80% of cultural reach is lost. In the Historic Center, amazing events remain underattended simply because people find out too late.",
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
        es: "BoliVibes integra cuatro componentes clave: Mapa 3D Cruceño con edificios extruidos (sin depender de costos millonarios de Google Maps), Agenda Cultural Viva en tiempo real, Asistente Inteligente 'bolivIA' para recomendaciones personalizadas, y BoliPass para premiar la fidelidad y la visita cultural.",
        en: "BoliVibes integrates 4 pillars: a lightweight 3D City Map (custom OpenStreetMap + Three.js), a 24/7 Live Cultural Agenda, the 'bolivIA' AI Concierge for tailored itineraries, and BoliPass to reward local loyalty and cultural exploration.",
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
        es: "Este es el corazón de la propuesta: BoliVibes aporta valor directo a cuatro sectores: al vecino cruceño, al turista, a los empresarios y gastronómicos locales, y a la Secretaría de Cultura y Turismo como ente gestor.",
        en: "This is the core value proposition: direct, measurable value delivered to 4 distinct groups: local citizens, tourists, venue owners, and the Municipal Directorate of Culture and Tourism.",
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
        es: "Sabemos que el Casco Viejo es una de las grandes prioridades de su gestión. BoliVibes propone un 'Pasaporte Cultural del Centro': el usuario visita la Manzana 1, la Casa de la Cultura y El Altillo Beni, escanea el QR cultural municipal y desbloquea beneficios en cafés y restaurantes del centro. Convertimos la cultura en el motor del comercio.",
        en: "We know revitalizing the historic center is a top priority. BoliVibes introduces a 'Downtown Cultural Passport': users visit Manzana 1, Casa de la Cultura, and Altillo Beni, scan municipal QR codes, and unlock rewards in nearby cafes. Culture becomes the engine of local commerce.",
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
        es: "Todo lo que estamos mostrando ya funciona en producción en bolivibes.clubemkt.digital y en la app móvil. Podemos probar ahora mismo el mapa interactivo, la agenda de eventos y el asistente bolivIA.",
        en: "Everything we are presenting is already running live in production at bolivibes.clubemkt.digital and in the mobile app. We can test the 3D map, event feeds, and bolivIA concierge right now.",
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
        es: "Proponemos un acuerdo de colaboración mutua muy claro y sin fricciones: BoliVibes aporta la infraestructura tecnológica de forma 100% gratuita para el municipio, y la Dirección de Cultura y Turismo aporta la validación de la agenda oficial y la colocación de tótems/stickers QR en los centros culturales.",
        en: "We propose a frictionless partnership: BoliVibes provides the software platform at zero cost to the municipality, while the Directorate provides official agenda validation and QR placement in key cultural centers.",
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

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
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
        es: "Licenciada Sarah, estamos listos para iniciar de inmediato. Pongamos a Santa Cruz a la vanguardia del turismo inteligente en Sudamérica.",
        en: "Lic. Sarah, we are ready to launch immediately. Let's place Santa Cruz at the forefront of Smart Tourism in the region.",
      },
      content: (l) => (
        <div className="space-y-6 pt-2">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-stone-900/90 to-emerald-500/10 border border-amber-500/30 text-center space-y-3">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              {l === "es" ? "Compromiso por Santa Cruz" : "Commitment to Santa Cruz"}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-100 max-w-2xl mx-auto">
              {l === "es"
                ? '"La tecnología al servicio de nuestra identidad, nuestros artistas y nuestra economía urbana."'
                : '"Technology in service of our identity, our artists, and our urban economy."'}
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl mx-auto">
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
                <strong>Hudson Argollo</strong> · {l === "es" ? "Fundador BoliVibes" : "Founder, BoliVibes"}<br />
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-md shadow-amber-500/20">
                <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
                  BV
                </div>
              </div>
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

              {/* Speaker Notes Drawer */}
              {showNotes && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md animate-fadeIn">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                      {t[lang].speakerNotesHeader}
                    </span>
                  </div>
                  <p className="text-stone-200 text-xs sm:text-sm italic leading-relaxed">
                    "{slide.speakerNotes[lang]}"
                  </p>
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
                <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/20">
                  <p className="text-xs text-amber-300 font-bold mb-1">{t[lang].speakerNotesHeader}</p>
                  <p className="text-stone-300 text-xs italic">"{s.speakerNotes[lang]}"</p>
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
