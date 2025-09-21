FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema (incluindo openssl para Prisma)
RUN apk add --no-cache bash postgresql-client openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma/ ./prisma/

# Instalar dependências como root
RUN npm ci && npm install -g wait-port

# Copiar código fonte
COPY . .

# Gerar Prisma client como root (resolve permissões)
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Verificar se compilou
RUN ls -la dist/

# Criar pasta uploads e ajustar permissões
RUN mkdir -p uploads

# Copiar script de inicialização
COPY start.sh ./
RUN chmod +x start.sh

# Ajustar permissões para usuário node DEPOIS de instalar tudo
RUN chown -R node:node /app

# Agora mudar para usuário node
USER node

EXPOSE 3002

CMD ["./start.sh"]