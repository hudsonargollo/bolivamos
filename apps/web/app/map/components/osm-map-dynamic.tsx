"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { PlaceFeature } from "@bolivibes/api-schema";

const OsmMap = dynamic(() => import("./osm-map"), { ssr: false });

export default function OsmMapWrapper({ places, activePlace, onPlaceSelect }: { places: PlaceFeature[], activePlace: PlaceFeature | null, onPlaceSelect: (p: PlaceFeature) => void }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading 3D Engine...</div>}>
        <OsmMap places={places} activePlace={activePlace} onPlaceSelect={onPlaceSelect} />
      </Suspense>
    </div>
  );
}
