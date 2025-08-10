FROM node:22.9-alpine

WORKDIR /app

COPY ./www/build /app
COPY ./www/.env.example /app/.env.example
COPY ./entrypoint.sh /app/entrypoint.sh

RUN npm ci --omit=dev
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]