#!/bin/bash

image_name="drewhardie/iva-server:latest"
cleanup_script="/usr/local/bin/cleanup_clearblade_buckets.sh"
cron_job_file="/etc/cron.d/clearblade-cleanup"

# Log messages to console only
log() {
  local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1"
}

log "Start script starting"

# Setup cleanup cron job
setup_cleanup_cron_job() {
  log "Setting up cleanup cron job..."
  
  # Remove existing script if it exists
  if [ -f "$cleanup_script" ]; then
    log "Removing existing cleanup script..."
    rm -f "$cleanup_script"
  fi
  
  # Create cleanup script
  cat > "$cleanup_script" << 'EOF'
#!/bin/bash
# Script to clean up specific outbox directories in /tmp/clearblade_platform_buckets

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting selective cleanup of /tmp/clearblade_platform_buckets"

# Base directory path
BASE_DIR="/tmp/clearblade_platform_buckets"

# Check if the base directory exists
if [ ! -d "$BASE_DIR" ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Base directory $BASE_DIR does not exist, creating it"
    mkdir -p "$BASE_DIR"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Created $BASE_DIR directory"
    # Exit early since there's nothing to clean
    exit 0
fi

# Initialize counters
TOTAL_DIRS_CLEANED=0
TOTAL_FILES_REMOVED=0

# Process each system_key directory
for SYSTEM_KEY_DIR in "$BASE_DIR"/*; do
    if [ -d "$SYSTEM_KEY_DIR" ]; then
        SYSTEM_KEY=$(basename "$SYSTEM_KEY_DIR")
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Processing system key: $SYSTEM_KEY"
        
        # Process each bucket_set_id directory under this system_key
        for BUCKET_SET_DIR in "$SYSTEM_KEY_DIR"/*; do
            if [ -d "$BUCKET_SET_DIR" ]; then
                BUCKET_SET_ID=$(basename "$BUCKET_SET_DIR")
                
                # Skip the excluded directories: ia-images and ia_files
                if [ "$BUCKET_SET_ID" != "ia-images" ] && [ "$BUCKET_SET_ID" != "ia_files" ]; then
                    # Look for the outbox directory in this bucket set
                    OUTBOX_DIR="$BUCKET_SET_DIR/outbox"
                    
                    if [ -d "$OUTBOX_DIR" ]; then
                        # Count files and directories before cleaning
                        FILES_COUNT=$(find "$OUTBOX_DIR" -type f | wc -l)
                        DIRS_COUNT=$(find "$OUTBOX_DIR" -type d | wc -l)
                        
                        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Cleaning outbox for $SYSTEM_KEY/$BUCKET_SET_ID (contains $FILES_COUNT files in $DIRS_COUNT directories)"
                        
                        # Remove all contents from the outbox directory
                        rm -rf "$OUTBOX_DIR"/*
                        
                        # Verify that the directory is now empty
                        REMAINING=$(ls -A "$OUTBOX_DIR" 2>/dev/null | wc -l)
                        if [ "$REMAINING" -eq 0 ]; then
                            echo "[$(date +'%Y-%m-%d %H:%M:%S')] Successfully cleaned $OUTBOX_DIR"
                        else
                            echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $OUTBOX_DIR may not be completely empty"
                        fi
                        
                        # Update totals
                        TOTAL_DIRS_CLEANED=$((TOTAL_DIRS_CLEANED + 1))
                        TOTAL_FILES_REMOVED=$((TOTAL_FILES_REMOVED + FILES_COUNT))
                    fi
                else
                    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Skipping excluded directory: $SYSTEM_KEY/$BUCKET_SET_ID"
                fi
            fi
        done
    fi
done

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Cleanup completed. Processed $TOTAL_DIRS_CLEANED outbox directories and removed approximately $TOTAL_FILES_REMOVED files"
EOF

  # Make script executable and readable by all
  chmod 755 "$cleanup_script"
  log "Created cleanup script at $cleanup_script"
  
  # Remove existing cron job if it exists
  if [ -f "$cron_job_file" ]; then
    log "Removing existing cron job..."
    rm -f "$cron_job_file"
  fi
  
  # Create cron job to run every 30 minutes
  echo "*/30 * * * * root $cleanup_script" > "$cron_job_file"
  
  # Make sure cron job file has proper permissions
  chmod 644 "$cron_job_file"
  log "Created cron job at $cron_job_file"
  
  # Reload cron to ensure the job is registered
  if command -v systemctl >/dev/null 2>&1; then
    log "Restarting cron service using systemctl..."
    systemctl restart cron
  else
    log "Restarting cron service using service command..."
    service cron restart
  fi
  
  log "Cleanup cron job has been set up to run every 30 minutes"
  
  # Run the cleanup script once to initialize
  log "Running initial cleanup..."
  "$cleanup_script"
  
  log "Initial cleanup completed"
}

# Main function
main() {
  log "Starting deployment process..."
  
  # Create env file from environment variables
  log "Creating environment file..."
  printenv | grep -E 'CB_*' > env.list
  echo "CB_SYSTEM_SECRET=" >> env.list
  echo GIT_CONFIG_GLOBAL="safe.directory=/app/tasks" >> env.list
  log "Environment file created"

  # Setup cleanup cron job
  setup_cleanup_cron_job

  mkdir tasks

  # Start the container
  log "Starting container..."
  docker run -d \
      --restart="always" \
      --network="host" \
      --env-file env.list \
      --name iva-server \
      -v ./tasks:/app/tasks \
      -v /tmp/clearblade_platform_buckets:/tmp/clearblade_platform_buckets:rw \
      "$image_name" \
      --platformURL http://localhost:9000 \
      --messagingURL localhost:1883
  
  # Verify the container is running
  if docker ps --format '{{.Names}}' | grep -q "^iva-server$"; then
    log "IVA Server started successfully"
  else
    log "WARNING: Container may not have started correctly. Check 'docker ps' for status."
  fi
}

# Execute main function
main

# Log script completion
log "Start script execution completed"