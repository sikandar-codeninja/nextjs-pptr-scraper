# Use the official Node.js 14 image.
FROM node:14-slim

# Set the working directory in the Docker container
WORKDIR /app

# Puppeteer dependencies for running full Chrome,
# not just Chromium provided by Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    --no-install-recommends \
    && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install \
    && rm google-chrome-stable_current_amd64.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json, yarn.lock, and other configuration files
COPY package.json yarn.lock ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./

# Install dependencies
RUN yarn install --production

# Copy local code to the container image
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["yarn", "start"]
