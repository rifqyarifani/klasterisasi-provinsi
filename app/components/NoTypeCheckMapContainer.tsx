"use client";
import dynamic from "next/dynamic";

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

export function NoTypeCheckMapContainer(props: any) {
  return <MapContainer {...props} />;
}
export function NoTypeCheckTileLayer(props: any) {
  return <TileLayer {...props} />;
}
export function NoTypeCheckGeoJSON(props: any) {
  return <GeoJSON {...props} />;
}
