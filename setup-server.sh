#!/bin/bash
###############################################################################
# نصب خودکار سرور مدیریت انبار - نسخه‌ی نهایی خودکار
# Inventory Management System - Fully Automatic Server Setup
###############################################################################

set -e

# رنگ‌ها
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# بررسی root
if [ "$EUID" -ne 0 ]; then 
    print_error "لطفاً با دسترسی root اجرا کنید: sudo bash setup-server.sh"
    exit 1
fi

PROJECT_DIR="/home/isaco/inventory-app"
PORT=3000
SSH_PORT=2223
APP_NAME="inventory-backend"

echo ""
echo "======================================================================"
echo " 🚀 نصب خودکار سرور مدیریت انبار (Inventory Management System)"
echo "======================================================================"
echo ""

###############################################################################
# مرحله 1: به‌روزرسانی سیستم و نصب ابزارهای پایه
###############################################################################
print_info "در حال به‌روزرسانی پکیج‌های سیستم..."
apt update -y && apt upgrade -y
apt install -y curl git ufw fail2ban
print_success "سیستم و ابزارهای پایه نصب و به‌روز شدند"
echo ""

###############################################################################
# مرحله 2: نصب Node.js
###############################################################################
print_info "در حال نصب Node.js 20 LTS..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    print_info "Node.js قبلاً نصب شده: $(node -v)"
fi
print_success "Node.js آماده است"
echo ""

###############################################################################
# مرحله 3: نصب Bun
###############################################################################
print_info "در حال نصب Bun..."
if ! command -v bun &>/dev/null; then
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo 'export BUN_INSTALL="$HOME/.bun"' >> /etc/profile.d/bun.sh
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /etc/profile.d/bun.sh
    chmod +x /etc/profile.d/bun.sh
else
    print_info "Bun قبلاً نصب شده: $(bun -v)"
fi
print_success "Bun آماده است"
echo ""

###############################################################################
# مرحله 4: نصب PM2
###############################################################################
print_info "در حال نصب PM2..."
if ! command -v pm2 &>/dev/null; then
    npm install -g pm2
else
    print_info "PM2 قبلاً نصب شده: $(pm2 -v)"
fi
print_success "PM2 آماده است"
echo ""

###############################################################################
# مرحله 5: ایجاد پوشه پروژه
###############################################################################
print_info "در حال ایجاد پوشه پروژه..."
mkdir -p "$PROJECT_DIR/logs"
print_success "پوشه پروژه ایجاد شد: $PROJECT_DIR"
echo ""

###############################################################################
# مرحله 6: تنظیم Firewall
###############################################################################
print_info "در حال تنظیم UFW..."
if ! ufw status | grep -q "Status: active"; then
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ${SSH_PORT}/tcp
    ufw allow ${PORT}/tcp
    echo "y" | ufw enable
else
    ufw allow ${SSH_PORT}/tcp
    ufw allow ${PORT}/tcp
fi
print_success "Firewall تنظیم شد"
echo ""

###############################################################################
# مرحله 7: تنظیم PM2
###############################################################################
print_info "در حال ایجاد فایل ecosystem.config.js..."
cat > "$PROJECT_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'bun',
    args: 'run server.ts',
    cwd: '${PROJECT_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF
print_success "فایل ecosystem.config.js ایجاد شد"
echo ""

###############################################################################
# مرحله 8: نصب و فعال‌سازی Fail2Ban
###############################################################################
print_info "در حال فعال‌سازی Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
print_success "Fail2Ban فعال شد"
echo ""

###############################################################################
# مرحله 9: تنظیم اجرای خودکار PM2 بعد از بوت
###############################################################################
print_info "در حال تنظیم autostart برای PM2..."
pm2 startup systemd -u root --hp /root
pm2 save
print_success "PM2 برای بوت خودکار تنظیم شد"
echo ""

###############################################################################
# پایان نصب
###############################################################################
echo ""
echo "======================================================================"
print_success "✅ نصب با موفقیت انجام شد!"
echo "======================================================================"
echo ""
echo "📁 مسیر پروژه: $PROJECT_DIR"
echo "🌐 پورت برنامه: $PORT"
echo ""
echo "بعد از انتقال فایل‌های پروژه، دستورهای زیر را اجرا کن:"
echo ""
echo "  cd $PROJECT_DIR"
echo "  bun install"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo ""
echo "برای مشاهده لاگ‌ها:"
echo "  pm2 logs ${APP_NAME}"
echo ""
echo "======================================================================"
