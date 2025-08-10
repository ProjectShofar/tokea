FROM node:22.9-alpine

WORKDIR /app

COPY ./build /app
COPY ./lib /app/lib
RUN npm ci --omit=dev

ENTRYPOINT ["node", "bin/server.js"]