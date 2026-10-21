# Node ka official image use kar rahe hain
FROM node:20-alpine

# App ke liye working directory
WORKDIR /app

# Package files copy karo
COPY package*.json ./

# Dependencies install karo
RUN npm install --production

# Baaki code copy karo
COPY . .

# Jo port tumhara app use karega
EXPOSE 4000

# Container start hone par ye command chalegi
CMD ["npm", "start"]
