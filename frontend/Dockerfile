FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

ARG EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
ARG EXPO_PUBLIC_KEYCLOAK_URL=http://localhost:8081
ARG EXPO_PUBLIC_KEYCLOAK_REALM=outfit-combine
ARG EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=outfit-combine-web
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_KEYCLOAK_URL=$EXPO_PUBLIC_KEYCLOAK_URL
ENV EXPO_PUBLIC_KEYCLOAK_REALM=$EXPO_PUBLIC_KEYCLOAK_REALM
ENV EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=$EXPO_PUBLIC_KEYCLOAK_CLIENT_ID

RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
