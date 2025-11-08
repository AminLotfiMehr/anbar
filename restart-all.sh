#!/bin/bash

# ================================================
#   اسکریپت ریستارت کامل سرویس‌ها
#   Inventory App - Complete Restart Script
# ================================================

echo "================================================"
echo "   ریستارت کامل سرویس‌ها"
echo "================================================"
echo ""

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# بررسی اینکه آیا در پوشه پروژه هستیم
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ خطا: فایل docker-compose.yml پیدا نشد${NC}"
    echo "لطفاً این اسکریپت را از پوشه پروژه اجرا کنید"
    exit 1
fi

# 1. ریستارت سرویس‌های Docker
echo -e "${YELLOW}🔄 در حال ریستارت سرویس‌های Docker...${NC}"
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        docker compose restart
    elif docker-compose version &> /dev/null; then
        docker-compose restart
    else
        echo -e "${RED}❌ Docker Compose نصب نشده است${NC}"
    fi
else
    echo -e "${RED}❌ Docker نصب نشده است${NC}"
fi
echo ""

# 2. ریستارت سرویس PM2
echo -e "${YELLOW}🔄 در حال ریستارت سرویس PM2...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo -e "${GREEN}✅ سرویس‌های PM2 ریستارت شدند${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 نصب نشده است - رد شد${NC}"
fi
echo ""

# 3. نمایش وضعیت
echo -e "${GREEN}📊 وضعیت سرویس‌ها:${NC}"
echo ""

if command -v docker &> /dev/null; then
    echo "--- Docker Services ---"
    if docker compose version &> /dev/null; then
        docker compose ps
    elif docker-compose version &> /dev/null; then
        docker-compose ps
    fi
    echo ""
fi

if command -v pm2 &> /dev/null; then
    echo "--- PM2 Services ---"
    pm2 status
    echo ""
fi

echo "================================================"
echo -e "${GREEN}✅ ریستارت کامل انجام شد${NC}"
echo "================================================"

