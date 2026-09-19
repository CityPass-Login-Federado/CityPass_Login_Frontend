# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts --no-audit --no-fund

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

RUN mkdir -p /var/cache/nginx /var/run/nginx /usr/share/nginx/html \
  && chown -R nginx:nginx /var/cache/nginx /var/run/nginx /usr/share/nginx/html \
  && chmod 755 /usr/share/nginx/html

COPY --chown=nginx:nginx --chmod=444 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx --chmod=444 /app/dist /usr/share/nginx/html

RUN find /usr/share/nginx/html -type d -exec chmod 555 {} + && \
    find /usr/share/nginx/html -type f -exec chmod 444 {} + && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
