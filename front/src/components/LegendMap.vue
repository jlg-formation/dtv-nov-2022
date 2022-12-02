<script lang="ts" setup>
import type { DetailedSegment } from "@/interfaces/DetailedSegment";
import {
  capitalizeFirstLetter,
  getCurrentPosition,
  getStravaBoundsFromLeafletBounds,
  remainingEffort,
} from "@/misc";
import polyline from "@mapbox/polyline";
import L from "leaflet";
import { onMounted, ref, watch } from "vue";

const el = ref();
const detailedSegments = ref<DetailedSegment[]>([]);
const selectedSegment = ref<DetailedSegment | undefined>(undefined);
const group = L.layerGroup([]);
const refMap = ref<L.Map | undefined>(undefined);

const redraw = () => {
  group.clearLayers();

  for (const s of detailedSegments.value) {
    let color = "hsla(0, 0%, 70%, 1)";
    if (
      selectedSegment.value !== undefined &&
      selectedSegment.value.id === s.id
    ) {
      color = "hsla(120, 100%, 25%, 1)";
    }
    if (selectedSegment.value === undefined) {
      color = "hsla(120, 100%, 25%, 1)";
    }

    const segmentPolyline = polyline.decode(s.map.polyline);
    const visiblePolyline = L.polyline(segmentPolyline, { color: color });
    const clickablePolyline = L.polyline(segmentPolyline, {
      color: "transparent",
      weight: 20,
    });
    clickablePolyline.on("click", (...args) => {
      console.log("polyline click args: ", args);
      selectSegment(s, false);
      const parent = document.querySelector(".list") as HTMLElement;
      console.log("parent: ", parent);
      const elt = document.querySelector("#segment-" + s.id) as HTMLElement;
      console.log("elt: ", elt);
      parent.scrollBy({
        top: elt.getBoundingClientRect().top,
        behavior: "smooth",
      });
    });
    group.addLayer(visiblePolyline);
    group.addLayer(clickablePolyline);
  }
};

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
  refMap.value = map;

  L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  const segmentMap = new Map<number, DetailedSegment>();

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
    const segments: DetailedSegment[] = json;

    for (const s of segments) {
      segmentMap.set(s.id, s);
    }

    detailedSegments.value = [...segmentMap.values()].sort((a, b) => {
      return Math.sign(remainingEffort(a) - remainingEffort(b));
    });

    redraw();
  };

  await getSegments();

  map.on("moveend", async () => {
    if (selectedSegment.value !== undefined) {
      return;
    }
    await getSegments();
  });
});

const selectSegment = (s: DetailedSegment, rezoom = true) => {
  if (selectedSegment.value?.id === s.id) {
    selectedSegment.value = undefined;
    return;
  }
  selectedSegment.value = s;

  if (rezoom) {
    refMap.value?.setView(selectedSegment.value.start_latlng);
  }
};

watch(selectedSegment, async () => {
  redraw();
});
</script>

<template>
  <div class="legend-map">
    <div class="list">
      <div
        class="segment"
        v-for="s in detailedSegments"
        :key="s.id"
        @click="selectSegment(s)"
        :class="{ selected: s === selectedSegment }"
        :id="'segment-' + s.id"
      >
        <div class="first">
          <div class="name">{{ capitalizeFirstLetter(s.name) }}</div>
          <div class="legend" v-if="s.local_legend">
            Légende : {{ s.local_legend?.title }} ({{
              (+s.local_legend?.effort_count).toLocaleString("fr-FR")
            }}
            x {{ s.distance.toLocaleString("fr-FR") }} m)
          </div>
          <div class="legend" v-else>
            Pas de Légende : (0 x
            {{ s.distance.toLocaleString("fr-FR") }} m)
          </div>
        </div>
        <div class="second">
          <div class="label">Effort à faire :</div>
          <div class="value">
            {{ remainingEffort(s).toLocaleString("fr-FR") }}
            m
          </div>
        </div>
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
    position: relative;
    width: 25em;
    height: 100vh;
    overflow-y: scroll;
    padding: 0;

    .segment {
      position: relative;
      cursor: pointer;
      padding: 0;
      border: 0.04em solid transparent;

      &:nth-child(even) {
        background-color: hsla(0, 0%, 96%, 1);
      }

      &:hover {
        background-color: #ddd;
      }

      &.selected {
        z-index: 1;
        box-shadow: 3px 4px 4px 5px rgba(0, 0, 0, 0.1);
        background-color: hsla(120, 100%, 10%, 0.2);
        border-color: black;
      }

      display: flex;
      justify-content: space-between;

      .first {
        max-width: 20em;
        display: flex;
        flex-flow: column;
        padding: 0.5em;
        .name {
          font-weight: bold;
          font-size: 1.2em;
        }
        .legend {
          font-size: 0.8em;
        }
      }

      .second {
        margin: 0.3em;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        gap: 0.5em;
        border: 0.05em solid green;
        min-width: 5em;
        .label {
          font-size: 0.7em;
        }
        .value {
          color: green;
          font-weight: bold;
        }
      }
    }
  }

  .map {
    flex: 1;
  }
}
</style>
