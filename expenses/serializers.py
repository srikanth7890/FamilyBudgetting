from rest_framework import serializers
from .models import Expense, RecurringExpense, ExpenseShare
from budgets.models import Category
from accounts.models import Family


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = serializers.StringRelatedField(read_only=True)
    category = serializers.StringRelatedField(read_only=True)
    family = serializers.StringRelatedField(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    family_id = serializers.IntegerField(write_only=True)
    tag_list = serializers.ReadOnlyField()

    class Meta:
        model = Expense
        fields = (
            'id', 'title', 'description', 'amount', 'category', 'category_id',
            'family', 'family_id', 'paid_by', 'date', 'payment_method',
            'receipt_image', 'tags', 'tag_list', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['paid_by'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = (
            'title', 'description', 'amount', 'category', 'family', 'date',
            'payment_method', 'receipt_image', 'tags'
        )

    def create(self, validated_data):
        validated_data['paid_by'] = self.context['request'].user
        return super().create(validated_data)


class RecurringExpenseSerializer(serializers.ModelSerializer):
    paid_by = serializers.StringRelatedField(read_only=True)
    category = serializers.StringRelatedField(read_only=True)
    family = serializers.StringRelatedField(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    family_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = RecurringExpense
        fields = (
            'id', 'title', 'description', 'amount', 'category', 'category_id',
            'family', 'family_id', 'paid_by', 'frequency', 'start_date',
            'end_date', 'payment_method', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['paid_by'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseShareSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    expense = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ExpenseShare
        fields = ('id', 'expense', 'user', 'amount', 'is_paid', 'paid_at', 'created_at')
        read_only_fields = ('id', 'created_at')

