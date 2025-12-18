FROM node:20-alpine

# receive build argument
ARG NODE_ENV=development

WORKDIR /app

COPY package*.json ./

# RUN npm install
# only production env (only dependencies, strictly package-lock.json, lighter image)
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --only=production; else npm install; fi

COPY . .

EXPOSE 3000

# CMD ["npm", "start"]
# override by docker-compose command
CMD ["node", "index.js"]
