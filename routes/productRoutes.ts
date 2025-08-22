import { Request, Response, Router } from "express";
import multer from "multer";

import fs from "fs";
import cloudinary from "../config/cloudinaryConfig";
import { Product } from "../models/Product";
const upload = multer({ dest: "temp/" });
const router = Router();

// Array em memória (banco fake)
let products: Product[] = [];

// GET - listar todos os produtos
router.get("/", (_req: Request, res: Response) => {
  res.json(products);
});

// GET - buscar produto por ID
router.get("/:id", (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params["id"]);
  if (!product)
    return res.status(404).json({ message: "Produto não encontrado" });
  return res.json(product);
});

// POST - criar produto com upload de imagem
router.post(
  "/",
  upload.single("file_image"),
  async (req: Request, res: Response) => {
    try {
      const { nome, descricao, preco, precoPromocional, checkbox_group } =
        req.body;

      let file_image_url = "";
      if (req.file) {
        // Faz upload direto para Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "cartalago", // pasta dentro do Cloudinary
        });
        file_image_url = result.secure_url;
        fs.unlinkSync(req.file.path);
      }

      const newProduct: Product = {
        id: (products.length + 1).toString(),
        nome,
        descricao,
        preco: Number(preco),
        checkbox_group: checkbox_group ? JSON.parse(checkbox_group) : [],
        precoPromocional: precoPromocional
          ? Number(precoPromocional)
          : undefined,
        file_image: file_image_url,
      };

      products.push(newProduct);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({ message: "Erro ao criar produto" });
    }
  }
);

// PUT - atualizar produto
router.put(
  "/:id",
  upload.single("file_image"),
  async (req: Request, res: Response) => {
    try {
      const index = products.findIndex((p) => p.id === req.params["id"]);
      if (index === -1)
        return res.status(404).json({ message: "Produto não encontrado" });

      const { nome, descricao, preco, precoPromocional, checkbox_group } =
        req.body;
      let file_image = products[index].file_image; // mantém a imagem atual se não houver novo upload
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "cartalago",
        });
        file_image = result.secure_url;

        fs.unlinkSync(req.file.path);
      }

      products[index] = {
        ...products[index],
        nome,
        descricao,
        preco: Number(preco),
        checkbox_group: checkbox_group ? JSON.parse(checkbox_group) : [],
        precoPromocional: precoPromocional
          ? Number(precoPromocional)
          : undefined,
        file_image,
      };

      return res.json(products[index]);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  }
);

// DELETE - remover produto
router.delete("/:id", (req: Request, res: Response) => {
  const index = products.findIndex((p: Product) => p.id === req.params["id"]);
  if (index === -1)
    return res.status(404).json({ message: "Produto não encontrado" });

  const removed = products.splice(index, 1);
  return res.json(removed[0]);
});

export default router;
