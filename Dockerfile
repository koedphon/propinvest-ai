FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
ARG VITE_ADMIN_EMAILS=""
ENV VITE_ADMIN_EMAILS=$VITE_ADMIN_EMAILS
RUN npx vite build
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["npx", "tsx", "server.ts", "--prod"]
