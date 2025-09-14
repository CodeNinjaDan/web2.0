from fastapi import FastAPI, HTTPException, Query
from fastapi.params import Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import random
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "instance", "cafes.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

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
    has_sockets = Column(Boolean, nullable=False)
    has_toilet = Column(Boolean, nullable=False)
    has_wifi = Column(Boolean, nullable=False)
    can_take_calls = Column(Boolean, nullable=False)
    seats = Column(String, nullable=False)
    coffee_price = Column(String, nullable=True)

    
class CafeBase(BaseModel):
    name: str
    map_url: str
    img_url: str
    location: str
    has_sockets: bool
    has_toilet: bool
    has_wifi: bool
    can_take_calls: bool
    seats: str
    coffee_price: Optional[str] = None

class CafeCreate(CafeBase):
    pass

class CafeResponse(CafeBase):
    id: int

    class Config:
        from_attributes = True

app = FastAPI(title="Cafe API", description="API for managing cafe data")

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM cafes"))
        count = result.scalar()
        print(f"Connected to existing db with {count} cafes")
except Exception as e:
    print(f"Error connecting to db: {e}")


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
    cafe_count = db.query(Cafe).count()
    if cafe_count == 0:
        raise HTTPException(status_code=404, detail="No cafes found! :(")

    random_offset = random.randint(0, cafe_count - 1)
    random_cafe = db.query(Cafe).offset(random_offset).first()

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
    db.add(db_cafe)
    db.commit()
    db.refresh(db_cafe)
    return {"success": "Successfully added the new cafe. :)"}


@app.get("/debug")
def debug_database(db: Session = Depends(get_db)):
    import sqlite3

    # Connect directly to check table structure
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Check if cafes table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cafes';")
    table_exists = cursor.fetchone()
    print(f"Cafes table exists: {table_exists is not None}")

    # Get table schema
    cursor.execute("PRAGMA table_info(cafes);")
    columns = cursor.fetchall()
    print(f"Table columns: {columns}")

    # Count records
    cursor.execute("SELECT COUNT(*) FROM cafes;")
    count = cursor.fetchone()[0]
    print(f"Number of records: {count}")

    # Get a sample record
    cursor.execute("SELECT * FROM cafes LIMIT 1;")
    sample = cursor.fetchone()
    print(f"Sample record: {sample}")

    conn.close()

    return {"table_exists": table_exists is not None, "record_count": count}


@app.get("/debug-files")
def debug_files():
    import glob

    db_files = glob.glob(os.path.join(BASE_DIR, "**", "*.db"), recursive=True)

    return {
        "current_path": DATABASE_PATH,
        "file_exists": os.path.exists(DATABASE_PATH),
        "file_size": os.path.getsize(DATABASE_PATH) if os.path.exists(DATABASE_PATH) else 0,
        "all_db_files": db_files,
        "base_dir": BASE_DIR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
