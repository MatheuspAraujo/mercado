// Este script não é mais necessário para a busca de produtos, pois agora estamos usando a API do Carrefour.
// Ele pode ser mantido para simular dados de ofertas ou para um backend de administração.

console.log("O script 'seed-database.js' não é mais o principal para a busca de produtos.")
console.log("A busca agora é feita através da API do Carrefour.")
console.log("Este script pode ser usado para popular dados de ofertas ou para um backend de administração.")

// Exemplo de como você poderia usar este script para gerar dados para um banco de dados interno,
// caso decida ter um cache ou um sistema de ofertas próprio.
const products = [
  // Laticínios
  {
    category: "Laticínios",
    items: [
      {
        name: "Leite Integral Parmalat 1L",
        stores: [
          { store: "Carrefour", price: 4.99, originalPrice: 5.49, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 5.29, location: "São Paulo - SP" },
          { store: "Extra", price: 4.79, originalPrice: 5.99, location: "São Paulo - SP" },
          { store: "Walmart", price: 5.15, location: "São Paulo - SP" },
        ],
      },
      {
        name: "Iogurte Natural Danone 170g",
        stores: [
          { store: "Carrefour", price: 2.99, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 3.19, originalPrice: 3.49, location: "São Paulo - SP" },
          { store: "Extra", price: 2.89, location: "São Paulo - SP" },
        ],
      },
    ],
  },

  // Grãos e Cereais
  {
    category: "Grãos e Cereais",
    items: [
      {
        name: "Arroz Tio João 5kg",
        stores: [
          { store: "Carrefour", price: 18.99, originalPrice: 22.99, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 19.49, location: "São Paulo - SP" },
          { store: "Extra", price: 18.79, location: "São Paulo - SP" },
          { store: "Walmart", price: 19.99, location: "São Paulo - SP" },
        ],
      },
      {
        name: "Feijão Carioca Camil 1kg",
        stores: [
          { store: "Carrefour", price: 7.49, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 7.99, location: "São Paulo - SP" },
          { store: "Extra", price: 7.29, originalPrice: 7.99, location: "São Paulo - SP" },
        ],
      },
    ],
  },

  // Açúcar e Adoçantes
  {
    category: "Açúcar e Adoçantes",
    items: [
      {
        name: "Açúcar Cristal União 1kg",
        stores: [
          { store: "Carrefour", price: 4.19, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 4.49, location: "São Paulo - SP" },
          { store: "Extra", price: 3.99, originalPrice: 4.49, location: "São Paulo - SP" },
          { store: "Walmart", price: 4.29, location: "São Paulo - SP" },
        ],
      },
    ],
  },

  // Óleos e Gorduras
  {
    category: "Óleos e Gorduras",
    items: [
      {
        name: "Óleo de Soja Soya 900ml",
        stores: [
          { store: "Carrefour", price: 4.29, originalPrice: 4.99, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 4.79, location: "São Paulo - SP" },
          { store: "Extra", price: 4.39, location: "São Paulo - SP" },
        ],
      },
    ],
  },

  // Massas
  {
    category: "Massas",
    items: [
      {
        name: "Macarrão Espaguete Barilla 500g",
        stores: [
          { store: "Carrefour", price: 5.29, location: "São Paulo - SP" },
          { store: "Pão de Açúcar", price: 5.49, location: "São Paulo - SP" },
          { store: "Extra", price: 4.99, originalPrice: 5.79, location: "São Paulo - SP" },
        ],
      },
    ],
  },
]

// Função para calcular desconto
function calculateDiscount(originalPrice, currentPrice) {
  if (!originalPrice) return null
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

// Função para gerar dados estruturados
function generateProductData() {
  const allProducts = []
  let id = 1

  products.forEach((category) => {
    category.items.forEach((item) => {
      item.stores.forEach((store) => {
        const discount = calculateDiscount(store.originalPrice, store.price)

        allProducts.push({
          id: id.toString(),
          name: item.name,
          price: store.price,
          originalPrice: store.originalPrice,
          store: store.store,
          image: "/placeholder.svg?height=100&width=100",
          location: store.location,
          discount: discount,
          category: category.category,
        })

        id++
      })
    })
  })

  return allProducts
}

// Exportar dados para uso na aplicação
const generatedProducts = generateProductData()

console.log("Dados de produtos gerados (para referência ou uso em ofertas mockadas):")
console.log(`Total de produtos: ${generatedProducts.length}`)
console.log("Categorias disponíveis:", [...new Set(generatedProducts.map((p) => p.category))])
console.log("Lojas disponíveis:", [...new Set(generatedProducts.map((p) => p.store))])

// Simular salvamento em banco de dados
console.log("Dados salvos com sucesso!")

module.exports = { products: generatedProducts, generateProductData }
