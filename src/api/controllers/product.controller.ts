import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAllProducts,
  getProductById,
  createProduct as createProductService,
  updateProduct as updateProductService,
  softDeleteProduct as softDeleteProductService,
} from "../services/product.service.js";
import {
  CreateProductInput,
  GetProductsQueryInput,
  UpdateProductInput,
} from "../validations/product.validation.js";
import { IProduct, ProductModel } from "../../models/product.model.js";
import { AppError } from "../../errors/appError.js";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllProducts(
    req.query as unknown as GetProductsQueryInput
  );

  res.status(200).json({
    status: "success",
    data: result.data,
    pagination: result.pagination,
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await getProductById(id as string);

  res.status(200).json({
    status: "success",
    data: { product },
  });
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await createProductService(req.body as CreateProductInput);

    res.status(201).json({
      status: "success",
      data: { product },
    });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await updateProductService(
      id as string,
      req.body as UpdateProductInput
    );

    res.status(200).json({
      status: "success",
      data: { product },
    });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await softDeleteProductService(id as string);
    res.status(204).send();
  }
);
