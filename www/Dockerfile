FROM node:22.9-alpine

WORKDIR /app

COPY ./build /app
RUN npm ci --omit=dev

ENTRYPOINT ["node", "bin/server.js"]