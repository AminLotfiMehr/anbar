#!/bin/bash

echo "================================================"
echo "   سیستم مدیریت موجودی انبار"
echo "================================================"
echo ""

# Check if running in Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⚠️  این اسکریپت برای سرور لینوکس طراحی شده است"
    echo "   برای ویندوز/مک از دستورات دستی استفاده کنید"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 نصب Dependencies..."
    bun install
    echo "✅ Dependencies نصب شد"
    echo ""
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 نصب PM2..."
    npm install -g pm2
    echo "✅ PM2 نصب شد"
    echo ""
fi

echo "🚀 راه‌اندازی Backend Server..."
pm2 delete warehouse-backend 2>/dev/null
pm2 start server.ts --interpreter bun --name warehouse-backend
echo "✅ Backend Server اجرا شد (پورت 3000)"
echo ""

echo "🌐 راه‌اندازی Frontend Server..."
pm2 delete warehouse-frontend 2>/dev/null

# Create start script for Expo
cat > start-expo.sh << 'EOF'
#!/bin/bash
cd /home/$(whoami)/warehouse-app
bunx expo start --web --port 8082 --host 0.0.0.0
EOF

chmod +x start-expo.sh

pm2 start start-expo.sh --name warehouse-frontend
echo "✅ Frontend Server اجرا شد (پورت 8082)"
echo ""

# Save PM2 configuration
pm2 save

echo "================================================"
echo "   ✅ سرورها با موفقیت راه‌اندازی شدند"
echo "================================================"
echo ""
echo "📋 لینک‌های دسترسی:"
echo ""
echo "🔧 Backend API:"
echo "   - داخل شبکه: http://192.168.1.151:3000"
echo "   - خارج شبکه: http://185.120.251.246:3000"
echo ""
echo "📱 Frontend App:"
echo "   - داخل شبکه: http://192.168.1.151:8082"
echo "   - خارج شبکه: http://185.120.251.246:8082"
echo ""
echo "================================================"
echo "   دستورات مفید:"
echo "================================================"
echo ""
echo "📊 مشاهده وضعیت: pm2 list"
echo "📝 مشاهده لاگ‌ها: pm2 logs"
echo "🔄 ری‌استارت: pm2 restart all"
echo "⏹️  متوقف کردن: pm2 stop all"
echo "🗑️  حذف: pm2 delete all"
echo ""
