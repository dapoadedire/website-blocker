# Website Blocker - GNOME Extension

A simple GNOME Shell extension that lets you block distracting websites with a single toggle button. It works by modifying your `/etc/hosts` file to redirect blocked domains to localhost.

## Requirements

- **Linux** with GNOME Shell desktop environment
- **glib-compile-schemas** (usually included with GNOME)
- **pkexec** (PolicyKit) for elevated permissions

> **Note:** This extension only works on Linux systems running GNOME. It is not compatible with Windows, macOS, or other Linux desktop environments (KDE, XFCE, etc.).

## Features

- **One-click toggle** in the GNOME top bar to block/unblock websites
- **Customizable website list** through preferences
- **Default blocks** for common social media sites (Twitter/X, Facebook, Instagram, TikTok)
- **Visual indicator** showing current blocking status
- **Secure** - uses pkexec for elevated permissions

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/dapoadedire/website-blocker.git
cd website-blocker
```

### 2. Run the install script

```bash
chmod +x install.sh
./install.sh
```

This will automatically compile the schema, create the extension directory, and copy all necessary files.

### 3. Restart GNOME Shell

- On X11: Press `Alt+F2`, type `r`, and press Enter
- On Wayland: Log out and log back in

### 4. Enable the extension

```bash
gnome-extensions enable website-blocker@local
```

Or use the Extensions app (GNOME Extensions Manager).

## Usage

### Basic Usage

1. Look for the network icon in your GNOME top bar
2. Click it to open the menu
3. Toggle "Block Websites" on or off
4. Enter your password when prompted (pkexec authentication)
5. You'll see a notification confirming the action

### Customizing Blocked Sites

1. Open GNOME Extensions app or run:
   ```bash
   gnome-extensions prefs website-blocker@local
   ```
2. Add or remove websites (one per line)
3. Click "Save Changes"
4. Toggle the blocker off and on again for changes to take effect

### Default Blocked Sites

- twitter.com / www.twitter.com
- x.com / www.x.com
- facebook.com / www.facebook.com
- instagram.com / www.instagram.com
- tiktok.com / www.tiktok.com

## How It Works

The extension modifies your `/etc/hosts` file by adding entries that redirect blocked domains to `127.0.0.1` (localhost). When blocking is enabled:

```
# WEBSITE_BLOCKER_START
127.0.0.1 twitter.com
127.0.0.1 www.twitter.com
127.0.0.1 x.com
127.0.0.1 www.x.com
...
# WEBSITE_BLOCKER_END
```

When you toggle blocking off, these entries are removed.

## Permissions

The extension requires root access to modify `/etc/hosts`. It uses `pkexec` (PolicyKit) to safely elevate privileges, which will prompt you for your password each time you toggle blocking.

## Troubleshooting

### Extension doesn't appear after installation

- Make sure you restarted GNOME Shell
- Check if the extension is enabled: `gnome-extensions list`
- Check logs: `journalctl -f -o cat /usr/bin/gnome-shell`

### "Failed to execute script" error

- Ensure `modify-hosts.sh` is executable:
  ```bash
  chmod +x ~/.local/share/gnome-shell/extensions/website-blocker@local/modify-hosts.sh
  ```

### Changes not taking effect

- Make sure to toggle blocking off and back on after changing the website list
- Try clearing your browser cache
- Some browsers may have DNS caching; restart the browser

### Permission denied errors

- The extension uses `pkexec` which should prompt for your password
- Make sure you're in the `sudo` or `wheel` group

## Uninstallation

### 1. Disable and remove the extension

```bash
gnome-extensions disable website-blocker@local
rm -rf ~/.local/share/gnome-shell/extensions/website-blocker@local
```

### 2. Clean up hosts file (if needed)

If the extension is removed while blocking is active, manually clean up:

```bash
sudo sed -i '/# WEBSITE_BLOCKER_START/,/# WEBSITE_BLOCKER_END/d' /etc/hosts
```

## Development

### Testing changes

After modifying the extension code:

```bash
# From the cloned repository directory, copy changes to the extension directory
cp -r ./* ~/.local/share/gnome-shell/extensions/website-blocker@local/

# Restart GNOME Shell (X11)
# Press Alt+F2, type 'r', press Enter

# On Wayland, log out and back in
```

### View logs

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Credits

Created with Claude Code
