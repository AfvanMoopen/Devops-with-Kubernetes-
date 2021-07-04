FROM node:lts-alpine
COPY index.js *.hbs package* ./
RUN npm ci
ENTRYPOINT ["node","index.js"]
