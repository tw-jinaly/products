import { AppError } from "../../errors/appError.js";
import { IProduct, ProductModel } from "../../models/product.model.js";
import {
  CreateProductInput,
  GetProductsQueryInput,
  UpdateProductInput,
} from "../validations/product.validation.js";
import {
  PaginatedResult,
  buildPaginationMetadata,
} from "../../common/pagination.schema.js";

interface ProductFilter {
  isDeleted?: boolean;
  price?: {
    $gte?: number;
    $lte?: number;
  };
  name?: {
    $regex: string;
    $options: string;
  };
  [key: string]: unknown;
}

export const getAllProducts = async (
  filters: GetProductsQueryInput
): Promise<PaginatedResult<IProduct>> => {
  const mongoFilter: ProductFilter = {};

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    mongoFilter.price = {};
    if (filters.minPrice !== undefined) {
      mongoFilter.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      mongoFilter.price.$lte = filters.maxPrice;
    }
  }

  if (filters.search) {
    mongoFilter.name = { $regex: filters.search, $options: "i" };
  }

  const skip = (filters.page - 1) * filters.limit;

  const [products, totalItems] = await Promise.all([
    ProductModel.find(mongoFilter)
      .sort(filters.sort)
      .skip(skip)
      .limit(filters.limit)
      .lean(),
    ProductModel.countDocuments(mongoFilter),
  ]);

  return {
    data: products as unknown as IProduct[],
    pagination: buildPaginationMetadata(
      totalItems,
      filters.page,
      filters.limit
    ),
  };
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await ProductModel.findById(id).lean();

  if (!product) {
    throw new AppError(`Product with ID '${id}' not found`, 404);
  }

  return product as unknown as IProduct;
};

export const createProduct = async (
  data: CreateProductInput
): Promise<IProduct> => {
  return await ProductModel.create({
    name: data.name,
    price: data.price,
    stock: data.stock,
  });
};

export const updateProduct = async (
  id: string,
  data: UpdateProductInput
): Promise<IProduct> => {
  const updatedProduct = await ProductModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedProduct) {
    throw new AppError(`Product with ID '${id}' not found`, 404);
  }

  return updatedProduct as unknown as IProduct;
};

export const softDeleteProduct = async (id: string): Promise<void> => {
  const result = await ProductModel.updateOne(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new AppError(`Product with ID '${id}' not found`, 404);
  }
};
