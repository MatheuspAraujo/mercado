// Exemplo de como seria a API para o Extra (ainda não implementada)
// Você adicionaria a lógica de busca e mapeamento aqui, similar ao carrefour.ts

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  store: string
  image: string
  location: string
  discount?: number
}

export async function searchExtraProducts(query: string): Promise<Product[]> {
  // const EXTRA_API_URL = `https://api.extra.com.br/products?q=${encodeURIComponent(query)}`;
  // const storeName = "Extra";
  // try {
  //   const response = await fetch(EXTRA_API_URL);
  //   const data = await response.json();
  //   // Mapear a resposta da API do Extra para a interface Product
  //   return data.products.map((item: any) => ({
  //     id: item.id,
  //     name: item.name,
  //     price: item.price,
  //     store: storeName,
  //     image: item.imageUrl,
  //     location: "São Paulo - SP",
  //     // Calcular desconto se houver originalPrice
  //   }));
  // } catch (error) {
  //   console.error("Erro na requisição da API do Extra:", error);
  //   return [];
  // }

  // Retornando mock data por enquanto
  await new Promise((resolve) => setTimeout(resolve, 300))
  const mockData: Product[] = [
    {
      id: "extra-1",
      name: "Leite Integral Italac 1L",
      price: 4.79,
      originalPrice: 5.99,
      store: "Extra",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 20,
    },
    {
      id: "extra-2",
      name: "Açúcar Cristal União 1kg",
      price: 3.99,
      originalPrice: 4.49,
      store: "Extra",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 11,
    },
  ]
  return mockData.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
}

export async function getExtraOffers(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const mockOffers: Product[] = [
    {
      id: "extra-offer-1",
      name: "Leite Integral Italac 1L",
      price: 4.79,
      originalPrice: 5.99,
      store: "Extra",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 20,
    },
    {
      id: "extra-offer-2",
      name: "Açúcar Cristal União 1kg",
      price: 3.99,
      originalPrice: 4.49,
      store: "Extra",
      image: "/placeholder.svg?height=100&width=100",
      location: "São Paulo - SP",
      discount: 11,
    },
  ]
  return mockOffers.filter((p) => p.discount && p.discount > 10)
}
