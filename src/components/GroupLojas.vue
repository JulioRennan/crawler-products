<template>
  <div class="all-container">
    <div
      class="container-product"
      v-for="(arrayLojas, search) in objectLojas"
      :key="search"
    >
      <div class="container-titulo">
        <span>
          {{ search }}
          <br>
        ({{ new Date().toLocaleString()}})
        </span>
      </div>
      <ul class="card-loja">
        <li
          v-for="(loja, indexLoja) in arrayLojas"
          :key="indexLoja"
          class="card-loja"
        >
          <div class="item" >
            <div class="img-loja" :style="{ backgroundColor: loja.color }" @click="openLink(loja.link)">
              <img :src="loja.img" :alt="loja.nome_loja" />
            </div>
            <ul class="product-loja">
              <div v-if="loja.produtos.length == 0" class="empty">
                <img
                  src="../assets/carrinho_vazio.png"
                  alt=""
                  style="color: white"
                />
                Seu está vazio, quando tiver algo você será notificado no
                telegram
              </div>
              <li
                v-for="(product, indexProduto) in loja.produtos"
                :key="indexProduto"
                class="product-item-loja"
                @click="openLink(product.link)"
              >
                <div class="product-item-card">
                  <img :src="product.img" class="product-item-loja-img" />
                  <div class="divider-vertical"></div>
                  <div class="product-item-info">
                    <div class="product-item-name">
                      {{ product.nome }}
                    </div>
                    <div class="prices">
                      <div class="price-vista">
                        {{ product.preco_prazo }}
                      </div>
                      <div class="price-prazo">
                        {{ product.preco_vista }}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      objectLojas: {},
      first: true,
    };
  },
  methods: {
    openLink(link) {
      window.api.send("openLink", link);
    },
  },
  mounted() {
    window.api.receive("attPesquisa", (data) => {
      let message = `Temos atualizações sobre o produto <b>${data.search}</b> nas lojas\n`;
      let bool_send_message = false;
      if (this.objectLojas[data.search]==undefined) {
        this.objectLojas[data.search] = data.lista;
      } else {
        this.objectLojas[data.search].forEach((node_loja) => {
          data.lista.forEach((aux_node_loja) => {
            if (aux_node_loja.nome_loja == node_loja.nome_loja) {
              if (JSON.stringify(node_loja) != JSON.stringify(aux_node_loja)) {
                console.log("testando notificacao")
                console.log(aux_node_loja.nome_loja)
                console.log(aux_node_loja.link)
                console.log(data.search)
                message += `<a href="${encodeURI(aux_node_loja.link)}"> ${aux_node_loja.nome_loja} </a>\n-------------------------------------\n`;
                bool_send_message = true;
              }
            }
          });
        });
        console.log("mensagem\n"+message)
        if (bool_send_message == true) {
            window.api.send("sendTelegram", "<b>ATENÇÃO !!!</b>")
            window.api.send("sendTelegram", message);
        }
        this.objectLojas[data.search] = data.lista;
        this.$forceUpdate();
      }
    });
    window.api.receive("attKeysPesquisa", (list_pesquisa) => {
      if (list_pesquisa.length == 0) {
        this.objectLojas = {};
        return;
      }
      
      Object.keys(this.objectLojas).forEach((key) => {
        if (!list_pesquisa.includes(key)) {
          delete this.objectLojas[key];
        }
      });
      this.$forceUpdate();
    });
  },
};
</script>

<style>
body {
  display: block;
  padding: 20px;
}
.all-container {
  width: 1000px;
}
.empty {
  display: flex;

  flex-direction: column;
  height: 100%;
  justify-content: center;

  align-items: center;
  font-size: 20px;
  color: #ffffff;
}
.container-product {
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  margin-bottom: 20px;
  min-width: 350;
  box-shadow: 5px 5px 8px rgb(109, 106, 106);
  background-color: #051e2d;
  max-height: 550px;
}
.container-titulo {
  text-align: center;
  background-color: white;
  border-radius: 20px;
  margin-right: 20px;
  margin-left: 20px;

  padding: 10px;
  margin-bottom: 20px;
}
.row {
  display: block;
  width: 950px;
  overflow: auto;
}

ul {
  padding: 10px;
  text-align: center;
}
ul.card-loja {
  overflow-y: hidden;
  overflow-x: scroll;
}
li.card-loja {
  display: inline-block;
}
::-webkit-scrollbar-track {
  background-color: #ffffff;
}
::-webkit-scrollbar {
  width: 6px;
  background: #f4f4f4;
}
::-webkit-scrollbar-thumb {
  background: #b0afb7;
}
ul.product-loja {
  margin-top: auto;
  margin-bottom: auto;
  background-color: rgb(56, 110, 156);
  height: 300px;
}
.container-product ul {
  overflow: auto;
}

.product-item-name {
  margin-top: 5px;
  margin-right: 5px;
  font-size: 13px;
  font-weight: bold;
  color: rgb(19, 8, 122);
  height: 60%;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-height: 16px; /* fallback */
  max-height: 48px; /* fallback */
  -webkit-line-clamp: 3; /* number of lines to show */
  -webkit-box-orient: vertical;
}
.product-item-loja-img {
  padding: 5px;
  width: 95px;
  object-fit: contain;
  border: solid 0.5px rgb(206, 202, 202);
  box-shadow: 1px 1px 1px black;
}
.product-item-card {
  height: 100%;
  display: flex;
  align-items: center;
}
.product-item-preco-vista {
}
.product-item-info {
  margin: 3px;
  height: 100%;
}
.price-vista {
  margin-top: 4px;
  font-size: 12px;

  color: rgb(12, 95, 40);
  font-weight: bold;
}
.prices {
  margin-left: 10px;
  text-align: left;
}
.price-prazo {
  font-size: 15px;

  color: rgb(148, 8, 8);
  font-weight: bold;
}
a {
  text-decoration: none;
}
.divider-vertical {
  background-color: black;
  height: 80%;
  width: 1px;
}
li.product-item-loja {
  background-color: white;
  display: block;
  margin-bottom: 10px;
  border-radius: 10px;
}
li {
  display: inline-block;
  height: 120px;
}
.item {
  overflow: hidden;
  width: 300px;
  height: 400px;
  background-color: rgb(255, 255, 255);
  margin-left: 10px;
  margin-bottom: 10px;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
}
.img-loja {
  display: flex;
  justify-content: center;
  align-items: center;
  align-items: center;
  width: 300px;
  height: 80px;
  border-radius: 10px;
  box-shadow: 1px 1px 6px rgb(139, 139, 139);
}
img {
  margin: 10px;
  width: 150px;
}
.container-titulo > span {
  font-size: 30px;
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