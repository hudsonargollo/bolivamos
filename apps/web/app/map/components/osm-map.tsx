import { useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Sky, Environment, Line, MapControls } from "@react-three/drei";
import * as THREE from "three";
import type { PlaceFeature } from "@bolivibes/api-schema";

const scale = 51000;
const refLat = -17.7834;
const refLng = -63.1821;
// Bounding box for center of Santa Cruz
const SC_BOX = {
  south: -17.795,
  west: -63.195,
  north: -17.770,
  east: -63.170,
};

function project(lat: number, lng: number) {
  const x = (lng - refLng) * scale * Math.cos((refLat * Math.PI) / 180);
  const y = (lat - refLat) * scale;
  return new THREE.Vector2(x, y);
}

function Building({ shape, depth, color }: { shape: THREE.Shape; depth: number; color: string }) {
  const extrudeSettings = { steps: 1, depth, bevelEnabled: false };
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function OsmMap({ places, activePlace, onPlaceSelect }: { places: PlaceFeature[], activePlace: PlaceFeature | null, onPlaceSelect: (p: PlaceFeature) => void }) {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [roads, setRoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch buildings and roads via Overpass
    const query = `[out:json][timeout:25];(
      way["building"](${SC_BOX.south},${SC_BOX.west},${SC_BOX.north},${SC_BOX.east});
      relation["building"](${SC_BOX.south},${SC_BOX.west},${SC_BOX.north},${SC_BOX.east});
      way["highway"](${SC_BOX.south},${SC_BOX.west},${SC_BOX.north},${SC_BOX.east});
    );out body geom;`;
    
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then(res => res.json())
      .then((data: any) => {
        const blds = [];
        const rds = [];
        for (const el of data.elements) {
          if (!el.geometry || el.geometry.length < 2) continue;
          if (el.tags?.building) {
            blds.push(el);
          } else if (el.tags?.highway) {
            rds.push(el);
          }
        }
        setBuildings(blds);
        setRoads(rds);
        setLoading(false);
      })
      .catch(err => {
        console.error("OSM Fetch error", err);
        setLoading(false);
      });
  }, []);

  const buildingMeshes = useMemo(() => {
    const result = [];
    for (const bld of buildings) {
      if (!bld.geometry || bld.geometry.length < 3) continue;
      const shapePoints = bld.geometry.map((pt: any) => project(pt.lat, pt.lon));
      if (!shapePoints[0].equals(shapePoints[shapePoints.length - 1])) {
        shapePoints.push(shapePoints[0]);
      }
      const shape = new THREE.Shape(shapePoints);
      
      let height = parseFloat(bld.tags?.height || "");
      const levels = parseFloat(bld.tags?.["building:levels"] || "");
      if (isNaN(height)) height = isNaN(levels) ? Math.random() * 8 + 6 : levels * 3;
      
      const isCommercial = bld.tags?.amenity || bld.tags?.shop;
      const color = isCommercial ? "#bfa888" : "#9da0a3";
      
      result.push({ id: bld.id, shape, depth: height, color });
    }
    return result;
  }, [buildings]);

  const roadLines = useMemo(() => {
    return roads.map(road => {
      const points = road.geometry.map((pt: any) => {
        const v = project(pt.lat, pt.lon);
        return new THREE.Vector3(v.x, 0.2, -v.y);
      });
      return points;
    });
  }, [roads]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#87CEEB" }}>
      {loading && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, background: "rgba(255,255,255,0.9)", padding: "12px 24px", borderRadius: 8, fontWeight: 800 }}>
          Generating 3D City...
        </div>
      )}
      <Canvas camera={{ position: [0, 400, 600], fov: 60, near: 0.1, far: 10000 }}>
        <ambientLight intensity={Math.PI * 0.8} />
        <directionalLight position={[100, 200, 50]} intensity={Math.PI * 0.6} castShadow />
        
        {buildingMeshes.map(b => (
          <Building key={b.id} shape={b.shape} depth={b.depth} color={b.color} />
        ))}
        
        {roadLines.map((pts, i) => (
          <Line key={i} points={pts} color="#444" lineWidth={1.5} />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[10000, 10000]} />
          <meshStandardMaterial color="#e8dfce" />
        </mesh>

        {places.map(place => {
          const [lng, lat] = place.geometry.coordinates;
          const pt = project(lat, lng);
          const isSelected = activePlace?.properties.id === place.properties.id;
          return (
            <Html key={place.properties.id} position={[pt.x, 15, -pt.y]} center zIndexRange={[100, 0]}>
              <button 
                onClick={() => onPlaceSelect(place)}
                style={{ 
                  background: isSelected ? "#e5b824" : "#c4703d",
                  color: "#fff",
                  border: "2px solid #fff",
                  borderRadius: "999px",
                  padding: "4px 8px",
                  fontWeight: 800,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transform: isSelected ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.2s"
                }}
              >
                {place.properties.name}
              </button>
            </Html>
          );
        })}

        <MapControls maxPolarAngle={Math.PI / 2.1} minDistance={50} maxDistance={2000} target={[0, 0, 0]} />
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
