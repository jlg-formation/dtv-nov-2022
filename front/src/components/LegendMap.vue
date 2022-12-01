<script lang="ts" setup>
import type { ExplorerSegment } from "@/interfaces/ExplorerSegment";
import { getCurrentPosition, getStravaBoundsFromLeafletBounds } from "@/misc";
import L from "leaflet";
import { onMounted, ref } from "vue";
import polyline from "@mapbox/polyline";

const el = ref();

onMounted(async () => {
  const pos = await getCurrentPosition();
  console.log("pos: ", pos);

  const map = L.map(el.value).setView(
    [pos.coords.latitude, pos.coords.longitude],
    13
  );

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
      maxZoom: 16,
    }
  ).addTo(map);

  const bounds = map.getBounds();
  const stravaBounds = getStravaBoundsFromLeafletBounds(bounds);

  const response = await fetch(
    `/api/strava/segments/explore?bounds=${stravaBounds}`
  );
  console.log("response: ", response);
  const json = await response.json();
  console.log("json: ", json);
  const segments: ExplorerSegment[] = json.segments;

  for (const s of segments) {
    console.log("s: ", s);
    const segmentPolyline = polyline.decode(s.points);
    L.polyline(segmentPolyline, { color: "green" }).addTo(map);
  }
});
</script>

<template>
  <div class="legend-map">
    <div class="list"></div>
    <div class="map" ref="el"></div>
  </div>
</template>

<style lang="scss" scoped>
.legend-map {
  width: 100vw;
  height: 100vh;
  display: flex;

  .list {
    background-color: #eee;
    width: 20em;
  }

  .map {
    flex: 1;
  }
}
</style>
