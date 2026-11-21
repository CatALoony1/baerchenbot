FROM node:24-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    fontconfig \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

RUN mkdir -p logs

COPY . .

CMD ["node", "src/index.js"]