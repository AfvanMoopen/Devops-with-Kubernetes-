FROM node:lts-alpine
COPY database.js index.js package* ./
RUN npm ci
ENTRYPOINT ["node","index.js"]
