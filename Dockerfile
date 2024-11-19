FROM node:20 AS node

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force 
# I have no clue why this line is needed
RUN npm i next
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=node /app ./

EXPOSE 3000

CMD ["npm", "start"]
