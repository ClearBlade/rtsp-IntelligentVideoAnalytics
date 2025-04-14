#!/bin/bash

cleanup_script="/usr/local/bin/cleanup_clearblade_buckets.sh"
cron_job_file="/etc/cron.d/clearblade-cleanup"

# Log messages to console only
log() {
  local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1"
}

log "Stop script starting"

# Function to stop and remove the container
stop_container() {
  local container_name="iva-server"
  
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
  log "Starting cleanup process..."
  
  # Stop and remove the container
  if stop_container; then
    log "Container cleanup completed successfully"
  else
    log "Container cleanup failed"
    # Continue with cron job removal even if container removal fails
  fi
  
  # Remove the cleanup cron job
  remove_cleanup_cron_job
  
  log "All cleanup tasks completed"
}

# Execute main function
main

# Log script completion
log "Stop script execution completed"