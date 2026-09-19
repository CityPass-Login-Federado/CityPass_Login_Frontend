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

RUN mkdir -p \
      /usr/share/nginx/html \
      /tmp/nginx/client_temp \
      /tmp/nginx/proxy_temp \
      /tmp/nginx/fastcgi_temp \
      /tmp/nginx/uwsgi_temp \
      /tmp/nginx/scgi_temp \
  && chown -R nginx:nginx \
      /usr/share/nginx/html \
      /tmp/nginx \
  && chmod 755 /usr/share/nginx/html \
  && chmod 700 /tmp/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx --chmod=444 /app/dist /usr/share/nginx/html

RUN find /usr/share/nginx/html -type d -exec chmod 555 {} + && \
    find /usr/share/nginx/html -type f -exec chmod 444 {} + && \
    chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
