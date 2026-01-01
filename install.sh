#!/bin/bash

# Installation script for Website Blocker GNOME Extension

set -e

EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/website-blocker@local"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing Website Blocker GNOME Extension..."

# Compile schema
echo "Compiling schema..."
glib-compile-schemas "$SOURCE_DIR/schemas/"

# Create extension directory
echo "Creating extension directory..."
mkdir -p "$EXTENSION_DIR"

# Copy files
echo "Copying extension files..."
cp -r "$SOURCE_DIR"/* "$EXTENSION_DIR/"

# Make sure the script is executable
chmod +x "$EXTENSION_DIR/modify-hosts.sh"

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart GNOME Shell:"
echo "   - On X11: Press Alt+F2, type 'r', press Enter"
echo "   - On Wayland: Log out and log back in"
echo ""
echo "2. Enable the extension:"
echo "   gnome-extensions enable website-blocker@local"
echo ""
echo "3. Look for the network icon in your top bar to toggle blocking!"
