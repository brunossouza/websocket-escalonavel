# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run the application
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Expose the port your NestJS application listens on
EXPOSE 3000

# Command to run the application in production mode
CMD [ "node", "dist/main" ]