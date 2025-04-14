#!/bin/bash

cleanup_script="/usr/local/bin/cleanup_clearblade_buckets.sh"
cron_job_file="/etc/cron.d/clearblade-cleanup"
container_name="iva-server"

# Log messages to console only
log() {
  local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1"
}

log "Undeploy script starting"

# Function to stop and remove the container
stop_container() {
  # Check if container exists
  if docker ps -a --format '{{.Names}}' | grep -q "^$container_name$"; then
    log "Found container with name: $container_name"
    
    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^$container_name$"; then
      log "Container is currently running, stopping it..."
      docker stop "$container_name"
    else
      log "Container exists but is not running"
    fi
    
    # Remove the container
    log "Removing container $container_name..."
    docker rm "$container_name"
    
    log "Container stopped and removed successfully"
    return 0
  else
    log "No container found with name: $container_name"
    return 1
  fi
}

# Function to remove the Docker image
remove_image() {
  # Check if image exists with the container name as repository
  if docker images | grep "$container_name" > /dev/null; then
    log "Found image for: $container_name"
    
    # Get the image ID
    local image_id=$(docker images --format "{{.ID}}" --filter "reference=$container_name")
    
    if [ -n "$image_id" ]; then
      log "Removing image with ID: $image_id"
      docker rmi "$image_id"
      log "Image removed successfully"
      return 0
    else
      log "Unable to find image ID for $container_name"
      return 1
    fi
  else
    log "No image found for: $container_name"
    return 1
  fi
}

# Function to remove the cleanup cron job
remove_cleanup_cron_job() {
  log "Removing cleanup cron job..."
  
  # Remove the cron job file
  if [ -f "$cron_job_file" ]; then
    rm -f "$cron_job_file"
    log "Removed cron job file: $cron_job_file"
  else
    log "Cron job file not found at: $cron_job_file"
  fi
  
  # Remove the cleanup script
  if [ -f "$cleanup_script" ]; then
    rm -f "$cleanup_script"
    log "Removed cleanup script: $cleanup_script"
  else
    log "Cleanup script not found at: $cleanup_script"
  fi
  
  # Reload cron to apply changes
  if command -v systemctl >/dev/null 2>&1; then
    systemctl restart cron
    log "Restarted cron service using systemctl"
  else
    service cron restart
    log "Restarted cron service using service command"
  fi
  
  log "Cleanup cron job removal completed"
  return 0
}

# Main function
main() {
  log "Starting undeployment process..."
  
  # Stop and remove the container
  if stop_container; then
    log "Container cleanup completed successfully"
  else
    log "Container cleanup failed or container not found"
    # Continue with image removal even if container removal fails
  fi
  
  # Remove the Docker image
  if remove_image; then
    log "Image removal completed successfully"
  else
    log "Image removal failed or image not found"
    # Continue with cron job removal even if image removal fails
  fi
  
  # Remove the cleanup cron job
  remove_cleanup_cron_job
  
  log "All undeployment tasks completed"
}

# Execute main function
main

# Log script completion
log "Undeploy script execution completed"
