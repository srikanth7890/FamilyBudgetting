from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Budget
from .serializers import CategorySerializer, BudgetSerializer, BudgetCreateSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    """List and create categories for a family"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['family']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Category.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Category detail, update, and delete"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class BudgetListCreateView(generics.ListCreateAPIView):
    """List and create budgets"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['family', 'category', 'period', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'amount', 'start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BudgetCreateSerializer
        return BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Budget detail, update, and delete"""
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class ActiveBudgetListView(generics.ListAPIView):
    """List active budgets for dashboard"""
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.utils import timezone
        today = timezone.now().date()
        
        return Budget.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True,
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).distinct()