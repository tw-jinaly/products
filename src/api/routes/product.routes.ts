import { Router } from "express";
import {
  createProduct,
  getProduct,
  getProducts,
} from "../controllers/product.controller.js";
import { createProductSchema } from "../validations/product.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post("/", validate(createProductSchema), createProduct);

export const productRouter = router;
