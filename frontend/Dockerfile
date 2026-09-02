# --- build stage -----------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Same layer-caching trick as the backend: install deps before
# copying the rest of the source, so `npm ci` only reruns when
# package*.json actually changes.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime stage -----------------------------------------------------
# Bare nginx image — just serves the static files the build stage
# produced and reverse-proxies /api/* to the backend.
FROM nginx:1.27-alpine AS runtime

# @angular/build's application builder outputs browser assets under
# dist/<project-name>/browser.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
