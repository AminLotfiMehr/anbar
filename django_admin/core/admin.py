from django.contrib import admin
from . import models

admin.site.site_header = "پنل مدیریت سیستم موجودی"
admin.site.site_title = "پنل مدیریت"
admin.site.index_title = "داشبورد مدیریت"

@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "role", "created_at")
    search_fields = ("username",)

@admin.register(models.Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    search_fields = ("name",)

@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "warehouse", "current_stock")
    search_fields = ("code", "name")
    list_filter = ("warehouse",)

@admin.register(models.Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "warehouse", "created_at")
    search_fields = ("name",)

@admin.register(models.AuditSession)
class AuditSessionAdmin(admin.ModelAdmin):
    list_display = ("name", "warehouse", "status", "allow_outflow")
    list_filter = ("status",)

@admin.register(models.CountSession)
class CountSessionAdmin(admin.ModelAdmin):
    list_display = ("name", "audit_session", "team", "status")
    list_filter = ("status",)

@admin.register(models.Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "product_code", "product_name", "warehouse", "type", "quantity", "created_at")
    search_fields = ("product_code", "product_name", "username")
    list_filter = ("warehouse", "type")

@admin.register(models.PendingTransaction)
class PendingTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")
