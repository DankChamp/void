---
title: "Building Nebula: A GTK4/libadwaita Package Manager for Void Linux"
description: "How I built a native GTK4 frontend for XBPS package management with Waypoint/Btrfs snapshot integration — written in Rust, designed for Void Linux."
pubDate: 2025-03-05
tags: ["Rust", "GTK4", "libadwaita", "Void Linux", "XBPS", "Package Manager", "Btrfs"]
draft: false
---

## The Problem

Void Linux's **XBPS** is excellent — fast, reliable, source-based. But the CLI experience (`xbps-install`, `xbps-query`, `xbps-remove`) can be intimidating for newcomers. Existing GUI tools are either:

- **Abandoned** (gtk2/gtk3 era)
- **Not native** (Electron wrappers)
- **Distro-agnostic** (missing Void-specific features)

I wanted a **native GTK4/libadwaita** package manager that feels like part of Void.

---

## Architecture

```
Nebula (GTK4 + libadwaita)
├── src/
│   ├── main.rs              # Application entry, AdwApplication
│   ├── ui/
│   │   ├── window.rs        # Main window, navigation
│   │   ├── discover.rs      # Package browsing, search
│   │   ├── installed.rs     # Installed packages management
│   │   ├── updates.rs       # System updates
│   │   └── settings.rs      # Preferences, repo config
│   ├── xbps/
│   │   ├── query.rs         # xbps-query wrappers
│   │   ├── install.rs       # xbps-install wrappers
│   │   ├── remove.rs        # xbps-remove wrappers
│   │   └── repo.rs          # Repository management
│   ├── waypoint/
│   │   └── snapshot.rs      # Btrfs snapshot via Waypoint
│   ├── category/
│   │   └── harvest.rs       # Category suggestions generator
│   └── data/
│       └── models.rs        # Package, Category, Repo structs
```

---

## XBPS Integration: Not a Wrapper, a Library

Most tools shell out to `xbps-*` binaries. Nebula uses **direct library calls** where possible, structured parsing for the rest.

```rust
// src/xbps/query.rs
use std::process::Command;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Package {
    pub pkgver: String,
    pub short_desc: String,
    pub homepage: Option<String>,
    pub license: String,
    pub maintainer: String,
    pub installed_size: u64,
    pub build_date: String,
    pub dependencies: Vec<String>,
    pub provides: Vec<String>,
    pub conflicts: Vec<String>,
}

pub fn query_installed() -> Result<Vec<Package>, XbpsError> {
    let output = Command::new("xbps-query")
        .args(["-l", "-s", "", "--property=pkgver,short_desc,homepage,license,maintainer,installed_size,build_date,dependencies,provides,conflicts"])
        .output()?;
    
    // Parse tab-separated output
    parse_package_list(&output.stdout)
}

pub fn search_packages(pattern: &str) -> Result<Vec<Package>, XbpsError> {
    let output = Command::new("xbps-query")
        .args(["-Rs", pattern, "--property=pkgver,short_desc,homepage,license,maintainer,installed_size,build_date"])
        .output()?;
    
    parse_package_list(&output.stdout)
}
```

**Why not libxbps?**
- C API, complex FFI
- Not stable across versions
- Structured output parsing is more maintainable

---

## Category Harvesting: Making XBPS Browseable

XBPS has no built-in categories. Nebula **generates them** from package metadata:

```rust
// src/category/harvest.rs
use std::collections::HashMap;

pub async fn harvest_categories(void_packages_path: &Path) -> Result<CategoryMap, HarvestError> {
    let mut categories: HashMap<String, Vec<String>> = HashMap::new();
    
    // 1. Parse all templates in void-packages
    for entry in walkdir::WalkDir::new(void_packages_path.join("srcpkgs")) {
        let template = parse_xbps_template(&entry)?;
        
        // 2. Extract category from various fields
        let category = infer_category(&template)?;
        
        // 3. Map to Nebula categories
        categories.entry(category)
            .or_default()
            .push(template.pkgname);
    }
    
    // 4. Apply manual overrides
    apply_overrides(&mut categories)?;
    
    // 5. Save as JSON for UI
    save_categories(&categories)?;
    
    Ok(categories)
}

fn infer_category(template: &Template) -> Result<String, HarvestError> {
    // Priority: explicit category > homepage keywords > description keywords > "Other"
    if let Some(cat) = template.custom_fields.get("category") {
        return Ok(cat.clone());
    }
    
    // Heuristics based on homepage/description
    let text = format!("{} {}", template.homepage, template.short_desc).to_lowercase();
    
    if text.contains("editor") || text.contains("ide") { return Ok("Development".into()); }
    if text.contains("terminal") || text.contains("shell") { return Ok("System".into()); }
    if text.contains("browser") || text.contains("web") { return Ok("Network".into()); }
    // ... more heuristics
    
    Ok("Other".into())
}
```

**Result**: 15,000+ packages → 12 meaningful categories → discoverable UI.

---

## Waypoint Integration: Btrfs Snapshots Before Updates

**The fear**: `xbps-install -Su` breaks something → system unbootable.

**The solution**: Waypoint creates a Btrfs snapshot **before** any system update.

```rust
// src/waypoint/snapshot.rs
use std::process::Command;

pub async fn create_pre_update_snapshot(description: &str) -> Result<String, WaypointError> {
    // Waypoint CLI: waypoint create --description "pre-update: 2025-03-05"
    let output = Command::new("waypoint")
        .args(["create", "--description", description])
        .output()?;
    
    if !output.status.success() {
        return Err(WaypointError::CreationFailed(
            String::from_utf8_lossy(&output.stderr).into()
        ));
    }
    
    // Parse snapshot ID from output
    parse_snapshot_id(&output.stdout)
}

pub async fn rollback_to_snapshot(snapshot_id: &str) -> Result<(), WaypointError> {
    let output = Command::new("waypoint")
        .args(["rollback", snapshot_id])
        .output()?;
    
    if !output.status.success() {
        return Err(WaypointError::RollbackFailed(
            String::from_utf8_lossy(&output.stderr).into()
        ));
    }
    
    Ok(())
}
```

