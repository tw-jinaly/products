import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import {
  createProductSchema,
  getProductsQuerySchema,
  updateProductSchema,
} from "../validations/product.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router
  .route("/")
  .get(validate(getProductsQuerySchema, "query"), getProducts)
  .post(validate(createProductSchema, "body"), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .patch(validate(updateProductSchema, "body"), updateProduct)
  .delete(deleteProduct);

export const productRouter = router;
