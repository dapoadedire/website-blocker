const { GObject, St, Gio, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const HOSTS_FILE = '/etc/hosts';
const MARKER_START = '# WEBSITE_BLOCKER_START';
const MARKER_END = '# WEBSITE_BLOCKER_END';

const DEFAULT_BLOCKED_SITES = [
    'twitter.com',
    'www.twitter.com',
    'x.com',
    'www.x.com',
    'facebook.com',
    'www.facebook.com',
    'instagram.com',
    'www.instagram.com',
    'tiktok.com',
    'www.tiktok.com'
];

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Website Blocker');

        // Create icon
        let icon = new St.Icon({
            icon_name: 'network-offline-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(icon);

        // Create menu items
        this._statusLabel = new St.Label({
            text: 'Checking...',
            y_expand: true,
            y_align: 2 // Center
        });

        let statusItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });
        statusItem.add_child(this._statusLabel);
        this.menu.addMenuItem(statusItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Toggle button
        this._toggleItem = new PopupMenu.PopupSwitchMenuItem('Block Websites', false);
        this._toggleItem.connect('toggled', this._onToggle.bind(this));
        this.menu.addMenuItem(this._toggleItem);

        // Check initial state
        this._updateStatus();
    }

    _isBlocked() {
        try {
            let [success, contents] = GLib.file_get_contents(HOSTS_FILE);
            if (success) {
                let hostsContent = new TextDecoder().decode(contents);
                return hostsContent.includes(MARKER_START);
            }
        } catch (e) {
            logError(e, 'Failed to read hosts file');
        }
        return false;
    }

    _updateStatus() {
        let blocked = this._isBlocked();
        this._toggleItem.setToggleState(blocked);
        this._statusLabel.text = blocked ? '🔒 Websites Blocked' : '✓ Websites Accessible';
    }

    _onToggle(item, state) {
        if (state) {
            this._blockSites();
        } else {
            this._unblockSites();
        }
    }

    _blockSites() {
        let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.website-blocker');
        let blockedSites = settings.get_strv('blocked-sites');

        if (blockedSites.length === 0) {
            blockedSites = DEFAULT_BLOCKED_SITES;
        }

        let blockedEntries = blockedSites.map(site => `127.0.0.1 ${site}`).join('\n');
        let blockContent = `${MARKER_START}\n${blockedEntries}\n${MARKER_END}`;

        this._modifyHosts('add', blockContent);
    }

    _unblockSites() {
        this._modifyHosts('remove', '');
    }

    _modifyHosts(action, content) {
        let scriptPath = Me.path + '/modify-hosts.sh';

        try {
            let proc = Gio.Subprocess.new(
                ['pkexec', scriptPath, action, content],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);

                    if (proc.get_successful()) {
                        this._updateStatus();
                        Main.notify('Website Blocker',
                            action === 'add' ? 'Websites blocked successfully' : 'Websites unblocked successfully');
                    } else {
                        Main.notify('Website Blocker',
                            'Failed to modify hosts file: ' + stderr);
                        // Revert toggle state
                        this._updateStatus();
                    }
                } catch (e) {
                    logError(e, 'Error in modify hosts callback');
                    this._updateStatus();
                }
            });
        } catch (e) {
            logError(e, 'Failed to execute modify-hosts script');
            Main.notify('Website Blocker', 'Failed to execute script: ' + e.message);
            this._updateStatus();
        }
    }
});

class Extension {
    constructor() {
        this._indicator = null;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea('website-blocker', this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}

function init() {
    return new Extension();
}
