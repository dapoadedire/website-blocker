const { Adw, Gtk, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.website-blocker'
    );

    // Create a preferences page
    const page = new Adw.PreferencesPage();
    window.add(page);

    // Create a preferences group
    const group = new Adw.PreferencesGroup({
        title: 'Blocked Websites',
        description: 'Configure which websites to block (one per line)',
    });
    page.add(group);

    // Get current blocked sites
    let blockedSites = settings.get_strv('blocked-sites');
    let sitesText = blockedSites.join('\n');

    // Create text view for editing sites
    const scrolled = new Gtk.ScrolledWindow({
        hexpand: true,
        vexpand: true,
        min_content_height: 300,
    });

    const textView = new Gtk.TextView({
        buffer: new Gtk.TextBuffer({ text: sitesText }),
        wrap_mode: Gtk.WrapMode.WORD,
        monospace: true,
        top_margin: 10,
        bottom_margin: 10,
        left_margin: 10,
        right_margin: 10,
    });

    scrolled.set_child(textView);

    const row = new Adw.PreferencesRow({
        child: scrolled,
    });
    group.add(row);

    // Add save button
    const saveButton = new Gtk.Button({
        label: 'Save Changes',
        halign: Gtk.Align.END,
        margin_top: 10,
    });

    saveButton.connect('clicked', () => {
        const buffer = textView.get_buffer();
        const [start, end] = buffer.get_bounds();
        const text = buffer.get_text(start, end, false);

        // Split by newlines and filter empty lines
        const sites = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        settings.set_strv('blocked-sites', sites);

        // Show notification
        window.close();
    });

    const buttonRow = new Adw.PreferencesRow({
        child: saveButton,
    });
    group.add(buttonRow);

    // Add reset button
    const resetButton = new Gtk.Button({
        label: 'Reset to Defaults',
        halign: Gtk.Align.START,
        margin_top: 10,
    });

    resetButton.connect('clicked', () => {
        settings.reset('blocked-sites');
        let defaultSites = settings.get_strv('blocked-sites');
        textView.get_buffer().set_text(defaultSites.join('\n'), -1);
    });

    const resetRow = new Adw.PreferencesRow({
        child: resetButton,
    });
    group.add(resetRow);
}
