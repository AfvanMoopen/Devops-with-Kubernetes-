FROM node:lts-alpine as build
WORKDIR /build
COPY public ./public
COPY src ./src
COPY package* ./
RUN npm ci
RUN npm run build

FROM nginx:1.18
COPY --from=build /build/build /usr/share/nginx/html