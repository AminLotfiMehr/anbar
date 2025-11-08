from django.db import models


class User(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    username = models.CharField(unique=True, max_length=191)
    password = models.CharField(max_length=191)
    role = models.CharField(max_length=10, choices=[('admin', 'admin'), ('user', 'user')], default='user')
    created_at = models.DateTimeField(db_column='createdAt')

    class Meta:
        managed = False
        db_table = 'User'
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'


class Warehouse(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(db_column='isActive')
    created_at = models.DateTimeField(db_column='createdAt')

    class Meta:
        managed = False
        db_table = 'Warehouse'
        verbose_name = 'انبار'
        verbose_name_plural = 'انبارها'


class Product(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    code = models.CharField(max_length=191)
    name = models.CharField(max_length=255)
    warehouse = models.ForeignKey(Warehouse, db_column='warehouseId', on_delete=models.DO_NOTHING)
    current_stock = models.IntegerField(db_column='currentStock')
    created_at = models.DateTimeField(db_column='createdAt')
    updated_at = models.DateTimeField(db_column='updatedAt')

    class Meta:
        managed = False
        db_table = 'Product'
        verbose_name = 'کالا'
        verbose_name_plural = 'کالاها'


class AuditSession(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    warehouse = models.ForeignKey(Warehouse, db_column='warehouseId', on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20)
    allow_outflow = models.BooleanField(db_column='allowOutflow')
    created_at = models.DateTimeField(db_column='createdAt')
    completed_at = models.DateTimeField(db_column='completedAt', null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'AuditSession'
        verbose_name = 'جلسه حسابرسی'
        verbose_name_plural = 'جلسات حسابرسی'


class Team(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    name = models.CharField(max_length=255)
    warehouse = models.ForeignKey(Warehouse, db_column='warehouseId', on_delete=models.DO_NOTHING)
    member_ids = models.JSONField(db_column='memberIds')
    created_at = models.DateTimeField(db_column='createdAt')

    class Meta:
        managed = False
        db_table = 'Team'
        verbose_name = 'تیم'
        verbose_name_plural = 'تیم‌ها'


class CountSession(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    audit_session = models.ForeignKey(AuditSession, db_column='auditSessionId', on_delete=models.DO_NOTHING)
    team = models.ForeignKey(Team, db_column='teamId', on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(db_column='createdAt')
    completed_at = models.DateTimeField(db_column='completedAt', null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'CountSession'
        verbose_name = 'جلسه شمارش'
        verbose_name_plural = 'جلسات شمارش'


class Transaction(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    product = models.ForeignKey(Product, db_column='productId', on_delete=models.DO_NOTHING)
    product_code = models.CharField(db_column='productCode', max_length=191)
    product_name = models.CharField(db_column='productName', max_length=255)
    warehouse = models.ForeignKey(Warehouse, db_column='warehouseId', on_delete=models.DO_NOTHING)
    type = models.CharField(max_length=20)
    quantity = models.IntegerField()
    previous_stock = models.IntegerField(db_column='previousStock')
    new_stock = models.IntegerField(db_column='newStock')
    user = models.ForeignKey(User, db_column='userId', on_delete=models.DO_NOTHING)
    username = models.CharField(max_length=191)
    audit_session = models.ForeignKey(AuditSession, db_column='auditSessionId', on_delete=models.DO_NOTHING, null=True, blank=True)
    count_session = models.ForeignKey(CountSession, db_column='countSessionId', on_delete=models.DO_NOTHING, null=True, blank=True)
    is_synced = models.BooleanField(db_column='isSynced')
    created_at = models.DateTimeField(db_column='createdAt')

    class Meta:
        managed = False
        db_table = 'Transaction'
        verbose_name = 'تراکنش'
        verbose_name_plural = 'تراکنش‌ها'


class PendingTransaction(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    data = models.JSONField()
    created_at = models.DateTimeField(db_column='createdAt')

    class Meta:
        managed = False
        db_table = 'PendingTransaction'
        verbose_name = 'تراکنش معلق'
        verbose_name_plural = 'تراکنش‌های معلق'
