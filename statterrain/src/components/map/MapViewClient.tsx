"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { MapView as MapViewType } from "./MapView";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

type Props = ComponentProps<typeof MapViewType>;

export function MapViewClient(props: Props) {
  return <MapView {...props} />;
}
