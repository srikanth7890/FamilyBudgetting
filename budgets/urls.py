from django.urls import path
from . import views

app_name = 'budgets'

urlpatterns = [
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    path('budgets/', views.BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/<int:pk>/', views.BudgetDetailView.as_view(), name='budget-detail'),
    path('budgets/active/', views.ActiveBudgetListView.as_view(), name='active-budget-list'),
]

