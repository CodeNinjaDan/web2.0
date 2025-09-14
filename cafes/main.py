from fastapi import FastAPI, HTTPException, Query
from fastapi.params import Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import random


SQLALCHEMY_DATABASE_URL = "sqlite:///.cafes.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Cafe(Base):
    __tablename__ = "cafes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    map_url = Column(String, nullable=False)
    img_url = Column(String, nullable=False)
    location = Column(String, nullable=False)
    seats = Column(String, nullable=False)
    has_toilet = Column(Boolean, nullable=False)
    has_wifi = Column(Boolean, nullable=False)
    has_sockets = Column(Boolean, nullable=False)
    can_take_calls = Column(Boolean, nullable=False)
    coffee_price = Column(String, nullable=True)

    
class CafeBase(BaseModel):
    name: str
    map_url: str
    img_url: str
    location: str
    seats: str
    has_toilet: bool
    has_wifi: bool
    can_take_calls: bool
    coffee_price: Optional[str] = None

class CafeCreate(CafeBase):
    pass

class CafeResponse(CafeBase):
    id: int

    class Config:
        from_attributes = True

app = FastAPI(title="Cafe API", description="API for managing cafe data")

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#API Routes
@app.get("/")
def home():
    return {"message": "Welcome to the Cafe API"}

@app.get("/random", response_model=CafeResponse)
def get_random_cafe(db: Session = Depends(get_db)):
    cafes = db.query(Cafe).all()
    if not cafes:
        raise HTTPException(status_code=404, detail="No cafes found! :(")
    random_cafe = random.choice(cafes)
    return random_cafe

@app.get("/all", response_model=List[CafeResponse])
def get_all_cafes(db: Session = Depends(get_db)):
    cafes = db.query(Cafe).all()
    return cafes

@app.get("/search", response_model=List[CafeResponse])
def get_cafe_at_location(loc: str = Query(..., description="Location to search for"), db: Session = Depends(get_db)):
    cafes = db.query(Cafe).filter(Cafe.location == loc).all()
    if not cafes:
        raise HTTPException(status_code=404, detail="Sorry we dont have a cafe at that location. :(")
    return cafes

@app.post("/add", response_model=dict)
def post_new_cafe(cafe: CafeCreate, db: Session = Depends(get_db)):
    db_cafe = Cafe(**cafe.dict())
    db_add(db_cafe)
    db.commit()
    db.refresh(db_cafe)
    return {"success": "Successfully added the new cafe. :)"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
