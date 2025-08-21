import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import productRoutes from "../routes/productRoutes";

dotenv.config();

const app = express();

const uploadDir = path.join(__dirname, "../", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(
  cors({
    origin: process.env["FRONTEND_URL"],
  })
);
app.use(express.json());

app.use("/uploads", express.static(uploadDir));

app.use("/api/products", productRoutes);

const PORT = process.env["PORT"];
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
