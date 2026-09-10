import HomeScene from "../../home-scene";
import "./embed-hero.css";

/**
 * Bare embed of the real bolivibes-sunrise 3D scene (the same
 * <three-d-stage> used on the public homepage hero), for the mobile app's
 * WebView to load on the sign-in screen. Reuses HomeScene unmodified —
 * the page chrome (nav, info popover, bottom sheets, scene tabs) is only
 * hidden via CSS here, not removed from the DOM, so scene.js's element
 * lookups for those pieces still succeed and the render loop starts
 * normally.
 */
export default function EmbedHeroPage() {
  return <HomeScene />;
}
