FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY . .

# Instale o TypeScript globalmente para compilar
RUN npm install -g typescript

# Compile o TypeScript
RUN tsc 

EXPOSE 3000
CMD ["node", "dist/servidor/server.js"]
