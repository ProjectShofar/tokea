FROM node:22.9-alpine

WORKDIR /app

COPY ./www/build /app
RUN npm ci --omit=dev

ENTRYPOINT ["node", "bin/server.js"]