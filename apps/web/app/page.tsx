import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "BoliVibes en FEXPOCRUZ — Comunidad y turismo en Santa Cruz",
  description:
    "BoliVibes conecta visitantes, residentes, emprendimientos y experiencias locales para fortalecer la comunidad y el turismo en Santa Cruz de la Sierra.",
  openGraph: {
    title: "BoliVibes en FEXPOCRUZ",
    description:
      "Una app para descubrir Santa Cruz de la Sierra, mover turismo local y dar más visibilidad a la comunidad cruceña.",
    url: SITE_URL,
    siteName: "BoliVibes",
  },
};

const communityBenefits = [
  {
    title: "Más visibilidad para negocios locales",
    text: "Restaurantes, cafés, bares, mercados, galerías, guías y emprendimientos pueden aparecer donde visitantes y residentes ya están buscando qué hacer.",
  },
  {
    title: "Agenda viva de la ciudad",
    text: "Eventos culturales, familiares, gastronómicos y de entretenimiento quedan organizados en un solo lugar, reduciendo la dependencia del boca a boca o publicaciones perdidas.",
  },
  {
    title: "Puente entre residentes y visitantes",
    text: "La app ayuda a que quien vive en Santa Cruz recomiende mejor su ciudad, y que quien llega por primera vez se sienta acompañado desde el primer día.",
  },
];

const tourismBenefits = [
  "Rutas por zonas, categorías y momentos del día para descubrir Santa Cruz con contexto local.",
  "Información práctica para decidir rápido: ubicación, ambiente, tipo de experiencia y enlaces directos.",
  "Promoción de cultura, gastronomía, vida nocturna, ferias, espacios patrimoniales y experiencias auténticas.",
  "Herramientas para convertir grandes ferias como FEXPOCRUZ en visitas reales a lugares de la ciudad.",
];

const expocruzOpportunities = [
  "Mostrar a expositores cómo BoliVibes puede llevar tráfico desde la feria hacia sus locales, eventos y promociones.",
  "Invitar a la comunidad cruceña a mapear sus lugares favoritos y fortalecer una guía hecha desde Santa Cruz.",
  "Conectar turistas, familias y jóvenes con planes seguros, cercanos y relevantes durante su estadía.",
  "Presentar BoliPass como una función dentro de BoliVibes para activar beneficios, 2x1 y recompensas locales.",
];

const stats = [
  { value: "1 ciudad", label: "con una guía viva y local" },
  { value: "4 públicos", label: "turistas, residentes, negocios y organizadores" },
  { value: "24/7", label: "descubrimiento desde el celular" },
];

