FROM node:20-alpine

RUN addgroup -S botgroup && adduser -S botuser -G botgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data && chown -R botuser:botgroup /app/data

USER botuser

CMD ["node", "index.js"]