# BoliVibes — Rediseño del Hero, Panel Deslizante de Login y Multilingüismo Automático

Este documento detalla la especificación técnica y de diseño para la evolución de la página de inicio (**Landing Page**) de **BoliVibes**, integrando:
1. **Panel deslizante de Autenticación (Slide-in Auth Drawer):** Acceso inmediato a Iniciar Sesión y Crear Cuenta sin abandonar la página principal.
2. **Detección Automática de Idioma (ES / EN):** Adaptación inteligente basada en la configuración del navegador del usuario con persistencia local.
3. **Optimización del Hero y Storytelling de Marca:** Nueva disposición visual, mensajes persuasivos para ambos públicos (Exploradores y Negocios) y directrices estrictas de la identidad visual BoliVibes.
4. **Prompts de Generación de Imagen (Brand Illustrations):** Especificaciones exactas para Midjourney / Imagen basadas en la estética de arcilla boliviana y tonos cálidos.

---

## 1. Experiencia de Usuario (UX): Panel Deslizante de Autenticación

En lugar de redirigir al usuario a una página aislada de login o registro, las CTAs principales de la landing (*"Log in"*, *"I'm exploring Santa Cruz"* y *"Crear cuenta"*) activan un **Panel Deslizante Lateral (Slide-in Drawer)** impulsado por `framer-motion`:
* **Acceso sin fricción:** El usuario mantiene el contexto visual del mapa 3D y de la ciudad de Santa Cruz de la Sierra mientras interactúa con el formulario.
* **Pestañas Interactivas de Acceso:** Selector fluido entre **Iniciar Sesión** (*Sign In*) y **Crear Cuenta** (*Sign Up*).
* **Dualidad de Roles:** Bienvenida explícita tanto para usuarios finales (exploradores/turistas) como para dueños de negocios y creadores de contenido (anfitriones).

---

## 2. Multilingüismo Automático (ES / EN Inteligente)

El sistema detecta automáticamente el idioma preferido del dispositivo o navegador al cargar la página:
```typescript
useEffect(() => {
  const stored = localStorage.getItem("bv_lang");
  if (stored === "en" || stored === "es") {
    setLang(stored);
  } else if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) {
    setLang("en");
  } else {
    setLang("es"); // Español por defecto para Santa Cruz / Bolivia
  }
}, []);
```
* **Español (ES)** configurado como idioma predeterminado para el mercado local.
* **Inglés (EN)** activado automáticamente para visitantes internacionales o navegadores configurados en inglés.
* **Control manual persistente:** El usuario puede alternar en cualquier momento mediante el selector de idioma en la barra superior.

---

## 3. Disposición del Hero y Copywriting Persuasivo

El Hero se reestructura en una cuadrícula asimétrica de alto impacto:
* **Columna Izquierda (Propuesta de Valor & Acciones):**
  * *Kicker:* `BoliVibes · Santa Cruz de la Sierra`
  * *Headline Principal:* *"La ciudad en tus manos: planes, mapas 3D, beneficios y crecimiento local."* / *"The city in your hands: plans, 3D maps, perks, and local growth."*
  * *Subtítulo:* Texto explicativo conectando la agenda cultural en tiempo real, el club de beneficios BoliPass y el asistente de inteligencia artificial bolivIA.
* **Columna Derecha (Tarjeta Interactiva de Acceso Rápido):**
  * Presenta el logotipo oficial arcilla 3D (`logo-clay.webp`) y el icono de marca (`logo-icon.webp`).
  * Botones de acción directa con animaciones de elevación y micro-interacciones.

---

## 4. Prompts de Generación de Ilustraciones (Estética BoliVibes)

Para mantener la coherencia con la **Brand Guide** (arcilla boliviana, superficies de terracota mate, tonos cálidos y cero estéticas cyberpunk/neón), se han definido los siguientes prompts optimizados para generación de recursos visuales:

### Prompt 1: Ilustración Hero / Ambient Background (Estilo Arcilla 3D)
> **Prompt:** `A warm Bolivian clay aesthetic scene of Santa Cruz de la Sierra nightlife and urban culture, matte terracotta red #C04A2F, vibrant orange #E2792F, golden yellow #E3A52F, sage green #8BA672, and cream #F4EEE2 surfaces. Soft rounded geometric shapes, glowing ambient orbs, modern isometric city skyline with cathedral steeple and palm trees, cozy warm lighting, premium editorial style, high contrast, clean vectors, zero photorealism, no fake text. --ar 16:9 --v 6.0`

### Prompt 2: Textura de Fondo y Orbes (Framer-like Ambient)
> **Prompt:** `Abstract subtle clay texture background with floating blurred glowing spheres in golden yellow, terracotta, and soft sage, matte ceramic finish, depth of field, warm organic aesthetic, minimalist branding background. --ar 16:9 --v 6.0`

---

## 5. Resumen de Archivos Documentados

* `docs/landing-architecture-and-auth-drawer.md`: Especificación completa del componente slide-in.
* `docs/bilingual-localization-specs.md`: Reglas de internacionalización automática navegador/dispositivo.
* `BRANDGUIDE/DESIGN-SYSTEM.md`: Guía de tokens de diseño y uso exclusivo de `logo-clay.webp` y `logo-icon.webp`.
