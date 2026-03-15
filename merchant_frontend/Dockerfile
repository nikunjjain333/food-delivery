FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expo web requires some specific ports
EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "web"]
