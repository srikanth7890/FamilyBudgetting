from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    path('families/', views.FamilyListCreateView.as_view(), name='family-list-create'),
    path('families/<int:pk>/', views.FamilyDetailView.as_view(), name='family-detail'),
    
    path('families/<int:family_id>/members/', views.FamilyMemberListCreateView.as_view(), name='family-member-list-create'),
    path('families/<int:family_id>/members/<int:pk>/', views.FamilyMemberDetailView.as_view(), name='family-member-detail'),
    path('families/<int:family_id>/invite/', views.invite_family_member, name='invite-family-member'),
]

