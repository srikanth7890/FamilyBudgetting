from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Family, FamilyMember


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password_confirm', 'phone', 'date_of_birth')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'phone', 'date_of_birth', 'profile_picture', 'currency', 'created_at')
        read_only_fields = ('id', 'created_at')


class FamilySerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ('id', 'name', 'description', 'created_by', 'member_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()


class FamilyMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    family = FamilySerializer(read_only=True)

    class Meta:
        model = FamilyMember
        fields = ('id', 'user', 'family', 'role', 'joined_at', 'is_active')
        read_only_fields = ('id', 'joined_at')


class FamilyCreateSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ('id', 'name', 'description', 'created_by', 'member_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        family = super().create(validated_data)
        
        # Automatically add the creator as an admin member
        from .models import FamilyMember
        FamilyMember.objects.create(
            family=family,
            user=self.context['request'].user,
            role='admin',
            is_active=True
        )
        
        return family


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')
