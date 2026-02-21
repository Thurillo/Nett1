FROM node:18-alpine

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file delle dipendenze e installale
COPY package*.json ./
RUN npm install --production

# Copia tutto il resto del codice sorgente (es. server.js)
COPY . .

# Esponi la porta usata dall'API
EXPOSE 3000

# Avvia il server Node.js
CMD ["npm", "start"]