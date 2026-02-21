# STAGE 1: Costruzione (Build) dell'app React con Vite
FROM node:18-alpine as build

WORKDIR /app

# Copia e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia tutto il resto e compila il frontend
COPY . .
RUN npm run build

# STAGE 2: Servire i file statici con Nginx
FROM nginx:alpine

# Copia i file compilati dalla fase precedente nella cartella pubblica di Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Aggiunge una configurazione Nginx per gestire il routing interno di React
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]