# Use the official Node.js 16 image.
# https://hub.docker.com/_/node
FROM node:16-slim

# Install dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates procps libxshmfence1 \
    && apt-get install -y fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the local code to the container's workspace.
COPY . .

# Build the Next.js application
RUN npm run build

# The command to run the application when the container starts.
CMD ["npm", "start"]

# Expose the port the app runs on
EXPOSE 3000