**UI Flow**:

```
User clicks "Update System"
       ↓
Nebula: "Creating Btrfs snapshot via Waypoint..."
       ↓
Waypoint: Creates read-only snapshot of @ and @home subvolumes
       ↓
Nebula: Runs xbps-install -Su
       ↓
Success? → "Update complete. Snapshot retained for 7 days."
Failure? → "Update failed. Click 'Rollback' to restore."
```

---

## GTK4 + libadwaita: Modern, Native, Accessible

### Why Not Electron?

| Factor | Electron | GTK4/libadwaita |
|--------|----------|-----------------|
| Memory (idle) | ~200MB | ~40MB |
| Startup time | ~2s | ~300ms |
| System integration | Poor | Native |
| Accessibility | Via Chromium | First-class |
| Wayland support | Experimental | Native |
| Binary size | ~80MB | ~5MB |

### AdwApplication Setup

```rust
// src/main.rs
use adw::prelude::*;
use gtk::{gio, glib};

fn main() -> glib::ExitCode {
    let app = adw::Application::builder()
        .application_id("org.void.Nebula")
        .flags(gio::ApplicationFlags::HANDLES_COMMAND_LINE)
        .build();

    app.connect_activate(|app| {
        build_ui(app);
    });

    app.run()
}

fn build_ui(app: &adw::Application) {
    let window = adw::ApplicationWindow::builder()
        .application(app)
        .title("Nebula")
        .default_width(1000)
        .default_height(700)
        .build();

    // Navigation sidebar + content stack
    let navigation = adw::NavigationView::new();
    let page = create_discover_page();
    navigation.push(&page);
    
    window.set_content(Some(&navigation));
    window.present();
}
```

### Discover Page (Package Browser)

```rust
// src/ui/discover.rs
use gtk::{gio, glib, prelude::*};

fn create_discover_page() -> adw::NavigationPage {
    let page = adw::NavigationPage::new();
    page.set_title("Discover");
    
    let search_entry = gtk::SearchEntry::new();
    search_entry.set_placeholder_text("Search packages...");
    
    let list = gtk::ListView::new(
        Some(create_package_factory()),
        Some(gtk::NoSelection::new()),
    );
    
    // Debounced search
    search_entry.connect_search_changed(clone!(@weak list => move |entry| {
        let query = entry.text().to_string();
        // Async search with 300ms debounce
        spawn_search(query, list.clone());
    }));
    
    let content = gtk::Box::new(gtk::Orientation::Vertical, 0);
    content.append(&search_entry);
    content.append(&gtk::ScrolledWindow::builder()
        .child(&list)
        .vexpand(true)
        .build());
    
    page.set_child(Some(&content));
    page
}
```

---

## Building for Void

### Cargo.toml

```toml
[package]
name = "nebula-gtk"
version = "1.3.7"
edition = "2021"

[dependencies]
gtk4 = "0.10"
libadwaita = { version = "0.8", features = ["v1_4"] }
gio = { version = "0.10", features = ["v2_76"] }
glib = { version = "0.10", features = ["v2_76"] }
adw = { version = "0.8", features = ["v1_4"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
chrono = { version = "0.4", features = ["serde"] }
reqwest = { version = "0.12", features = ["blocking", "json", "rustls-tls-native-roots"] }
walkdir = "2.5"
phf = { version = "0.13", features = ["macros"] }
toml = "0.9"

[[bin]]
name = "nebula-gtk"
path = "src/main.rs"

[[bin]]
name = "category_harvest"
path = "src/bin/category_harvest.rs"

[build-dependencies]
glib-build-tools = "0.21"
phf_codegen = "0.13"
```

### Building

```bash
# Development
cargo run --bin nebula-gtk

# Release
cargo build --release --bin nebula-gtk
# Binary: target/release/nebula-gtk

# Category harvester (run when void-packages updates)
cargo run --bin category_harvest
```

### System Install

```bash
sudo ./setup.sh install
# Installs to /usr/libexec/nebula-gtk
# Registers .desktop entry
# Installs hicolor icons
```

---

## Screenshots

| Discover | Installed | Updates |
|----------|-----------|---------|
| ![Discover](assets/screenshots/1-discover.png) | ![Installed](assets/screenshots/2-installed.png) | ![Updates](assets/screenshots/3-updates.png) |

---

## What's Next

- [ ] **Parallel downloads** — `xbps-install` supports it, need UI
- [ ] **Transaction preview** — Show disk space, download size before confirm
- [ ] **Kernel management** — List/remove old kernels
- [ ] **Orphan cleanup UI** — Visual `xbps-remove -O`
- [ ] **Repo mirror selector** — Fastest mirror auto-detection
- [ ] **Flatpak integration** — Unified package view

---

## Contributing

```bash
git clone https://github.com/DankChamp/nebula-gtk
cd nebula-gtk

# Build
cargo build --release

# Test
cargo test

# Lint
cargo clippy --all-targets -- -D warnings
cargo fmt --all -- --check

# PRs welcome!
```

**Areas needing help:**
- Accessibility testing (screen readers)
- Translations (gettext integration)
- Packaging for other distros
- Wayland-specific fixes

---

*Built with Rust • GTK4 • libadwaita • XBPS • Waypoint • Btrfs • Void Linux*