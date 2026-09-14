declare module "@googlemaps/three" {
  import type { Intersection, Object3D, Scene, Vector2, Vector3 } from "three";

  export class ThreeJSOverlayView {
    scene: Scene;
    onBeforeDraw?: () => void;
    constructor(options: { map?: google.maps.Map; anchor: google.maps.LatLngLiteral; upAxis?: "X" | "Y" | "Z" });
    latLngAltitudeToVector3(latLngAltitude: google.maps.LatLngAltitudeLiteral, target?: Vector3): Vector3;
    raycast(mousePosition: Vector2): Intersection<Object3D>[];
    requestRedraw(): void;
    setMap(map: google.maps.Map | null): void;
  }
}
