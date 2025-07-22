import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

interface ProductCardProps {
  product: Product
  isLowestPrice?: boolean
}

export default function ProductCard({ product, isLowestPrice = false }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <Card className={`${isLowestPrice ? "ring-2 ring-green-500" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              {product.store} - {product.location}
            </div>
          </div>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-16 h-16 object-cover rounded"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
              {isLowestPrice && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Melhor preço
                </Badge>
              )}
            </div>
            {product.originalPrice && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                {product.discount && <Badge variant="destructive">-{product.discount}%</Badge>}
              </div>
            )}
          </div>
          <Button size="sm">Ver na loja</Button>
        </div>
      </CardContent>
    </Card>
  )
}
