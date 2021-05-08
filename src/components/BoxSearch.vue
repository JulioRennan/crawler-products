<template>
  <div class="search-container">
    <div class="search-input">
      <label for="search"> Adicione produto para pesquisa </label>
      <div class="wrapper">
        <input
          type="text"
          id="search"
          @keyup.enter="addSearch"
          v-model="attSearch"
        />
      </div>
    </div>
    <div class="search-list-container">
      <div>
        <ul class="list-pesquisa">
          <div  v-for="(search, index) in searchList" :key="index">
            {{ search }}
            <button @click="remove(index)">x</button>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      attSearch:'',
      searchList:[]
    };
  },
  

  methods: {
    remove(index) {
      this.searchList.splice(index,1)
      window.api.send("changePesquisa",{data:this.searchList,type_op:"remove",search_key:this.searchList[index]})
    },
    addSearch() {
      this.searchList.unshift(this.attSearch.trim());
      window.api.send("changePesquisa",{data:this.searchList,type_op:"add",search_key:this.attSearch})
      this.attSearch = "";
      
    },
  },
  mounted(){
        window.api.receive("attKeysPesquisa", (data) => {
            this.searchList = data;
            this.$forceUpdate();
          });
    }
};
</script>
<style>
  .search-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #051e2d;
    width: 400px;
    min-width: 400px;
    margin-right: 50px;
    max-height: 400px;
    min-height: 300px;
    border-radius: 30px;
    box-shadow: 1px 1px 4px grey;
    overflow: auto;
  }
  .search-container div{
    height: 100%;
  
  }
  .search-input label {
    font-size: 15px;
    font-weight: bold;
    color: white;
  }
  .search-input {
    margin-top: 20px;
    margin-bottom: 20px;
    width: 100%;
    text-align: center;
  }
  .search-input div {
    margin-top: 20px;
  }
  .search-list-container {
    display: flex;
    flex-direction: column;
    height:100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    background-color: rgb(255, 255, 255);
  }
  ul.list-pesquisa {
    display: flex;
    flex-wrap: wrap;
    
  }
  ul.list-pesquisa div {
    margin: 1px;
    padding: 5px;
    width: fit-content;
    border-radius: 10px;
    font-weight: bold;
    background-color: rgb(250, 250, 250);
  }
  ul.list-pesquisa button {
    margin-left: 10px;
    margin-bottom: 10px;
    border: none;
    background-color: transparent;
    font-size: 12px;
    font-weight: bold;
    color: rgb(175, 4, 4);
  }
  .search-list-container div {
    height: 90%;
    width: 90%;
    border: 0.5px solid rgb(214, 206, 206);
  }
  .search-input input {
    box-shadow: none;
    padding-right: 15px;
    padding-left: 10px;
    font-size: 16px;
    border: 0 none;
    outline: 0;
    background-color: rgb(255, 255, 255);
    border-radius: 20px;
    width: 80%;
    height: 50px;
    transition-timing-function: linear;
    transition-property: border;
    transition: 2s;
  }
  input:focus {
    border-radius: 0px;
    background-color: rgb(255, 255, 255);
    color: rgb(46, 25, 25);
    font-weight: bold;
    box-shadow: 1px 1px 2px rgb(182, 182, 182);
  }
</style>