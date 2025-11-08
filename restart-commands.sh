#!/bin/bash

# ================================================
#   دستورات ریستارت سرویس و سرور
#   Inventory App - Restart Commands
# ================================================

echo "================================================"
echo "   دستورات ریستارت سرویس و سرور"
echo "================================================"
echo ""

# رنگ‌ها برای خروجی بهتر
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ================================================
# 1. ریستارت سرویس PM2 (اپلیکیشن)
# ================================================
echo -e "${GREEN}1. ریستارت سرویس PM2 (اپلیکیشن اصلی):${NC}"
echo ""
echo "   # ریستارت همه سرویس‌های PM2:"
echo "   pm2 restart all"
echo ""
echo "   # ریستارت سرویس خاص (inventory-app):"
echo "   pm2 restart inventory-app"
echo ""
echo "   # ریستارت با استفاده از ecosystem.config.js:"
echo "   pm2 restart ecosystem.config.js"
echo ""
echo "   # مشاهده وضعیت سرویس‌ها:"
echo "   pm2 status"
echo ""
echo "   # مشاهده لاگ‌ها:"
echo "   pm2 logs inventory-app"
echo ""

# ================================================
# 2. ریستارت سرویس‌های Docker (دیتابیس و Adminer)
# ================================================
echo -e "${GREEN}2. ریستارت سرویس‌های Docker (PostgreSQL و Adminer):${NC}"
echo ""
echo "   # ریستارت همه سرویس‌های Docker Compose:"
echo "   docker compose restart"
echo ""
echo "   # یا با docker-compose (نسخه قدیمی):"
echo "   docker-compose restart"
echo ""
echo "   # ریستارت سرویس خاص (دیتابیس):"
echo "   docker compose restart db"
echo ""
echo "   # ریستارت سرویس خاص (Adminer):"
echo "   docker compose restart adminer"
echo ""
echo "   # مشاهده وضعیت سرویس‌ها:"
echo "   docker compose ps"
echo ""
echo "   # مشاهده لاگ‌ها:"
echo "   docker compose logs -f"
echo ""

# ================================================
# 3. ریستارت کامل (همه سرویس‌ها)
# ================================================
echo -e "${GREEN}3. ریستارت کامل (همه سرویس‌ها):${NC}"
echo ""
echo "   # ریستارت Docker Compose:"
echo "   docker compose restart"
echo ""
echo "   # ریستارت PM2:"
echo "   pm2 restart all"
echo ""
echo "   # یا به صورت یکجا:"
echo "   docker compose restart && pm2 restart all"
echo ""

# ================================================
# 4. ریستارت سرور (سیستم عامل)
# ================================================
echo -e "${YELLOW}4. ریستارت سرور (سیستم عامل):${NC}"
echo ""
echo "   # ریستارت سرور:"
echo "   sudo reboot"
echo ""
echo "   # یا با shutdown:"
echo "   sudo shutdown -r now"
echo ""
echo "   # ریستارت با تاخیر (مثلاً 5 دقیقه):"
echo "   sudo shutdown -r +5"
echo ""
echo "   # لغو ریستارت برنامه‌ریزی شده:"
echo "   sudo shutdown -c"
echo ""

# ================================================
# 5. دستورات مفید دیگر
# ================================================
echo -e "${GREEN}5. دستورات مفید دیگر:${NC}"
echo ""
echo "   # توقف سرویس PM2:"
echo "   pm2 stop all"
echo ""
echo "   # شروع سرویس PM2:"
echo "   pm2 start all"
echo ""
echo "   # توقف سرویس‌های Docker:"
echo "   docker compose stop"
echo ""
echo "   # شروع سرویس‌های Docker:"
echo "   docker compose start"
echo ""
echo "   # مشاهده استفاده از منابع:"
echo "   pm2 monit"
echo ""
echo "   # ذخیره تنظیمات PM2:"
echo "   pm2 save"
echo ""
echo "   # تنظیم startup خودکار PM2:"
echo "   pm2 startup"
echo ""

# ================================================
# 6. اسکریپت ریستارت خودکار
# ================================================
echo -e "${GREEN}6. اسکریپت ریستارت خودکار:${NC}"
echo ""
echo "   برای اجرای ریستارت خودکار، از اسکریپت زیر استفاده کنید:"
echo "   ./restart-all.sh"
echo ""

echo "================================================"
echo "   ✅ دستورات آماده است"
echo "================================================"

