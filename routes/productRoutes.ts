import { Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import { Product } from "../models/Product";

const router = Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/"); // pasta onde as imagens serão salvas
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // nome único
  },
});

const upload = multer({ storage });

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
router.post("/", upload.single("file_image"), (req: Request, res: Response) => {
  const { nome, descricao, preco, precoPromocional, checkbox_group } = req.body;
  const file_image = (req as any).file ? (req as any).file.filename : "";

  const newProduct: Product = {
    id: (products.length + 1).toString(),
    nome,
    descricao,
    preco: Number(preco),
    checkbox_group: checkbox_group ? JSON.parse(checkbox_group) : [],
    precoPromocional: precoPromocional ? Number(precoPromocional) : undefined,
    file_image,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT - atualizar produto
router.put(
  "/:id",
  upload.single("file_image"),
  (req: Request, res: Response) => {
    const index = products.findIndex((p) => p.id === req.params["id"]);
    if (index === -1)
      return res.status(404).json({ message: "Produto não encontrado" });

    const { nome, descricao, preco, precoPromocional, checkbox_group } =
      req.body;
    const file_image = (req as any).file
      ? (req as any).file.filename
      : products[index].file_image;

    products[index] = {
      ...products[index],
      nome,
      descricao,
      preco: Number(preco),
      checkbox_group: checkbox_group ? JSON.parse(checkbox_group) : [],
      precoPromocional: precoPromocional ? Number(precoPromocional) : undefined,
      file_image,
    };

    return res.json(products[index]);
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
