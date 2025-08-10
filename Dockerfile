FROM node:22.9-alpine

WORKDIR /app

COPY ./www/build /app
RUN npm ci --omit=dev

ENTRYPOINT ["./entrypoint.sh"]