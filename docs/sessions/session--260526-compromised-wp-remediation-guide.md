---
title: "Compromised WordPress Remediation Guide"
date: 2026-05-26
subject: "WordPress Security, Backup Strategy, Staging Workflow"
tags: [wordpress, security, backup, docker, digitalocean, staging]
status: "complete"
type: "session"
---

# Session: Compromised WordPress — Remediation & Backup Strategy

**Date:** 2026-05-26  
**Project:** bressel-- (Bressel Sports)  
**Server:** DigitalOcean Droplet (104.248.157.67)  
**Issue:** WordPress site compromised with malicious code injection

---

## Executive Summary

The live WordPress site at `104.248.157.67` (DigitalOcean SGP1 droplet, 512MB RAM, 10GB disk) was found compromised with:
- Malicious `eval()` code injections in `wp-blog-header.php`
- Unknown child themes installed
- 500 Internal Server Error on all GraphQL requests
- Weak credentials (WP admin: `bressel`/`o(w9Kbo3g((kYO(bFV`)

**Immediate fix:** Switched Astro frontend to use local WordPress Docker instance for development.

---

## Part 1: Safe Backup of Compromised Site

### ⚠️ Critical Principle
**Don't backup malicious code.** A compromised backup is useless. We need to:
1. Identify clean files vs infected files
2. Backup only the database (which *might* be clean)
3. Rebuild the site from known-good sources

### Step 1: SSH into the Server

```bash
ssh root@104.248.157.67
# Password: goatskin741.Cover
```

### Step 2: Identify Malicious Code

**Find recently modified PHP files (likely infected):**
```bash
cd /var/www/html

# Find PHP files modified in last 30 days
find . -name "*.php" -mtime -30 -type f | head -50

# Find files with eval() (classic malware signature)
grep -r "eval(" --include="*.php" | head -20

# Find files with base64_decode (often used with eval)
grep -r "base64_decode" --include="*.php" | head -20
```

**Check these critical files manually:**
```bash
# Check wp-config.php (often targeted)
cat wp-config.php | grep -E "DB_|AUTH_|SECURE_"

# Check theme functions.php
cat wp-content/themes/*/functions.php | grep -E "eval|base64"
```

### Step 3: Backup Database ONLY (Safer than file backup)

```bash
# SSH into server
ssh root@104.248.157.67

# Backup database with mysqldump
mysqldump -u root -p bressel_db > /root/bressel_db_backup_$(date +%Y%m%d).sql
# Password: moleahole

# Download the backup to local machine
# On your local machine:
scp root@104.248.157.67:/root/bressel_db_backup_*.sql ~/Desktop/bressel--/backups/
```

### Step 4: Backup ONLY Known-Good Content

**Don't backup the entire `/var/www/html/` — it's infected. Instead:**

```bash
# On the server, identify what MIGHT be clean:
# 1. WordPress core (re-download fresh later)
# 2. Uploaded media (wp-content/uploads/) - SCAN THESE FIRST
# 3. Your custom theme files (if you have originals)

# Backup uploads directory (but scan for .php files inside!)
cd /var/www/html/wp-content
tar -czf /root/uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Check for PHP files in uploads (shouldn't be there!)
find uploads/ -name "*.php" -type f

# If any PHP files found in uploads, those are malicious. Exclude them:
tar -czf /root/uploads_clean_$(date +%Y%m%d).tar.gz --exclude="*.php" uploads/
```

**Download clean backups:**
```bash
# Local machine
mkdir -p ~/Desktop/bressel--/backups/$(date +%Y%m%d)
scp root@104.248.157.67:/root/uploads_clean_*.tar.gz ~/Desktop/bressel--/backups/$(date +%Y%m%d)/
scp root@104.248.157.67:/root/bressel_db_backup_*.sql ~/Desktop/bressel--/backups/$(date +%Y%m%d)/
```

---

## Part 2: Long-Term Backup Strategy

### Automated Daily Backups (Server-Side)

Create a backup script on the server:

```bash
# SSH into server
ssh root@104.248.157.67

# Create backup directory
mkdir -p /root/backups

# Create backup script
cat > /root/backup-wordpress.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
KEEP_DAYS=7

# Database backup
mysqldump -u root -pmoleahole bressel_db > "$BACKUP_DIR/db_$DATE.sql"

# Files backup (excluding node_modules, cache, etc.)
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" \
    --exclude="wp-content/cache" \
    --exclude="wp-content/debug.log" \
    /var/www/html/wp-content/uploads \
    /var/www/html/wp-content/themes/twentytwentyfour-bressel

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "db_*.sql" -mtime +$KEEP_DAYS -delete
find "$BACKUP_DIR" -name "files_*.tar.gz" -mtime +$KEEP_DAYS -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup-wordpress.sh
```

**Add to cron for daily 2 AM backup:**
```bash
crontab -e
# Add this line:
0 2 * * * /root/backup-wordpress.sh >> /root/backup.log 2>&1
```

### Off-Site Backup (Download to Local)

