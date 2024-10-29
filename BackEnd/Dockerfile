FROM node:22-bullseye-slim AS base

RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    ca-certificates \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgbm-dev \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxtst6 \
    xdg-utils \
    --no-install-recommends && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=4000

EXPOSE 4000

CMD [ "npm", "run", "start" ]
