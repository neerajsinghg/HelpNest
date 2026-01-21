from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse, UserInDB
from app.core.database import db
from app.core.security import get_password_hash, verify_password, create_access_token, jwt
from app.core.config import settings
from jose import JWTError
from bson import ObjectId

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = await db.get_db().users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return UserInDB(**user)

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    print(f"Registering user: {user.email}")
    existing_user = await db.get_db().users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    print("Inserting user into DB...")
    new_user = await db.get_db().users.insert_one(user_dict)
    print(f"User inserted with ID: {new_user.inserted_id}")
    
    created_user = await db.get_db().users.find_one({"_id": new_user.inserted_id})
    print(f"Retrieved created user: {created_user}")
    
    return UserResponse(**created_user)

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.get_db().users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}
