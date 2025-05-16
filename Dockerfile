# Usando uma imagem debian que é mais compatível com o Prisma
FROM node:20-slim

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    openssl \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar os arquivos de dependências primeiro
COPY package.json yarn.lock ./

# Instalar dependências
RUN yarn install

# Copiar o restante do código
COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

# Copiar o script de entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expor a porta que o Nest.js usa
EXPOSE 3000

# Comando para iniciar a aplicação usando o entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
CMD ["yarn", "start:dev"]

