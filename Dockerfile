FROM node:24-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

RUN mkdir -p logs

COPY . .

CMD ["node", "src/index.js"]