const axios = require('axios')
const cheerio = require('cheerio')
const produtos = require('./produtos')
const createProduto = require('./produtos').createProduto
const path = require('path')
var blocked_keys = require("../../configs.json").blocked_keys
const fs = require('fs')
const puppeteer = require('puppeteer')
const path_to_chrome = require("../../configs.json").path_to_chrome

async function createBrowser(){
    let browser = await puppeteer.launch({
        headless: false,
        args: [`--window-size=800,800`, "--window-position=-1000,0","--disable-extensions"],
        executablePath:path_to_chrome
    })
    return browser;
}


async function makeRequest(url) {
    return await axios.default.get(url);
}

exports.scrapKabumProducts = async (search_text) => {
    let url = `https://www.kabum.com.br/cgi-local/site/listagem/listagem.cgi?int_banner_name=SocialMiner&int_banner_creative=bounce&smid=4-10&string=${search_text}&btnG=`
    let html = (await makeRequest(url)).data
    const var_name_products = 'const listagemDados'
    const rule = /listagemDados = (\[.*?\])/
    let $ = cheerio.load(html)
    let varJS = $('script')
    let lista_produtos_formatados = []
    varJS.each((i, e) => {
        let scrip_text = $(e).html()
        if (scrip_text.includes(var_name_products)) {
            let lista_produtos_kabum = JSON.parse(scrip_text.match(rule)[0].split('=')[1])
            lista_produtos_kabum.forEach((product_k) => {
                lista_produtos_formatados.push(
                    produtos.createProduto({
                        nome: product_k.nome,
                        preco_vista: product_k.preco_desconto,
                        preco_prazo: product_k.preco,
                        loja: 'kabum',
                        link: `https://www.kabum.com.br${product_k.link_descricao}`,
                        disponivel: product_k.disponibilidade,
                        img: product_k.img,
                        ean: ''
                    })
                )
            })
        }
    })
   // lista_produtos_formatados = lista_produtos_formatados.filter((e) => e.disponivel)
    return {
        'nome_loja': 'kabum',
        'img': 'https://static.kabum.com.br/conteudo/temas/001/imagens/topo/logo_kabum_mobile.svg',
        'color': '#FFFFFF',
        'link': url,
        'produtos': lista_produtos_formatados.splice(0, 10).map((product) => {
            product.preco_vista = "R$ "+ product.preco_vista.toFixed(2)
            product.preco_prazo = "R$ " + product.preco_prazo.toFixed(2)+"\n verificar parcelas no site"
            return product
        }).filter((product) => {
            return filterKabum(product,search_text)
        })
    }
}
exports.scrapTerabyteProducts = async (search_text) => {
    let url = `https://www.terabyteshop.com.br/busca?str=${search_text}`
    let browser = await createBrowser()
    let page = (await browser.pages())[0]
    await page.goto(url)
    await page.waitForSelector('#prodarea')
    let $ = cheerio.load(await page.content())
   
    let lista_produtos_formatados = []
    let prods = $('#prodarea>div')

    prods.each((i, p) => {
        if (prods.length == i + 1) return;
        let div_p = $(p)
        lista_produtos_formatados.push(
            createProduto({
                img: div_p.find('img').attr('src'),
                nome: div_p.find('.prod-name').attr('title'),
                link: div_p.find('.prod-name').attr('href'),
                preco_vista: div_p.find('.prod-new-price>span').text(),
                preco_prazo: div_p.find('.prod-juros').text().trim(),
                loja: 'terabyte',
                ean: '',
                disponivel: div_p.find('.btn-group').text().trim() == 'Comprar' ? true : false
            })
        )
    })
    await browser.close()
    return {
        'nome_loja': 'terabyte',
        'img': 'https://img.terabyteshop.com.br/header-logo.png',
        'color': '#2D2D2D',
        'link': url,
        'produtos': lista_produtos_formatados.splice(0, 10).filter((product) => {
            return filterTerabyte(product,search_text)
        })
    }
}
exports.scrapPichauProducts = async (search_text) => {
    let url = 'https://www.pichau.com.br/catalogsearch/result/?q='+search_text
    let html = (await makeRequest(url)).data
    let $ = cheerio.load(html)
    const var_name_products = 'var dlObjects'
    const rule = /dlObjects = .*\];/gi
    let lista_produtos_formatados = []
    let scripts = $('script')
    $('.products>li.item').each((i, p) => {
        let div_p = $(p)
        lista_produtos_formatados.push(
            createProduto({
                disponivel: true,
                img: div_p.find('.product-image-photo').attr('src'),
                link: div_p.find('a').attr('href'),
                loja: 'pichau',
                nome: div_p.find('.product-item-link').text().trim(),
                preco_prazo: div_p.find('.price-installments>span').text(),
                preco_vista: div_p.find('.price-boleto>span').text().trim(),
                ean: 'ean'

            })
        )
    })
    /*
    codigo para pegar valores diretos das variaveis, MASSSS nas tags estão mais faceis de se acessar
    scripts.each((i, s) => {
        let script_text = $(s).html()
        if (script_text.includes(var_name_products)) {
            
            let dlbObjects = script_text.match(rule)[0]
            dlbObjects= dlbObjects.slice(0,dlbObjects.length-1)
            dlbObjects = JSON.parse(dlbObjects.split('=')[1])
          
            dlbObjects[0].ecommerce.impressions.forEach((p) => {
         
            })
         
          
        }
    })*/
  
    return {
        'link': url,
        'nome_loja': 'pichau',
        'img': 'https://media.pichau.com.br/media/logo/websites/1/logo-pichau.png',
        'color': '#032950',
        'produtos': lista_produtos_formatados.splice(0, 10).filter((product) => {
            return filterPichau(product,search_text);
        }),
    }
}
function filterPichau(product,search_text) {
    let aux_product = createProduto(product);
    aux_product.nome = aux_product.nome.toLowerCase()
    let break_now = false;
    blocked_keys.forEach((key) => {
        if (aux_product.nome.includes(key)) break_now = true;
    })
    if (break_now) return false;
    return !aux_product.preco_vista.length==0 && aux_product.nome.includes(search_text.toLowerCase());
}
function filterTerabyte(product, search_text) {
    let aux_product = createProduto(product);
    let break_now = false;
    aux_product.nome = aux_product.nome.toLowerCase()
    blocked_keys.forEach((key) => {
        if (aux_product.nome.includes(key)) break_now = true;
    })
    if (break_now) return false;
    if (!aux_product.disponivel) return false;
    return true
}
function filterKabum(product, search_text){
    let aux_product = createProduto(product);
    let break_now = false;
    aux_product.nome = aux_product.nome.toLowerCase()
    blocked_keys.forEach((key) => {
        if (aux_product.nome.includes(key)) break_now = true;
    })
    if (break_now) return false;
    return aux_product.disponivel;
}