export default function HomePage() {
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Organization", name: "BoliVibes", url: SITE_URL, logo: `${SITE_URL}/favicon-512.png` },
    { "@context": "https://schema.org", "@type": "WebSite", name: "BoliVibes", url: SITE_URL },
  ];

  return (
    <main className="bv-app-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 20%, rgba(229, 184, 36, 0.32), transparent 18rem), radial-gradient(circle at 82% 8%, rgba(196, 112, 61, 0.28), transparent 22rem), linear-gradient(155deg, #241f27 0%, #392f2a 48%, #8f4225 100%)",
          color: "var(--bv-cream)",
        }}
      >
        <div className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 28, paddingBottom: 72 }}>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 56 }}>
            <Link href="/" aria-label="BoliVibes home" style={{ display: "inline-flex", alignItems: "center" }}>
              <img src="/logo-full-dark.svg" alt="BoliVibes" width={188} height={52} style={{ height: "auto", maxWidth: "48vw" }} />
            </Link>
            <div className="bv-chip-row" style={{ justifyContent: "flex-end" }}>
              <Link href="/santa-cruz-de-la-sierra/eventos" className="bv-chip">
                Eventos
              </Link>
              <Link href="/santa-cruz-de-la-sierra/lugares" className="bv-chip">
                Lugares
              </Link>
            </div>
          </nav>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 34, alignItems: "center" }}>
            <div>
              <p className="bv-section-kicker" style={{ color: "#e5b824" }}>
                BoliVibes en FEXPOCRUZ
              </p>
              <h1
                style={{
                  margin: "0 0 18px",
                  maxWidth: 720,
                  color: "#fff6e5",
                  fontFamily: "Caprasimo, Georgia, serif",
                  fontSize: "clamp(42px, 8vw, 82px)",
                  lineHeight: 0.96,
                }}
              >
                Una app para mover comunidad, cultura y turismo en Santa Cruz.
              </h1>
              <p style={{ margin: "0 0 28px", maxWidth: 640, color: "#f1dfbd", fontSize: 18, fontWeight: 750, lineHeight: 1.55 }}>
                En FEXPOCRUZ presentamos BoliVibes como la guía digital que convierte la energía de Santa Cruz de la Sierra en visitas, planes, recomendaciones y oportunidades para negocios locales.
              </p>
              <div className="bv-chip-row" style={{ marginBottom: 30 }}>
                <span className="bv-chip">Turismo local</span>
                <span className="bv-chip">Agenda cultural</span>
                <span className="bv-chip">Comunidad cruceña</span>
                <span className="bv-chip">Beneficios BoliPass</span>
              </div>
              <div className="bv-chip-row">
                <Link href="/santa-cruz-de-la-sierra/lugares" className="bv-btn">
                  Explorar la ciudad →
                </Link>
                <Link href="/santa-cruz-de-la-sierra/eventos" className="bv-btn bv-btn-sage">
                  Ver eventos →
                </Link>
              </div>
            </div>

            <div className="bv-card bv-card-pad" style={{ background: "rgba(253, 250, 243, 0.94)", padding: 22 }}>
              <div style={{ borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg, #f7f1e4, #e9dfc9)", padding: 20 }}>
                <p className="bv-section-kicker">Impacto esperado</p>
                <div style={{ display: "grid", gap: 14 }}>
                  {stats.map((item) => (
                    <div key={item.value} style={{ padding: "18px 20px", borderRadius: 20, background: "#fffaf0", boxShadow: "0 3px 0 #d9c8a4" }}>
                      <div style={{ color: "var(--bv-orange-low)", fontFamily: "Caprasimo, Georgia, serif", fontSize: 32, lineHeight: 1 }}>{item.value}</div>
                      <div className="bv-card-meta" style={{ fontSize: 14 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 64 }}>
        <p className="bv-section-kicker">Por qué importa</p>
        <h2 className="bv-title-sm" style={{ maxWidth: 720 }}>Beneficios directos para la comunidad cruceña</h2>
        <div className="bv-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
          {communityBenefits.map((benefit) => (
            <article key={benefit.title} className="bv-card bv-card-pad" style={{ minHeight: 190 }}>
              <div className="bv-chip" style={{ marginBottom: 16 }}>Comunidad</div>
              <h3 className="bv-card-title" style={{ fontSize: 21, marginBottom: 10 }}>{benefit.title}</h3>
              <p className="bv-card-meta" style={{ fontSize: 15, lineHeight: 1.55 }}>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 24 }}>
        <div className="bv-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0, overflow: "hidden" }}>
          <div style={{ padding: 28, background: "linear-gradient(160deg, #fdfaf3, #f6efdd)" }}>
            <p className="bv-section-kicker">Turismo en Santa Cruz</p>
            <h2 className="bv-title-sm">De la feria a la ciudad</h2>
            <p className="bv-subtitle" style={{ fontSize: 16 }}>
              FEXPOCRUZ concentra visitantes, marcas y familias. BoliVibes ayuda a extender ese movimiento hacia restaurantes, museos, barrios, experiencias, conciertos y comercios de Santa Cruz de la Sierra.
            </p>
            <Link href="/city3d" className="bv-btn">
              Ver experiencia 3D →
            </Link>
          </div>
          <div style={{ padding: 28, background: "#2d2925", color: "#f7f1e4" }}>
            <ul style={{ display: "grid", gap: 16, listStyle: "none", margin: 0, padding: 0 }}>
              {tourismBenefits.map((benefit) => (
                <li key={benefit} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 12, alignItems: "start", fontWeight: 750, lineHeight: 1.45 }}>
                  <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: 34, height: 34, borderRadius: 999, background: "#e5b824", color: "#201e1d", fontWeight: 900 }}>✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 24 }}>
        <p className="bv-section-kicker">Activación en FEXPOCRUZ</p>
        <h2 className="bv-title-sm" style={{ maxWidth: 760 }}>Qué vamos a promover durante la feria</h2>
        <div className="bv-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          {expocruzOpportunities.map((item, index) => (
            <article key={item} className="bv-card bv-card-pad">
              <div style={{ color: "var(--bv-orange)", fontFamily: "Caprasimo, Georgia, serif", fontSize: 36, marginBottom: 8 }}>{String(index + 1).padStart(2, "0")}</div>
              <p className="bv-card-meta" style={{ fontSize: 15, lineHeight: 1.55, margin: 0 }}>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 24 }}>
        <div className="bv-card bv-card-pad" style={{ textAlign: "center", padding: "38px 24px", background: "linear-gradient(145deg, #fffaf0, #f0e5cd)" }}>
          <p className="bv-section-kicker">Hecho para Santa Cruz</p>
          <h2 className="bv-title-sm" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 780 }}>
            BoliVibes no solo muestra lugares: ayuda a que la ciudad se encuentre consigo misma y se muestre mejor al mundo.
          </h2>
          <p className="bv-subtitle" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 720, fontSize: 16 }}>
            La meta es que cada visitante descubra más, cada residente participe más y cada negocio local tenga una nueva puerta de entrada al turismo digital.
          </p>
          <div className="bv-chip-row" style={{ justifyContent: "center" }}>
            <Link href="/connect" className="bv-btn">
              Conectar con BoliVibes →
            </Link>
            <Link href="/bolipass" className="bv-btn bv-btn-sage">
              Conocer BoliPass →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
