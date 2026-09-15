"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SlideData {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  subtitle?: string;
  badge?: string;
  speakerNotes: string;
  content: React.ReactNode;
}

export default function PresentacionClient() {
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
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  const slides: SlideData[] = [
    // Slide 1: Portada
    {
      id: 1,
      tag: "Propuesta Estratégica Institucional",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      title: "BoliVibes: La Infraestructura Digital Inteligente para el Turismo y la Cultura de Santa Cruz",
      subtitle: "Conectando en tiempo real a ciudadanos, turistas y comerciantes con el patrimonio cultural, gastronómico y artístico de nuestra ciudad.",
      badge: "Smart Tourism · Santa Cruz 2026",
      speakerNotes:
        "Licenciada Sarah Mansilla: Santa Cruz es el motor económico y cultural de Bolivia. Sin embargo, existe una desconexión crítica entre todo lo que la ciudad produce culturalmente y cómo el ciudadano o turista lo descubre. BoliVibes no es una simple red social; es la plataforma de Ciudad Inteligente desarrollada para poner la cultura y el turismo cruceño en el bolsillo de todos.",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-3">
                🏛️
              </div>
              <h3 className="font-bold text-stone-100 text-base">Cultura Viva</h3>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                Difusión georreferenciada de museos, festivales municipales, centros culturales y eventos independientes.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
                🗺️
              </div>
              <h3 className="font-bold text-stone-100 text-base">Turismo 3D</h3>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                Navegación interactiva 3D con rutas autoguiadas, Casco Viejo, polos gastronómicos y seguridad para el visitante.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg mb-3">
                🤝
              </div>
              <h3 className="font-bold text-stone-100 text-base">Impacto Económico</h3>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                Reactivación del comercio local, formalización digital y fidelización de flujo peatonal mediante BoliPass.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900/80 to-amber-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Destinataria de la Sesión</p>
              <p className="text-stone-100 font-semibold text-sm sm:text-base">Lic. Sarah Mansilla · Asesora de Cultura y Turismo de Santa Cruz</p>
              <p className="text-stone-400 text-xs mt-0.5">Presentado por Hudson Argollo — Fundador BoliVibes / ClubeMkt</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                Alianza Público-Privada
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: El Reto y Diagnóstico
    {
      id: 2,
      tag: "El Diagnóstico Actual",
      tagColor: "bg-red-500/20 text-red-300 border-red-500/40",
      title: "La Paradoja de la Oferta Cultural Cruceña",
      subtitle: "Santa Cruz genera más cultura y entretenimiento que nunca, pero la información sigue atrapada en silos.",
      badge: "Problema & Oportunidad",
      speakerNotes:
        "Hoy en día un turista o un cruceño se hace la misma pregunta: '¿Qué hay para hacer hoy?'. La agenda de la Alcaldía compite contra el algoritmo de Instagram y TikTok, donde el 80% del contenido cultural se pierde. En el Casco Viejo hay actividades maravillosas que quedan vacías porque la gente simplemente no se enteró a tiempo.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-red-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                01
              </span>
              <h3 className="font-bold text-stone-100 text-base">Dispersión y Algoritmos Restrictivos</h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              La agenda municipal y los eventos independientes compiten con memes y contenido comercial en redes sociales. El alcance orgánico de las actividades culturales es inferior al <strong>10%</strong> de su público potencial.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                02
              </span>
              <h3 className="font-bold text-stone-100 text-base">El Turista Desorientado</h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Quien llega a Santa Cruz se restringe a su hotel y 2 o 3 restaurantes conocidos en Equipetrol o El Urubó. No existe un mapa interactivo centralizado que le guíe con seguridad hacia la Manzana 1, El Altillo Beni o ferias típicas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-orange-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                03
              </span>
              <h3 className="font-bold text-stone-100 text-base">Dormición del Casco Viejo</h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              El centro histórico necesita un catalizador digital que movilice a las nuevas generaciones, conectando la visita a museos y teatros con el consumo en cafeterías y librerías locales.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-blue-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                04
              </span>
              <h3 className="font-bold text-stone-100 text-base">Carencia de Datos en Tiempo Real</h3>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              La gestión pública municipal carece de métricas directas y anónimas sobre qué actividades culturales generan mayor interés ciudadano, qué zonas necesitan refuerzo y qué circuitos turísticos funcionan mejor.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 3: La Solución BoliVibes
    {
      id: 3,
      tag: "La Solución Integral",
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: "BoliVibes: El Ecosistema 360° de Descubrimiento Urbano",
      subtitle: "Tecnología moderna diseñada para conectar cultura, ocio, gastronomía y comunidad en un solo lugar.",
      badge: "Ecosistema Tecnológico",
      speakerNotes:
        "BoliVibes integra cuatro componentes de clase mundial: Mapa 3D Cruceño con edificios extruidos (sin depender de costos millonarios de Google Maps), Agenda Cultural Viva en tiempo real, Asistente Inteligente 'bolivIA' para recomendaciones personalizadas, y BoliPass para premiar la fidelidad y la visita cultural.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">
                🗺️
              </div>
              <h3 className="font-bold text-stone-100 text-base">Mapa 3D Interactivo</h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                Visualización tridimensional de la ciudad, distritos, museos y zonas gastronómicas con geolocalización precisa.
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
              <h3 className="font-bold text-stone-100 text-base">Agenda Viva 24/7</h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                Feed dinámico organizado por fechas, categorías (Teatro, Música, Muestras, Ferias, Noche) y distritos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-amber-400 font-semibold">
              ✓ Actualización en tiempo real
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-orange-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl mb-4">
                ✦
              </div>
              <h3 className="font-bold text-stone-100 text-base">bolivIA Concierge</h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                Asistente de inteligencia artificial que arma itinerarios turísticos y culturales según presupuesto e intereses.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-orange-400 font-semibold">
              ✓ Itinerarios a medida
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4">
                🎫
              </div>
              <h3 className="font-bold text-stone-100 text-base">BoliPass Club</h3>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                Gamificación con pasaporte digital, sellos culturales y beneficios 2x1 en comercios locales participantes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-purple-400 font-semibold">
              ✓ Incentivo al consumo local
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Matriz de Beneficios Cuádruple
    {
      id: 4,
      tag: "Matriz de Valor 360°",
      tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      title: "Beneficios Tangibles para Todos los Actores",
      subtitle: "Un modelo 'Ganar-Ganar-Ganar-Ganar' que potencia toda la cadena de valor cruceña.",
      badge: "Impacto Multidisciplinario",
      speakerNotes:
        "Este es el corazón de la propuesta para la Alcaldía: BoliVibes aporta valor directo a cuatro sectores fundamentales: al vecino cruceño, al turista, a los empresarios y gastronómicos locales, y a la Secretaría de Cultura y Turismo como ente gestor.",
      content: (
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
              👥 Para el Ciudadano Local
            </button>
            <button
              onClick={() => setActiveAudienceTab("turistas")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "turistas"
                  ? "bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              ✈️ Para el Turista
            </button>
            <button
              onClick={() => setActiveAudienceTab("comercios")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "comercios"
                  ? "bg-orange-500 text-stone-950 shadow-lg shadow-orange-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              🏬 Para Negocios y Creadores
            </button>
            <button
              onClick={() => setActiveAudienceTab("municipio")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeAudienceTab === "municipio"
                  ? "bg-purple-500 text-stone-950 shadow-lg shadow-purple-500/20"
                  : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
              }`}
            >
              🏛️ Para la Ciudad y el Municipio
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[220px]">
            {activeAudienceTab === "locales" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">Fin al Aburrimiento y la Rutina</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Respuesta inmediata a "¿Qué hacemos hoy?". Descubrimiento de ferias, muestras de arte, conciertos acústicos y movida urbana en segundos.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">Rescate del Orgullo e Identidad</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Reconexión con las tradiciones, obras de teatro costumbrista, festival barroco, danza y patrimonio histórico cruceño.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm">Beneficios Exclusivos (BoliPass)</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Ahorros reales en consumiciones, entradas y experiencias 2x1 en locales gastronómicos y culturales aliados.
                  </p>
                </div>
              </div>
            )}

            {activeAudienceTab === "turistas" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm">Circuitos Autoguiados y Seguros</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Rutas temáticas sugeridas: "Ruta del Café de Especialidad", "Milla de los Museos del Centro", "Comida Típica Cruceña".
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm">Información Oficial Verificada</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Horarios reales de museos, precios transparentes, reseñas confiables y geolocalización precisa sin temor a perderse.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-300 text-sm">Atención Personalizada con IA</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    bolivIA responde en español o inglés dudas sobre costumbres, transporte seguro, platos típicos y recomendaciones según clima y horario.
                  </p>
                </div>
              </div>
            )}

            {activeAudienceTab === "comercios" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-orange-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-300 text-sm">Atracción de Tráfico Peatonal Real</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    A diferencia de la publicidad en redes sociales que se queda en likes vacíos, BoliVibes dirige a personas físicas a cruzar la puerta del local.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-300 text-sm">Herramienta de Fidelización B2B</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Campañas BoliPass personalizadas, control de canje QR sin fricción y retención de clientes recurrentes.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-300 text-sm">Visibilidad sin Costos Predatorios</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Espacio para pequeños emprendimientos culturales, cafeterías y galerías de arte que no cuentan con grandes presupuestos publicitarios.
                  </p>
                </div>
              </div>
            )}

            {activeAudienceTab === "municipio" && (
              <div className="p-6 rounded-2xl bg-stone-900/90 border border-purple-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">Canal Oficial Directo Sin Costo</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    La Alcaldía gana una plataforma digital moderna de turismo inteligente sin gastar un solo boliviano del presupuesto en desarrollo de software.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">Reactivación Integral del Casco Viejo</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Atracción de jóvenes y familias a la Plaza 24 de Septiembre, Manzana 1, El Altillo y Casa de la Cultura mediante incentivos digitales.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-purple-300 text-sm">Métricas y Datos para Toma de Decisiones</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Panel analítico con datos sobre qué eventos generan mayor tracción, horas pico de turismo y demanda por distritos.
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
      tag: "Foco Estratégico",
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: "Plan de Revitalización: El Casco Viejo Activo y Digital",
      subtitle: "Cómo transformar el centro histórico en el polo cultural y turístico más vibrante de la ciudad.",
      badge: "Estrategia Casco Viejo",
      speakerNotes:
        "Sabemos que el Casco Viejo es una de las grandes prioridades de su gestión. BoliVibes propone un 'Pasaporte Cultural del Centro': el usuario visita la Manzana 1, la Casa de la Cultura y El Altillo Beni, escanea el QR cultural municipal y desbloquea beneficios en cafés y restaurantes del centro. Convertimos la cultura en el motor del comercio.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-emerald-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg font-bold">
              🏛️
            </div>
            <h3 className="font-bold text-stone-100 text-base">Ruta de los Museos 3D</h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Mapeo destacado de los hitos patrimoniales: Manzana 1, Museo de la Ciudad Altillo Beni, Casa Melchor Pinto, Museo de Arte Contemporáneo y Catedral Metropolitana.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg font-bold">
              🎯
            </div>
            <h3 className="font-bold text-stone-100 text-base">Check-in Cultural Gamificado</h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Insignias digitales ("Explorador del Centro", "Amante del Barroco"). Al completar el recorrido de 3 centros culturales, el usuario recibe un beneficio en cafeterías y librerías aliadas del centro.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-orange-500/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center text-lg font-bold">
              🌙
            </div>
            <h3 className="font-bold text-stone-100 text-base">Cultura Nocturna y Segura</h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Promoción de tertulias literarias, música en vivo acústica, teatro de cámara y recorridos nocturnos iluminados, devolviendo la vida familiar y turística al centro tras el atardecer.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 6: Demostración Tecnológica
    {
      id: 6,
      tag: "Capacidad Técnica Comprobada",
      tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      title: "Tecnología en Vivo: Ya Desarrollada y Operativa",
      subtitle: "No es una promesa a futuro ni un PowerPoint conceptual; es software funcional y listo para desplegar.",
      badge: "Demo en Vivo",
      speakerNotes:
        "Todo lo que estamos mostrando ya funciona en producción en bolivibes.clubemkt.digital y en la app móvil. Podemos probar ahora mismo el mapa interactivo, la agenda de eventos y el asistente bolivIA.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
            <h3 className="font-bold text-cyan-300 text-base flex items-center gap-2">
              <span>⚡</span> Arquitectura de Alto Rendimiento
            </h3>
            <ul className="text-xs text-stone-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Multiplataforma:</strong> Web de carga instantánea (Next.js en Cloudflare Edge) + App nativa iOS y Android (Expo).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Mapa 3D Ligero:</strong> Modelos 3D optimizados para navegar con fluidez incluso en redes móviles 4G locales.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Asistente IA Localizado:</strong> bolivIA entrenado específicamente con lenguaje, jerga, gastronomía y geografía cruceña.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Control QR en Punto de Venta:</strong> Escaneo seguro de pases y entradas sin equipamiento costoso.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/90 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Enlaces de Prueba en Directo</p>
              <h4 className="font-bold text-stone-100 text-lg mt-1">Explorar la Plataforma en Vivo</h4>
              <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                Acceso directo a los módulos clave para demostración inmediata durante la reunión.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <Link
                href="/map"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                🗺️ Abrir Mapa 3D
              </Link>
              <Link
                href="/santa-cruz-de-la-sierra/eventos"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                📅 Feed de Eventos
              </Link>
              <Link
                href="/concierge"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                ✦ Probar bolivIA
              </Link>
              <Link
                href="/bolipass"
                target="_blank"
                className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-xs font-semibold text-stone-200 text-center transition-all"
              >
                🎫 Ver BoliPass
              </Link>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 7: Propuesta de Alianza Municipio + BoliVibes
    {
      id: 7,
      tag: "Propuesta de Convenio",
      tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      title: "Plan de Trabajo Conjunto: Piloto Institucional",
      subtitle: "Una colaboración ágil y sin burocracia para activar la ciudad en los próximos 30 días.",
      badge: "Alianza Estratégica",
      speakerNotes:
        "Proponemos un acuerdo de colaboración mutua muy claro y sin fricciones: BoliVibes aporta la infraestructura tecnológica de forma 100% gratuita para el municipio, y la Dirección de Cultura y Turismo aporta la validación de la agenda oficial y la colocación de tótems/stickers QR en los centros culturales.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fase 1 · Semana 1</span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">Sello Cultural Oficial</h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              Integración de la cartelera y festividades municipales con insignia de "Evento Oficial Verificado".
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Fase 2 · Semana 2</span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">Despliegue de Códigos QR</h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              Stickers y stands informativos en Manzana 1, El Altillo, Casa de la Cultura y casetas de información turística.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Fase 3 · Semana 3</span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">Piloto 'Casco Viejo Vivo'</h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              Campaña de 30 días incentivando a 2,000 cruceños y turistas a completar el circuito cultural del centro.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Fase 4 · Semana 4</span>
            <h3 className="font-bold text-stone-100 text-sm mt-2">Informe de Impacto y Datos</h3>
            <p className="text-stone-400 text-xs mt-2 leading-relaxed">
              Entrega del primer reporte de métricas de afluencia, interés cultural y flujo peatonal para la Alcaldía.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 8: Cierre y Próximos Pasos
    {
      id: 8,
      tag: "Compromiso y Cierre",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      title: "Hagamos que cada rincón de Santa Cruz cuente su historia",
      subtitle: "Uniendo voluntades para posicionar a Santa Cruz de la Sierra como la capital cultural y turística más dinámica de la región.",
      badge: "Llamado a la Acción",
      speakerNotes:
        "Licenciada Sarah, estamos listos para iniciar de inmediato. Pongamos a Santa Cruz a la vanguardia del turismo inteligente en Sudamérica.",
      content: (
        <div className="space-y-6 pt-2">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-stone-900/90 to-emerald-500/10 border border-amber-500/30 text-center space-y-3">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">Compromiso por Santa Cruz</p>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-100 max-w-2xl mx-auto">
              "La tecnología al servicio de nuestra identidad, nuestros artistas y nuestra economía urbana."
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-xl mx-auto">
              Santa Cruz no tiene nada que envidiarle a Medellín, Buenos Aires o Curitiba en oferta cultural. Con BoliVibes, le damos la infraestructura digital que merece.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
              <h4 className="font-bold text-stone-200 text-sm">Próximo Paso Inmediato</h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                Coordinar la primera mesa técnica para cargar los hitos del calendario cultural de Septiembre Cruceño y festivales de fin de año.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
              <h4 className="font-bold text-stone-200 text-sm">Contacto Directo</h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                <strong>Hudson Argollo</strong> · Fundador BoliVibes<br />
                Plataforma: <span className="text-amber-400">bolivibes.clubemkt.digital</span>
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
                <span className="text-[10px] text-stone-400 block -mt-1 font-medium">Santa Cruz Smart City</span>
              </div>
            </Link>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <span className="text-xs text-amber-400/90 font-semibold hidden sm:inline">
              Reunión con Lic. Sarah Mansilla
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-stone-900/90 border border-stone-800 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode("slides")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "slides" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Diapositivas
              </button>
              <button
                onClick={() => setViewMode("doc")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === "doc" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Documento Completo
              </button>
            </div>

            {/* Notes Toggle */}
            {viewMode === "slides" && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                title="Alternar notas del orador (Tecla N)"
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showNotes
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-stone-900/90 text-stone-400 border-stone-800 hover:text-stone-200"
                }`}
              >
                <span>🎙️</span>
                <span className="hidden sm:inline">Notas Orador</span>
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
                  {slide.tag}
                </span>
                {slide.badge && (
                  <span className="text-[11px] font-semibold text-stone-400 bg-stone-900/90 px-3 py-1 rounded-full border border-stone-800">
                    {slide.badge}
                  </span>
                )}
              </div>

              {/* Slide Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="text-sm sm:text-base text-stone-400 mt-2 max-w-4xl leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
              </div>

              {/* Dynamic Slide Body */}
              <div className="pt-2">{slide.content}</div>

              {/* Speaker Notes Drawer */}
              {showNotes && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">🎙️ Guía / Notas para Hudson:</span>
                  </div>
                  <p className="text-stone-200 text-xs sm:text-sm italic leading-relaxed">
                    "{slide.speakerNotes}"
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
                    Diapositiva {idx + 1}: {s.tag}
                  </span>
                  {s.badge && (
                    <span className="text-[11px] font-semibold text-stone-400 bg-stone-900/90 px-3 py-1 rounded-full border border-stone-800">
                      {s.badge}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-100">{s.title}</h2>
                {s.subtitle && <p className="text-sm text-stone-400">{s.subtitle}</p>}
                <div className="pt-2">{s.content}</div>
                <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/20">
                  <p className="text-xs text-amber-300 font-bold mb-1">Notas del orador para esta sección:</p>
                  <p className="text-stone-300 text-xs italic">"{s.speakerNotes}"</p>
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
                    title={`Ir a diapositiva ${i + 1}`}
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
                <span>Anterior</span>
              </button>

              <button
                onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
                disabled={currentSlide === slides.length - 1}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>Siguiente</span>
                <span>→</span>
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