**Weekly sync script (local machine):**
```bash
# Create local backup script
cat > ~/Desktop/bressel--/scripts/backup-live-site.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="$HOME/Desktop/bressel--/backups/$DATE"
SERVER="root@104.248.157.67"

mkdir -p "$BACKUP_DIR"

echo "Downloading database backup..."
scp "$SERVER:/root/backups/db_*.sql" "$BACKUP_DIR/" 2>/dev/null

echo "Downloading files backup..."
scp "$SERVER:/root/backups/files_*.tar.gz" "$BACKUP_DIR/" 2>/dev/null

echo "Backup synced to $BACKUP_DIR"

# Optional: Sync to cloud storage (rclone, aws s3, etc.)
# rclone copy "$BACKUP_DIR" remote:bressel-backups/
EOF

chmod +x ~/Desktop/bressel--/scripts/backup-live-site.sh
```

---

## Part 3: Local Staging with Docker

### Current Setup (Already Working)

Location: `~/Desktop/bressel--/wp--bressel/`

**Docker Compose services:**
- `db`: MySQL 8.0
- `wordpress`: WordPress latest (port 8080)
- `wp-cli`: WP-CLI tool for management

### Start Local Environment

```bash
cd ~/Desktop/bressel--/wp--bressel
docker compose up -d

# Check status
docker compose ps

# Access:
# Site: http://localhost:8080
# Admin: http://localhost:8080/wp-admin
# User: bressel (set password on first login)
```

### Import Live Database to Local (For Staging)

```bash
# 1. Download live backup (from Part 1)
cd ~/Desktop/bressel--/backups/260526
scp root@104.248.157.67:/root/bressel_db_backup_260526.sql .

# 2. Import into local Docker MySQL
cd ~/Desktop/bressel--/wp--bressel
docker compose exec -T db mysql -u bressel_user -psecurepassword123 bressel_db < ~/Desktop/bressel--/backups/260526/bressel_db_backup_260526.sql

# 3. Update site URLs in database (switch from live to local)
docker compose run --rm wp-cli wp search-replace 'http://104.248.157.67' 'http://localhost:8080' --all-tables
```

### Export Local to Production (When Ready)

```bash
# 1. Export local database
cd ~/Desktop/bressel--/wp--bressel
docker compose exec db mysqldump -u bressel_user -psecurepassword123 bressel_db > local_db_export_$(date +%Y%m%d).sql

# 2. Upload to server
scp local_db_export_*.sql root@104.248.157.67:/root/

# 3. SSH to server and restore (CAUTION: This overwrites live!)
ssh root@104.248.157.67
systemctl stop apache2  # Stop web server during restore
mysql -u root -pmoleahole bressel_db < /root/local_db_export_*.sql
systemctl start apache2

# 4. Update URLs if needed
# (Already correct if you used search-replace before exporting)
```

---

## Part 4: Complete Staging-to-Production Workflow

### Recommended Git-Based Workflow

**Directory structure:**
```
bressel--/
├── wp--bressel/          # Local Docker WordPress (staging)
│   ├── docker-compose.yml
│   ├── theme/            # Custom theme files (version controlled)
│   └── scripts/          # WP-CLI automation
├── baseui--bressel/       # Astro frontend (version controlled)
└── backups/              # Database/file backups
```

### Step 1: Develop Locally

```bash
# Start local WordPress
cd ~/Desktop/bressel--/wp--bressel
docker compose up -d

# Your custom theme is mounted as volume:
# ./theme → /var/www/html/wp-content/themes/twentytwentyfour-bressel

# Edit theme files locally, changes reflect immediately
# Access: http://localhost:8080
```

### Step 2: Test with Astro Frontend

```bash
# In baseui--bressel/.env:
WPGRAPHQL_ENDPOINT=http://localhost:8080/graphql

# Start Astro dev
cd ~/Desktop/bressel--/baseui--bressel
npm run dev
# Access: http://localhost:4321
```

### Step 3: Deploy Theme to Production

**Option A: SCP (Simple)**
```bash
# Sync theme files to live server
scp -r ~/Desktop/bressel--/wp--bressel/theme/* \
  root@104.248.157.67:/var/www/html/wp-content/themes/twentytwentyfour-bressel/
```

**Option B: Git + Deploy Script (Recommended)**
```bash
# Add to wp--bressel/theme/.gitignore:
# .DS_Store
# node_modules
# *.log

# Initialize git in theme directory
cd ~/Desktop/bressel--/wp--bressel/theme
git init
git add .
git commit -m "Initial theme commit"

# Create deploy script
cat > ~/Desktop/bressel--/scripts/deploy-theme.sh << 'EOF'
#!/bin/bash
THEME_DIR="$HOME/Desktop/bressel--/wp--bressel/theme"
SERVER="root@104.248.157.67"
REMOTE_PATH="/var/www/html/wp-content/themes/twentytwentyfour-bressel"

echo "Deploying theme to production..."
rsync -avz --delete "$THEME_DIR/" "$SERVER:$REMOTE_PATH/"
echo "Deploy complete!"
EOF

chmod +x ~/Desktop/bressel--/scripts/deploy-theme.sh
```

### Step 4: Deploy Database Changes

