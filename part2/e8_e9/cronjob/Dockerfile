FROM node:lts-alpine
COPY *.js package* ./
RUN npm ci
ENTRYPOINT ["node","index.js"]
