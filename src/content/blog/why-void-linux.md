---
title: "Why I Switched to Void Linux: A Systems Programmer's Perspective"
description: "From Ubuntu to Arch to Void — how runit, XBPS, and musl libc changed how I think about Linux systems. Practical insights for developers considering the switch."
pubDate: 2025-02-10
tags: ["Void Linux", "Linux", "runit", "XBPS", "Systems Programming", "musl"]
draft: false
---

## The Journey

Ubuntu → Arch → **Void Linux**. Each step taught me something about what I actually want from an OS.

| Distro | Init | Package Manager | libc | Philosophy |
|--------|------|-----------------|------|------------|
| Ubuntu | systemd | apt | glibc | "Works out of the box" |
| Arch | systemd | pacman | glibc | "Build it yourself" |
| **Void** | **runit** | **XBPS** | **musl/glibc** | **"Simple, transparent, fast"** |

---

## runit: The Init System That Just Works

```bash
# Service directory structure
/etc/sv/
├── dhcpcd/
│   ├── run          # Start script
│   ├── finish       # Stop script (optional)
│   └── log/         # Logging (optional)
├── sshd/
│   └── run
└── emma/            # My custom service
    └── run
```

```bash
# Enable service — symlink to /var/service
sudo ln -s /etc/sv/sshd /var/service/

# Check status
sv status sshd
# run: sshd: (pid 1234) 45s

# Control
sv up sshd      # start
sv down sshd    # stop
sv restart sshd # restart
```

**Why runit > systemd for me:**

| Aspect | systemd | runit |
|--------|---------|-------|
| Binary logs | `journalctl` | Plain text (`svlogd`) |
| Dependencies | Complex `.target`/`.wants` | Simple symlinks |
| Debugging | `systemctl status`, coredumpctl | Read `run` script |
| PID 1 complexity | Massive | ~2000 lines C |
| Learning curve | Steep | Read shell scripts |

**Real example** — my Emma AI service:

```bash
# /etc/sv/emma/run
#!/bin/sh
exec 2>&1
cd /home/void/AI/emma
exec chpst -u void:void ./run.sh
```

```bash
# /etc/sv/emma/log/run
#!/bin/sh
exec svlogd -tt ./main
```

That's it. No `[Unit]`, `[Service]`, `[Install]` sections. No `systemctl daemon-reload`. Just shell scripts.

---

## XBPS: Package Management Done Right

### Source-Based by Default

```bash
# Install from binary (fast)
sudo xbps-install -S vim

# Build from source (optimized)
sudo xbps-install -S --repository=hostdir/binpkgs vim
# Or use xbps-src for full control
```

### xbps-src: Build Your Own Repository

```bash
# Clone void-packages
git clone https://github.com/void-linux/void-packages
cd void-packages

# Bootstrap
./xbps-src binary-bootstrap

# Build any package with custom flags
./xbps-src pkg -j$(nproc) neovim
# Creates .xbps in hostdir/binpkgs/

# Install your custom build
sudo xbps-install --repository=hostdir/binpkgs neovim
```

**Customizing a package** (e.g., neovim with LuaJIT):

```bash
# void-packages/srcpkgs/neovim/template
# Edit: configure_args+=("--with-luajit")
./xbps-src pkg neovim
```

### XBPS Features I Use Daily

```bash
# Query package info
xbps-query -Rs "neovim"      # Search
xbps-query -l                # List installed
xbps-query -f neovim         # Files in package
xbps-query -x neovim         # Dependencies

# Cleanup
sudo xbps-remove -O          # Remove orphans
sudo xbps-remove -o          # Remove orphans (recursive)

# Verify integrity
xbps-pkgdb -a                # Audit all packages
```

---

## musl libc: Smaller, Faster, Cleaner

Void offers **both** glibc and musl variants. I run **musl**.

```bash
# Check your libc
ldd --version
# musl libc (x86_64)
```

