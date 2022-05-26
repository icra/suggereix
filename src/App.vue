<template>
  <div id="app">
    <div style="height: auto; margin-bottom: 1rem">
      <img src="img/logos.png" alt="collaborators" style="width: auto; height: 100px; display: inline-block; vertical-align: middle">
    </div>
    <hr class="rounded">
    <div style="height: auto; margin: 1rem 0rem 2rem 0rem">
      <img src="img/logo_suggereix.png" alt="Suggereix" style="width: 250px; height: auto; display: inline-block; vertical-align: middle">
      <h2 style="display: inline-block; margin: 0rem 0rem 0rem 1rem; vertical-align: middle">
        Sistema d'ajuda a la decisió per a la implementació i gestió de la reutilització (v1.3.1)
      </h2>
    </div>
    <HelloWorld/>
  </div>
</template>

<script>
import HelloWorld from './components/Sad.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 20px;
}

hr.rounded {
  border-top: 5px solid #bbb;
  border-radius: 3px;
}
</style>
