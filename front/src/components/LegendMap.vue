<template>
  <div class="legend-map">
    <div class="list">Liste</div>
    <div class="map">Carte</div>
  </div>
</template>

<style lang="scss" scoped>
.legend-map {
  width: 100vw;
  height: 100vh;
  display: flex;

  .list {
    background-color: red;
    width: 20em;
  }

  .map {
    background-color: blue;
    flex: 1;
  }
}
</style>
