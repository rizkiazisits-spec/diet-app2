"""
Router autentikasi: register & login via Supabase Auth.

Endpoints:
- POST /auth/register  → Daftar pengguna baru
- POST /auth/login     → Login dan dapatkan JWT token
- GET  /auth/me        → Dapatkan profil user yang sedang login
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user, get_supabase_client
from app.database import get_db
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserProfile, UserProfileUpdate

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Daftar pengguna baru",
    description="Membuat akun baru menggunakan Supabase Auth. "
    "Email harus unik dan password minimal 8 karakter.",
)
async def register(payload: RegisterRequest) -> AuthResponse:
    """
    Registrasi pengguna baru via Supabase Auth.

    Args:
        payload: Data registrasi (email + password).

    Returns:
        AuthResponse: Token akses dan data user.

    Raises:
        HTTPException: 400 jika email sudah terdaftar atau input tidak valid.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.auth.sign_up(
            credentials={
                "email": payload.email,
                "password": payload.password,
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registrasi gagal: {str(e)}",
        )

    if response.user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registrasi gagal: tidak dapat membuat user",
        )

    # Cek apakah session tersedia (email confirmation mungkin diaktifkan)
    if response.session is None:
        return AuthResponse(
            access_token="",
            refresh_token="",
            user_id=response.user.id,
            email=response.user.email or payload.email,
        )

    return AuthResponse(
        access_token=response.session.access_token,
        refresh_token=response.session.refresh_token,
        user_id=response.user.id,
        email=response.user.email or payload.email,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login pengguna",
    description="Login menggunakan email dan password. "
    "Mengembalikan JWT token untuk mengakses endpoint yang dilindungi.",
)
async def login(payload: LoginRequest) -> AuthResponse:
    """
    Login pengguna via Supabase Auth.

    Args:
        payload: Data login (email + password).

    Returns:
        AuthResponse: Token akses dan data user.

    Raises:
        HTTPException: 401 jika kredensial salah.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.auth.sign_in_with_password(
            credentials={
                "email": payload.email,
                "password": payload.password,
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login gagal: {str(e)}",
        )

    if response.user is None or response.session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login gagal: kredensial tidak valid",
        )

    return AuthResponse(
        access_token=response.session.access_token,
        refresh_token=response.session.refresh_token,
        user_id=response.user.id,
        email=response.user.email or payload.email,
    )


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Profil pengguna saat ini",
    description="Mengembalikan data profil pengguna yang sedang login. "
    "Memerlukan Bearer token di header Authorization.",
)
async def get_me(current_user: User = Depends(get_current_user)) -> UserProfile:
    """
    Dapatkan profil user yang sedang login.

    Args:
        current_user: User dari dependency get_current_user.

    Returns:
        UserProfile: Data profil pengguna.
    """
    return UserProfile.model_validate(current_user)


@router.put(
    "/profile",
    response_model=UserProfile,
    summary="Update profil pengguna",
    description="Update data profil (berat badan, tinggi badan, umur, jenis kelamin).",
)
async def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    """Update profil user yang sedang login."""
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    await db.flush()
    await db.refresh(current_user)
    return UserProfile.model_validate(current_user)


from pydantic import BaseModel

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post(
    "/refresh",
    response_model=AuthResponse,
    summary="Refresh token akses",
    description="Menggunakan refresh token untuk memperbarui JWT access token yang kedaluwarsa.",
)
async def refresh_token(payload: RefreshRequest) -> AuthResponse:
    """Refresh session menggunakan refresh token."""
    try:
        supabase = get_supabase_client()
        response = supabase.auth.refresh_session(payload.refresh_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Refresh token gagal: {str(e)}",
        )

    if response.session is None or response.user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session tidak valid setelah refresh",
        )

    return AuthResponse(
        access_token=response.session.access_token,
        refresh_token=response.session.refresh_token,
        user_id=response.user.id,
        email=response.user.email or "",
    )
