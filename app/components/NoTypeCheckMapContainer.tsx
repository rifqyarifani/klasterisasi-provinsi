"use client";
import dynamic from "next/dynamic";
import { MapContainerProps, TileLayerProps, GeoJSONProps } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

export function NoTypeCheckMapContainer(props: MapContainerProps) {
  return <MapContainer {...props} />;
}
export function NoTypeCheckTileLayer(props: TileLayerProps) {
  return <TileLayer {...props} />;
}
export function NoTypeCheckGeoJSON(props: GeoJSONProps) {
  return <GeoJSON {...props} />;
}
