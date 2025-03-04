# Use Node.js LTS as the base image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose port (NestJS default is 3000)
EXPOSE 3000

# Start NestJS in development mode
CMD ["yarn", "start:dev"]