| Metric | glibc | musl |
|--------|-------|------|
| Static binary size | ~800KB | ~200KB |
| Startup time | Baseline | ~30% faster |
| Memory overhead | Higher | Lower |
| Standards compliance | GNU extensions | Strict POSIX |
| Proprietary binaries | ✅ | ❌ (mostly) |

**Trade-off**: Some proprietary binaries (VS Code, Steam, Zoom) need glibc. Solution:

```bash
# Flatpak for proprietary apps
flatpak install flathub com.visualstudio.code
flatpak install flathub com.valvesoftware.Steam

# Or chroot into glibc environment
sudo xbps-install -S base-glibc
sudo mkdir -p /opt/glibc-chroot
# ... setup chroot with glibc libs
```

**For development**, musl is superior:
- Catches undefined behavior earlier
- Static linking actually works (`musl-gcc -static`)
- Smaller containers (`FROM scratch` + static binary)

---

## My Daily Driver Setup

### ThinkPad T490 Config

```bash
# /etc/rc.conf
HARDWARECLOCK="UTC"
TIMEZONE="UTC"
KEYMAP="us"
HOSTNAME="void"

# /etc/conf.d/acpi
acpid_enable="YES"

# ThinkPad specific
sudo xbps-install -S tp_smapi acpi_call thinkfan
```

### Window Manager: sway (Wayland)

```bash
# Minimal, keyboard-driven
sudo xbps-install -S sway waybar wofi grim slurp wl-clipboard
```

```bash
# ~/.config/sway/config
# Mod key = Super (Windows key)
set $mod Mod4

# Terminal
bindsym $mod+Return exec foot

# App launcher
bindsym $mod+d exec wofi --show drun

# Workspaces
bindsym $mod+1 workspace number 1
bindsym $mod+Shift+1 move container to workspace number 1
```

### Development Tools

```bash
# Core
sudo xbps-install -S git neovim rustup go nodejs python3

# LSP servers
rustup component add rust-analyzer
go install golang.org/x/tools/gopls@latest
npm i -g typescript-language-server

# AI/ML
sudo xbps-install -S ollama
# ollama serve &
# ollama pull llama3.1:8b
```

---

## What Broke (And How I Fixed It)

| Issue | Fix |
|-------|-----|
| **Proprietary apps** | Flatpak / chroot |
| **NVIDIA drivers** | `xbps-install nvidia` + kernel headers |
| **Bluetooth** | `bluez` + `bluetuith` (TUI) |
| **WiFi** | `NetworkManager` + `nmcli` / `nmtui` |
| **Docker** | `xbps-install docker` + `usermod -aG docker $USER` |
| **VS Code** | Flatpak + `code --install-extension` |

---

## The Mental Shift

**Before Void**: "How do I configure systemd to start my service?"

**After Void**: "I'll write a 5-line shell script and symlink it."

**Before Void**: "Let me search for a package that does X."

**After Void**: "Let me check the template, add a configure flag, build it."

Void forces you to **understand your system**. There's no magic, no hidden complexity. When something breaks, you read a shell script, not a man page for a binary tool.

---

## Is Void for You?

**Yes, if:**
- You want to understand Linux internals
- You prefer shell scripts over declarative configs
- You want musl libc benefits
- You're comfortable debugging boot issues
- You want a rolling release without breaking changes

**No, if:**
- You need proprietary apps to "just work"
- You want GUI tools for everything
- You're not comfortable with CLI
- You need enterprise support

---

## Resources

- **Handbook**: https://docs.voidlinux.org/
- **Package templates**: https://github.com/void-linux/void-packages
- **runit docs**: http://smarden.org/runit/
- **xbps manual**: `man xbps-install`, `man xbps-query`, `man xbps-src`
- **My dotfiles**: https://github.com/DankChamp/dotfiles (Void-specific)

---

*Running Void Linux since 2023 • ThinkPad T490 • musl libc • runit • XBPS*