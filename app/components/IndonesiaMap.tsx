"use client";

import { useEffect } from "react";
import type L from "leaflet";
import type { Feature } from "geojson";
import "leaflet/dist/leaflet.css";
import dataFix from "../data/dataFix.json";

// Define the data structure type
interface ProvinsiData {
  nama_provinsi: string;
  belanja_pegawai: number;
  belanja_barang_dan_jasa: number;
  belanja_modal: number;
  belanja_bagi_hasil: number;
  belanja_bantuan_keuangan: number;
  belanja_subsidi: number;
  belanja_hibah: number;
  belanja_bantuan_sosial: number;
  penduduk_miskin: number;
  ipm_2024: number;
  tingkat_pengangguran: number;
  laju_pertumbuhan_pdrb: number;
  pdrb_per_kapita: number;
  rasio_gini_2024: number;
  jumlah_penduduk: number;
  klaster: string;
  provinsi: string;
}

export default function Map() {
  useEffect(() => {
    // Import Leaflet only on the client
    import("leaflet").then((L) => {
      const map = L.default
        .map("map", {
          zoomSnap: 0,
          wheelPxPerZoomLevel: 1,
          minZoom: 5.4,
          maxZoom: 12,
        })
        .setView([-2.5, 118], 5.4);
      // Set max bounds to Indonesia territory
      const indonesiaBounds = L.default.latLngBounds(
        [-11.5, 90.9], // Southwest
        [6.2, 145.1] // Northeast
      );
      map.setMaxBounds(indonesiaBounds);
      map.on("drag", function () {
        map.panInsideBounds(indonesiaBounds, { animate: false });
      });

      L.default
        .tileLayer(
          "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmlmcXlhcmlmYW5pIiwiYSI6ImNtZTU0aWFmMzBmZjUyaXNhd2p0dWlmMnkifQ.m7e4p6Zp85O3aS1Ar3QX-A",
          {
            attribution: "© Mapbox © OpenStreetMap",
            tileSize: 512,
            zoomOffset: -1,
          }
        )
        .addTo(map);

      fetch("/indonesia-prov.geojson")
        .then((res) => res.json())
        .then((geoData) => {
          const getProvinsiData = (namaProvinsi: string) => {
            return dataFix.find(
              (d: ProvinsiData) =>
                d.provinsi.trim().toUpperCase() ===
                namaProvinsi.trim().toUpperCase()
            );
          };

          const getColor = (klaster: string) => {
            switch (klaster) {
              case "Capaian Rendah":
                return "red";
              case "Capaian Menengah":
                return "yellow";
              case "Capaian Tinggi":
                return "green";
              default:
                return "grey";
            }
          };

          // Tooltip element for custom hover info
          let tooltipDiv: HTMLDivElement | null = null;

          const defaultStyle = {
            weight: 1,
            opacity: 1,
            color: "grey",
            fillOpacity: 0.8,
          };

          // Instead of border highlight, use a darker fill opacity
          const highlightStyle = {
            weight: 3,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.5,
          };

          const style = (feature: Feature) => {
            const props = feature.properties ?? {};
            const data = getProvinsiData(props.Propinsi || props.provinsi);
            const klaster = data?.klaster;
            return {
              fillColor: getColor(klaster || ""),
              ...defaultStyle,
            };
          };

          const onEachFeature = (feature: Feature, layer: L.Layer) => {
            const props = feature.properties ?? {};
            const data = getProvinsiData(props.Propinsi || props.provinsi);

            let popupContent = "";
            if (data) {
              popupContent = `
                <div style=\"font-family:sans-serif;min-width:320px;max-width:420px;\">
                  <table style=\"border-collapse:collapse;width:100%;background:#fff;\">
                    <tr style=\"background:#f7f7f7;\"><td style=\"padding:6px 10px;border:1px solid #ddd;\">Provinsi</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${
                      data.provinsi
                    }</b></td></tr>
                    <tr><td style=\"padding:6px 10px;border:1px solid #ddd;\">Klaster</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${
                      data.klaster
                    }</b></td></tr>
                    <tr style=\"background:#f7f7f7;\"><td style=\"padding:6px 10px;border:1px solid #ddd;\">Belanja Modal</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${data.belanja_modal.toLocaleString(
                      "id-ID"
                    )}</b> Milyar</td></tr>
                    <tr><td style=\"padding:6px 10px;border:1px solid #ddd;\">Belanja Subsidi</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${data.belanja_subsidi.toLocaleString(
                      "id-ID"
                    )}</b> Milyar</td></tr>
                    <tr style=\"background:#f7f7f7;\"><td style=\"padding:6px 10px;border:1px solid #ddd;\">Belanja Bantuan Sosial</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${data.belanja_bantuan_sosial.toLocaleString(
                      "id-ID"
                    )}</b> Milyar</td></tr>
                    <tr><td style=\"padding:6px 10px;border:1px solid #ddd;\">Persentase Penduduk <br>Miskin</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${data.penduduk_miskin.toLocaleString(
                      "id-ID"
                    )}</b> %</td></tr>
                    <tr style=\"background:#f7f7f7;\"><td style=\"padding:6px 10px;border:1px solid #ddd;\">Indeks Pembangunan <br>Manusia (IPM)</td><td style=\"padding:6px 10px;border:1px solid #ddd;\"><b>${data.ipm_2024.toLocaleString(
                      "id-ID"
                    )}</b></td></tr>
                  </table>
                </div>
              `;
            } else {
              popupContent = `<strong>${
                props.Propinsi || props.provinsi || "Provinsi tidak diketahui"
              }</strong><br />Data tidak tersedia`;
            }

            // Custom tooltip logic
            layer.on({
              mouseover: function () {
                (layer as L.Path).setStyle(highlightStyle);
                // Create tooltip div if not exists
                if (!tooltipDiv) {
                  tooltipDiv = document.createElement("div");
                  tooltipDiv.style.position = "fixed";
                  tooltipDiv.style.pointerEvents = "none";
                  tooltipDiv.style.background = "rgba(255,255,255,0.97)";
                  tooltipDiv.style.border = "1px solid #ccc";
                  tooltipDiv.style.borderRadius = "8px";
                  tooltipDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
                  tooltipDiv.style.padding = "12px 16px";
                  tooltipDiv.style.fontFamily = "sans-serif";
                  tooltipDiv.style.fontSize = "15px";
                  tooltipDiv.style.zIndex = "9999";
                  document.body.appendChild(tooltipDiv);
                }
                tooltipDiv.innerHTML = popupContent;
                tooltipDiv.style.display = "block";
              },
              mousemove: function (e: L.LeafletMouseEvent) {
                if (tooltipDiv) {
                  const rect = tooltipDiv.getBoundingClientRect();
                  const provinsiName = (
                    data && data.provinsi ? data.provinsi : ""
                  ).toUpperCase();
                  const showLeft = [
                    "PAPUA",
                    "PAPUA BARAT",
                    "MALUKU",
                    "MALUKU UTARA",
                    "NUSA TENGGARA TIMUR",
                  ].includes(provinsiName);
                  let x: number;
                  const y = e.originalEvent.clientY - rect.height / 2;
                  if (showLeft) {
                    // Show to the left of the cursor
                    x = e.originalEvent.clientX - rect.width - 18;
                  } else {
                    // Show to the right of the cursor
                    x = e.originalEvent.clientX + 18;
                  }
                  tooltipDiv.style.left = x + "px";
                  tooltipDiv.style.top = y + "px";
                }
              },
              mouseout: function () {
                (layer as L.Path).setStyle(style(feature));
                if (tooltipDiv) {
                  tooltipDiv.style.display = "none";
                }
              },
              click: function () {
                const bounds = (
                  layer as L.Layer & { getBounds?: () => L.LatLngBounds }
                ).getBounds;
                if (typeof bounds === "function") {
                  map.fitBounds(bounds.call(layer));
                }
              },
            });
          };

          L.default
            .geoJSON(geoData, {
              style: style as L.GeoJSONOptions["style"],
              onEachFeature,
            })
            .addTo(map);

          // Add legend control
          const LegendControl = L.default.Control.extend({
            options: { position: "bottomright" },
            onAdd: function () {
              const div = L.DomUtil.create("div", "info legend");
              div.style.background = "rgba(255,255,255,0.95)";
              div.style.padding = "10px 12px";
              div.style.borderRadius = "8px";
              div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
              div.style.fontFamily = "sans-serif";
              div.style.fontSize = "15px";
              div.style.lineHeight = "1.2";
              div.innerHTML +=
                '<div style="margin-bottom:8px;font-weight:600;">Keterangan Klaster</div>';
              const grades = [
                "Capaian Rendah",
                "Capaian Menengah",
                "Capaian Tinggi",
              ];
              const labels = [
                "Capaian Rendah",
                "Capaian Menengah",
                "Capaian Tinggi",
              ];
              for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                  '<div style="display:flex;align-items:center;margin-bottom:2px;">' +
                  '<span style="display:inline-block;width:22px;height:22px;background:' +
                  getColor(grades[i]) +
                  ';margin-right:8px;border-radius:3px;border:1px solid #ccc;"></span>' +
                  '<span style="color:#333;">' +
                  labels[i] +
                  "</span>" +
                  "</div>";
              }
              return div;
            },
          });
          const legend = new LegendControl();
          legend.addTo(map);
        });
    });
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
