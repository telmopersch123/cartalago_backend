FROM node:20-alpine

WORKDIR /app

# Copia arquivos de package
COPY package*.json ./

# Instala todas as dependências, incluindo devDependencies
RUN npm install

# Copia o resto do código
COPY . .

# Compila o TypeScript
RUN npx tsc

# Expõe a porta
EXPOSE 3000

# Roda o servidor compilado
CMD ["node", "dist/servidor/server.js"]
