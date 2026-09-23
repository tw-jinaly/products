import { AppError } from "../../errors/appError.js";
import { CreateProductInput } from "../validations/product.validation.js";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const productStore: Product[] = [
  { id: "1", name: "Mechanical keyborad", price: 120, stock: 15 },
  { id: "2", name: "wirless mouse", price: 60, stock: 30 },
  { id: "3", name: "4k monitor", price: 400, stock: 5 },
];

export class ProductService {
  public static async getAllProducts(): Promise<Product[]> {
    return productStore;
  }

  public static async getProductById(id: string): Promise<Product> {
    const product = productStore.find((p) => p.id === id);
    if (!product) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }
    return product;
  }

  public static async createProduct(
    data: CreateProductInput
  ): Promise<Product> {
    const newProduct: Product = {
      id: (productStore.length + 1).toString(),
      name: data.name,
      price: data.price,
      stock: data.stock,
    };

    productStore.push(newProduct);
    return newProduct;
  }
}
