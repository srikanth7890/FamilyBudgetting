from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q
from .models import User, Family, FamilyMember
from .serializers import (
    UserRegistrationSerializer, UserSerializer, FamilySerializer,
    FamilyMemberSerializer, FamilyCreateSerializer, LoginSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    logout(request)
    return Response({'message': 'Successfully logged out'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class FamilyListCreateView(generics.ListCreateAPIView):
    """List and create families"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FamilyCreateSerializer
        return FamilySerializer

    def get_queryset(self):
        return Family.objects.filter(
            members__user=self.request.user,
            members__is_active=True
        ).distinct()


class FamilyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Family detail, update, and delete"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return FamilySerializer

    def get_queryset(self):
        return Family.objects.filter(
            members__user=self.request.user,
            members__is_active=True
        ).distinct()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            # Only admin members can update/delete family
            try:
                family = self.get_object()
                member = FamilyMember.objects.filter(
                    family=family,
                    user=self.request.user,
                    role='admin',
                    is_active=True
                ).first()
                if not member:
                    return [permissions.IsAdminUser()]  # This will deny access
            except Exception as e:
                # If family doesn't exist or user doesn't have access, deny permission
                return [permissions.IsAdminUser()]  # This will deny access
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            # If the family doesn't exist, return 404
            if 'DoesNotExist' in str(type(e)) or 'not found' in str(e).lower():
                from rest_framework.response import Response
                from rest_framework import status
                return Response(
                    {'detail': 'Family not found.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            raise e


class FamilyMemberListCreateView(generics.ListCreateAPIView):
    """List and add family members"""
    serializer_class = FamilyMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        family_id = self.kwargs['family_id']
        return FamilyMember.objects.filter(
            family_id=family_id,
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()

    def perform_create(self, serializer):
        family_id = self.kwargs['family_id']
        family = Family.objects.get(id=family_id)
        
        # Check if user is admin of this family
        admin_member = FamilyMember.objects.filter(
            family=family,
            user=self.request.user,
            role='admin',
            is_active=True
        ).first()
        
        if not admin_member:
            raise permissions.PermissionDenied("Only family admins can add members")
        
        serializer.save(family=family)


class FamilyMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Family member detail, update, and remove"""
    serializer_class = FamilyMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        family_id = self.kwargs['family_id']
        return FamilyMember.objects.filter(
            family_id=family_id,
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invite_family_member(request, family_id):
    """Invite a user to join a family by email"""
    try:
        family = Family.objects.get(id=family_id)
        
        # Check if user is admin of this family
        admin_member = FamilyMember.objects.filter(
            family=family,
            user=request.user,
            role='admin',
            is_active=True
        ).first()
        
        if not admin_member:
            return Response(
                {'error': 'Only family admins can invite members'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is already a member
        existing_member = FamilyMember.objects.filter(
            family=family,
            user=user
        ).first()
        
        if existing_member:
            if existing_member.is_active:
                return Response(
                    {'error': 'User is already a member of this family'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Reactivate the member
                existing_member.is_active = True
                existing_member.save()
                return Response({
                    'message': 'User has been re-added to the family',
                    'member': FamilyMemberSerializer(existing_member).data
                })
        
        # Create new family member
        member = FamilyMember.objects.create(
            family=family,
            user=user,
            role='member'
        )
        
        return Response({
            'message': 'User has been added to the family',
            'member': FamilyMemberSerializer(member).data
        }, status=status.HTTP_201_CREATED)
        
    except Family.DoesNotExist:
        return Response(
            {'error': 'Family not found'},
            status=status.HTTP_404_NOT_FOUND
        )