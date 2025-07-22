"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { dataProvinsi } from "../data/dataProvinsi";

export default function Map() {
  useEffect(() => {
    // Import Leaflet only on the client
    import("leaflet").then((L) => {
      const map = L.default.map("map").setView([-2.5, 118], 5);

      L.default
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(map);

      fetch("/indonesia-prov.geojson")
        .then((res) => res.json())
        .then((geoData) => {
          const getProvinsiData = (namaProvinsi: string) => {
            return dataProvinsi.find(
              (d) =>
                d.provinsi.trim().toUpperCase() ===
                namaProvinsi.trim().toUpperCase()
            );
          };

          const getColor = (klaster: number) => {
            switch (klaster) {
              case 0:
                return "#111";
              case 1:
                return "red";
              case 2:
                return "yellow";
              case 3:
                return "green";
              default:
                return "#ccc";
            }
          };

          const style = (feature: any) => {
            const data = getProvinsiData(
              feature.properties.Propinsi || feature.properties.provinsi
            );
            const klaster = data?.klaster;
            return {
              fillColor: getColor(klaster || 0),
              weight: 1,
              opacity: 1,
              color: "grey",
              fillOpacity: 0.8,
            };
          };

          const onEachFeature = (feature: any, layer: any) => {
            const data = getProvinsiData(
              feature.properties.Propinsi || feature.properties.provinsi
            );

            if (data) {
              const popupContent = `
                <div style="font-family:sans-serif;">
                  <strong>${data.provinsi}</strong><br />
                  Klaster: ${data.klaster}<br />
                  Belanja Modal: ${data.belanja_modal.toLocaleString()} Milyar<br />
                  Belanja Subsidi: ${data.belanja_subsidi.toLocaleString()} Milyar<br />
                  Belanja Bantuan Sosial: ${data.belanja_bantuan_sosial.toLocaleString()} Milyar
                </div>
              `;
              layer.bindPopup(popupContent);
            } else {
              layer.bindPopup(
                `<strong>${feature.properties.Propinsi}</strong><br />Data tidak tersedia`
              );
            }
          };

          L.default
            .geoJSON(geoData, {
              style,
              onEachFeature,
            })
            .addTo(map);
        });
    });
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
