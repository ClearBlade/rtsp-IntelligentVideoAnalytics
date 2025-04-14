#!/bin/bash

#exit on any error
set -e

#log messages
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

#check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

#check if script is run as root
if [ "$(id -u)" != "0" ]; then
  log "Error: This script must be run as root"
  exit 1
fi

#check if running on Linux
if [ "$(uname)" != "Linux" ]; then
  log "Error: This script must be run on Linux"
  exit 1
fi

#check if running on AMD64 architecture
if [ "$(uname -m)" != "x86_64" ]; then
  log "Error: This script must be run on AMD64 architecture"
  exit 1
fi

#install essentials
log "Installing essential packages..."

#install Docker
install_docker() {
  log "Installing Docker..."
  
  #remove old versions if they exist
  apt-get remove -y docker docker-engine docker.io containerd runc || true
  
  #add Docker's official GPG key, force overwrite if already present
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor | tee /usr/share/keyrings/docker-archive-keyring.gpg > /dev/null
  
  #add Docker repository
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
  #install Docker
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io
  
  #start and enable Docker service
  systemctl start docker
  systemctl enable docker
  
  #verify installation
  if ! command_exists docker; then
    log "Error: Docker installation failed"
    exit 1
  fi
    
  log "Docker installed successfully"
}


#main installation process
main() {
    log "Starting deployment script..."
    install_docker
    #verify NVIDIA Docker installation    
    log "Deployment completed successfully!"
}

main