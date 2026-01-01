#!/bin/bash

# Script to modify /etc/hosts file for website blocking
# This script is meant to be run with pkexec

ACTION="$1"
CONTENT="$2"
HOSTS_FILE="/etc/hosts"
MARKER_START="# WEBSITE_BLOCKER_START"
MARKER_END="# WEBSITE_BLOCKER_END"
BACKUP_FILE="/etc/hosts.websiteblocker.backup"

# Create backup
cp "$HOSTS_FILE" "$BACKUP_FILE"

if [ "$ACTION" == "add" ]; then
    # First, remove any existing block
    sed -i "/$MARKER_START/,/$MARKER_END/d" "$HOSTS_FILE"

    # Add new block
    echo "" >> "$HOSTS_FILE"
    echo "$CONTENT" >> "$HOSTS_FILE"

    echo "Websites blocked successfully"
elif [ "$ACTION" == "remove" ]; then
    # Remove the block
    sed -i "/$MARKER_START/,/$MARKER_END/d" "$HOSTS_FILE"

    echo "Websites unblocked successfully"
else
    echo "Invalid action: $ACTION"
    exit 1
fi

exit 0
