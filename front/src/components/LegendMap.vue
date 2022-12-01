<script lang="ts" setup>
import { getStravaBoundsFromLeafletBounds } from "@/misc";
import L from "leaflet";
import { onMounted, ref } from "vue";

const el = ref();

onMounted(async () => {
  const map = L.map(el.value).setView(
    [48.896898068574274, 2.0921415972909467],
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
