from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Family, FamilyMember


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone', 'date_of_birth', 'profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'family', 'role', 'is_active', 'joined_at')
    list_filter = ('role', 'is_active', 'joined_at')
    search_fields = ('user__first_name', 'user__last_name', 'family__name')
    readonly_fields = ('joined_at',)