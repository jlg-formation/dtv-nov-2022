<script lang="ts" setup>
import L from "leaflet";
import { onMounted, ref } from "vue";

const el = ref();

onMounted(async () => {
  const map = L.map(el.value).setView([51.505, -0.09], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
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
