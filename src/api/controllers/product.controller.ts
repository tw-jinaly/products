import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ProductService } from "../services/product.service.js";

export const getProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await ProductService.getAllProducts();

    res.status(200).json({
      status: "sucess",
      results: products.length,
      data: { products },
    });
  }
);

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await ProductService.getProductById(id as string);

  res.status(200).json({
    status: "success",
    data: { product },
  });
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({
      status: "success",
      data: { product },
    });
  }
);
