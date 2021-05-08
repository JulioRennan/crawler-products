<template>
  <main>
    <box-search />
    <group-lojas />
  </main>
</template>
<script>
import BoxSearch from "./components/BoxSearch";
import GroupLojas from "./components/GroupLojas";
export default {
  name: "App",
  components: {
    BoxSearch,
    GroupLojas,
  },
  mounted(){
    //colocar metodos que precisam ser chamados em todos os widgets
     window.api.send("init");
  }
};
</script>
<style>
body {
  display: block;
  padding: 20px;
}
main {
  min-height: 500px;
  display: flex;
  flex-direction: row;
}
@media only screen and (max-width: 780px) {
  main {
    flex-wrap: wrap;
    justify-content: center;
  }
  .all-container {
    margin-top: 30px;
  }
}
</style>