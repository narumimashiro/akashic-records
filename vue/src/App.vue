<template>
  <div id="app">
    <nav-bar />
    <router-view/>
  </div>
</template>

<script lang="ts">
import NavBar from '@/components/layouts/NavBar.vue';

export default {
  components: {
    NavBar,
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0 2rem;
  text-align: center;
  color: #502c2c;
}

body {
  background-color: #fdeeef;
}
</style>
