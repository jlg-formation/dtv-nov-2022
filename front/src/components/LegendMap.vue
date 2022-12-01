<script lang="ts" setup>
import type { ExplorerSegment } from "@/interfaces/ExplorerSegment";
import { getCurrentPosition, getStravaBoundsFromLeafletBounds } from "@/misc";
import L from "leaflet";
import { onMounted, ref } from "vue";
import polyline from "@mapbox/polyline";

const el = ref();
const explorerSegments = ref<ExplorerSegment[]>([]);

onMounted(async () => {
  let location: L.LatLngExpression = [45, 0];
  try {
    const pos = await getCurrentPosition();
    console.log("pos: ", pos);
    location = [pos.coords.latitude, pos.coords.longitude];
  } catch (err) {
    console.log("err: ", err);
  }

  const map = L.map(el.value).setView(location, 13);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
      maxZoom: 16,
    }
  ).addTo(map);

  const segmentMap = new Map<number, ExplorerSegment>();
  const group = L.layerGroup([]);
  group.addTo(map);

  const getSegments = async () => {
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
      segmentMap.set(s.id, s);
    }

    group.clearLayers();

    for (const s of segmentMap.values()) {
      const segmentPolyline = polyline.decode(s.points);
      group.addLayer(L.polyline(segmentPolyline, { color: "green" }));
    }
    explorerSegments.value = [...segmentMap.values()];
  };

  await getSegments();

  map.on("moveend", async () => {
    await getSegments();
  });
});
</script>

<template>
  <div class="legend-map">
    <div class="list">
      <div class="segment" v-for="s in explorerSegments" :key="s.id">
        Nom: {{ s.name }}
      </div>
    </div>
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
    height: 100vh;
    overflow-y: scroll;
  }

  .map {
    flex: 1;
  }
}
</style>
