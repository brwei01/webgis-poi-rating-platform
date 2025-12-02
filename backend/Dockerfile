FROM node:20

WORKDIR /app

COPY package*.json ./

# RUN npm install
# only production env (only dependencies, strictly package-lock.json, lighter image)
RUN npm ci --only=production 

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

