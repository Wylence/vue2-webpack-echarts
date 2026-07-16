<template>
  <ExhibitionDashboard />
</template>

<script>
import ExhibitionDashboard from './components/ExhibitionDashboard.vue';

export default {
  name: 'App',
  components: {
    ExhibitionDashboard
  }
};
</script>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #020817;
  font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

button,
input {
  font-family: inherit;
}
</style>
