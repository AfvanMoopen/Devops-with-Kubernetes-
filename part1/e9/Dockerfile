FROM node:lts-alpine
COPY index.js package* ./
RUN npm ci
ENTRYPOINT ["node","index.js"]
