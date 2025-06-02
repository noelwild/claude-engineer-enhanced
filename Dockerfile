FROM node:18-bullseye AS frontend-builder

# Install frontend dependencies and build
WORKDIR /app/enhanced_frontend
COPY enhanced_frontend/package.json enhanced_frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY enhanced_frontend/ ./
RUN yarn build

# Main application image
FROM python:3.11-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    default-jdk \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for React development
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set up Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p /opt/android-sdk && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip -q commandlinetools-linux-11076708_latest.zip -d /opt/android-sdk && \
    mv /opt/android-sdk/cmdline-tools /opt/android-sdk/cmdline-tools-temp && \
    mkdir /opt/android-sdk/cmdline-tools && \
    mv /opt/android-sdk/cmdline-tools-temp /opt/android-sdk/cmdline-tools/latest && \
    rm commandlinetools-linux-11076708_latest.zip

# Install Miniforge (miniconda for ARM64/x86_64)
RUN wget -q https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh && \
    bash Miniforge3-Linux-x86_64.sh -b -p /opt/miniforge3 && \
    rm Miniforge3-Linux-x86_64.sh

ENV PATH="/opt/miniforge3/bin:$PATH"

# Install Python development tools
RUN /opt/miniforge3/bin/pip install \
    buildozer \
    kivy \
    cython \
    python-for-android

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses || true
RUN sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "system-images;android-34;google_apis;x86_64" || true

# Set up application
WORKDIR /app

# Copy application code
COPY claude-engineer/ ./claude-engineer/
COPY enhanced_backend/ ./enhanced_backend/
COPY enhanced_frontend/ ./enhanced_frontend/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/enhanced_frontend/build ./enhanced_frontend/build

# Install backend dependencies
RUN pip install -r enhanced_backend/requirements.txt

# Install frontend dependencies for development
WORKDIR /app/enhanced_frontend
RUN npm install -g yarn && yarn install

# Create project directories
RUN mkdir -p /app/android_projects /app/web_projects /app/python_projects

# Set working directory
WORKDIR /app

# Copy startup script
COPY start_production.sh ./
RUN chmod +x start_production.sh

# Expose ports
EXPOSE 3001 8002

# Start services
CMD ["./start_production.sh"]