**Use WP-CLI to export/import specific content:**

```bash
# Export specific content types from local
cd ~/Desktop/bressel--/wp--bressel
docker compose run --rm wp-cli wp post list --format=csv > posts.csv
docker compose run --rm wp-cli wp term list category --format=csv > categories.csv

# Import to production
# (Manual process via WP admin, or use WP-CLI on server)
```

---

## Part 5: Security Hardening (For Rebuilt Site)

### 1. Strong Passwords

**Generate strong passwords:**
```bash
# On local machine
openssl rand -base64 24  # For WP admin
openssl rand -base64 32  # For database
```

**Update these files:**
- `wp--bressel/.env` (local Docker)
- `wp--bressel/docker-compose.yml` (local Docker)
- Live server `/var/www/html/wp-config.php` (when rebuilt)

### 2. Disable File Editing in WordPress

Add to `wp-config.php`:
```php
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);  // Also disables plugin installs
```

### 3. Limit Login Attempts

Install Wordfence or use this nginx rule:
```nginx
# In nginx config on live server
limit_req_zone $binary_remote_addr zone=wp_login:10m rate=1r/s;
location = /wp-login.php {
    limit_req zone=wp_login burst=5 nodelay;
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
}
```

### 4. Use SSH Keys Instead of Passwords

```bash
# Generate SSH key locally
ssh-keygen -t ed25519 -C "matsu@bressel"

# Copy to server
ssh-copy-id root@104.248.157.67

# Disable password auth on server (edit /etc/ssh/sshd_config):
# PasswordAuthentication no
# Then: systemctl restart sshd
```

### 5. Regular Security Scans

```bash
# Install Wordfence plugin (manually on rebuilt site)
# Or use WP-CLI to scan:
docker compose run --rm wp-cli wp plugin install wordfence --activate
```

---

## Part 6: Clean Rebuild Checklist

Since the site is compromised, **recommend rebuilding from scratch:**

### On Live Server:
```bash
# 1. Backup database (from Part 1)
# 2. Download uploads folder (scan for malicious files first)
# 3. Reinstall WordPress fresh:
cd /var/www/html
rm -rf *  # DANGER: This deletes everything

# Download fresh WordPress
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
mv wordpress/* .
rmdir wordpress

# Create fresh wp-config.php
cp wp-config-sample.php wp-config.php
# Edit with strong database credentials

# 4. Restore only clean content:
# - Import database backup
# - Upload clean uploads
# - Install fresh copies of themes/plugins (don't copy from old install)
```

### On Local Docker:
```bash
# Stop and remove containers
cd ~/Desktop/bressel--/wp--bressel
docker compose down -v  # -v removes volumes (fresh start)

# Restart with fresh database
docker compose up -d

# Install WP locally via WP-CLI
docker compose run --rm wp-cli wp core install \
  --url="http://localhost:8080" \
  --title="BRESSEL Headless" \
  --admin_user="bressel" \
  --admin_password="STRONG_PASSWORD" \
  --admin_email="bressel@bressel.local"

# Install required plugins (WPGraphQL, etc.)
docker compose run --rm wp-cli wp plugin install wp-graphql --activate
```

---

## Quick Reference: Essential Commands

### Local Docker Management
```bash
cd ~/Desktop/bressel--/wp--bressel

# Start
docker compose up -d

# Stop
docker compose stop

# Restart
docker compose restart

# View logs
docker compose logs -f wordpress

# WP-CLI
docker compose run --rm wp-cli wp <command>

# Shell access
docker compose exec wordpress bash
```

### Backup Commands
```bash
# Quick database backup (live)
ssh root@104.248.157.67 "mysqldump -u root -pmoleahole bressel_db" > backup.sql

# Quick file backup (live uploads only)
scp -r root@104.248.157.67:/var/www/html/wp-content/uploads ~/Desktop/backups/
```

### Sync Commands
```bash
# Deploy theme to live
rsync -avz ~/Desktop/bressel--/wp--bressel/theme/ \
  root@104.248.157.67:/var/www/html/wp-content/themes/twentytwentyfour-bressel/

# Sync uploads from live to local
scp -r root@104.248.157.67:/var/www/html/wp-content/uploads/* \
  ~/Desktop/bressel--/wp--bressel/wp_data/wp-content/uploads/
```

---

## Summary

**Current Status:**
- ✅ Local Docker WordPress running and configured
- ✅ Astro frontend connected to local WordPress
- ⚠️ Live server compromised — needs rebuild

**Next Steps:**
1. Backup database from live server (Part 1)
2. Rebuild live server with fresh WordPress (Part 6)
3. Set up automated backups (Part 2)
4. Use local Docker for staging (Part 3)
5. Deploy via scripts (Part 4)
6. Harden security (Part 5)

**Files Created/Updated:**
- `baseui--bressel/.env` → Points to localhost
- `baseui--bressel/.env.example` → Documents local setup
- `docs/sessions/session--260526-compromised-wp-remediation-guide.md` → This guide

---

**Session Gain:** +2 points (C9: session reports exist)  
**Audit Score Impact:** 26/40 → 28/40 🟠
