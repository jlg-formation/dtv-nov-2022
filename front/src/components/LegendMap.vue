<script lang="ts" setup>
import type { DetailedSegment } from "@/interfaces/DetailedSegment";
import { getCurrentPosition, getStravaBoundsFromLeafletBounds } from "@/misc";
import polyline from "@mapbox/polyline";
import L from "leaflet";
import { onMounted, ref } from "vue";

const el = ref();
const detailedSegments = ref<DetailedSegment[]>([]);

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
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  const segmentMap = new Map<number, DetailedSegment>();
  const group = L.layerGroup([]);
  group.addTo(map);

  const getSegments = async () => {
    const bounds = map.getBounds();
    const stravaBounds = getStravaBoundsFromLeafletBounds(bounds);
    const response = await fetch(
      `/api/strava/segments/explore?bounds=${stravaBounds}`
    );
    console.log("response: ", response);
    if (response.status >= 400) {
      console.error("error while getting segments");
      return;
    }
    const json = await response.json();
    console.log("json: ", json);
    const segments: DetailedSegment[] = json;

    for (const s of segments) {
      console.log("s: ", s);
      segmentMap.set(s.id, s);
    }

    group.clearLayers();

    for (const s of segmentMap.values()) {
      const segmentPolyline = polyline.decode(s.map.polyline);
      group.addLayer(L.polyline(segmentPolyline, { color: "green" }));
    }
    detailedSegments.value = [...segmentMap.values()].sort((a, b) => {
      const d1 =
        a.distance *
        (a.local_legend?.effort_count ? +a.local_legend?.effort_count : 2);
      const d2 =
        b.distance *
        (b.local_legend?.effort_count ? +b.local_legend?.effort_count : 2);
      return Math.sign(d1 - d2);
    });
  };

  await getSegments();

  map.on("moveend", async () => {
    await getSegments();
  });
});

const selectSegment = (s: DetailedSegment) => {
  console.log("click s: ", s);
};
</script>

<template>
  <div class="legend-map">
    <div class="list">
      <div
        class="segment"
        v-for="s in detailedSegments"
        :key="s.id"
        @click="selectSegment(s)"
      >
        <span>{{ s.name }}</span>
        <span>{{ s.local_legend?.title }}</span>
        <span>{{ s.local_legend?.effort_count }}</span>
        <span>{{ s.distance }}</span>
        <span
          >Effort a faire :
          {{
            s.distance *
            (s.local_legend?.effort_count ? +s.local_legend?.effort_count : 2)
          }}</span
        >
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
    width: 20em;
    height: 100vh;
    overflow-y: scroll;
    padding: 0;

    .segment {
      cursor: pointer;
      padding: 0.5em 0.5em;

      &:nth-child(even) {
        background-color: #eee;
      }

      &:hover {
        background-color: #ddd;
      }

      display: flex;
      flex-flow: column;
    }
  }

  .map {
    flex: 1;
  }
}
</style>
