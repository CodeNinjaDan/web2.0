from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import random
import os

# Database setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "instance", "cafes.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Ensure the instance directory exists
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

class Base(DeclarativeBase):
    pass

class Cafe(Base):
    __tablename__ = "cafe"

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

# Create engine and session
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


app = FastAPI(
    title="Cafe API",
    description="API for managing cafe data",
    version="2.0.0"
)


def init_database():
    """Initialize the database and create tables if they don't exist"""
    try:
        # Check table structure before create_all
        from sqlalchemy import inspect
        inspector = inspect(engine)

        if 'cafe' in inspector.get_table_names():
            print("Table 'cafe' already exists")
            columns = inspector.get_columns('cafe')
            print(f"Existing columns: {[col['name'] for col in columns]}")
        else:
            print("Table 'cafe' does not exist, creation in process...")

        Base.metadata.create_all(bind=engine)

        with SessionLocal() as session:
            count = session.query(Cafe).count()
            print(f"Database initialized successfully. Found {count} cafes in existing database.")

            if count > 0:
                locations = session.query(Cafe.location).distinct().limit(5).all()
                location_names = [loc[0] for loc in locations]
                print(f"Sample locations in database: {', '.join(location_names)}")
            else:
                print("Database is empty. You can add cafes using the /add endpoint.")

    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

# Initialize database on startup
init_database()

def get_db():
    """Get database session with proper cleanup"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


@app.get("/", summary="Welcome message")
def home():
    """Root endpoint returning welcome message"""
    return {"message": "Welcome to the Cafe API", "version": "2.0.0"}

@app.get("/random", response_model=CafeResponse, summary="Get random cafe")
def get_random_cafe(db: Session = Depends(get_db)):
    """Get a random cafe from the database"""
    try:
        # Count total cafes
        cafe_count = db.query(Cafe).count()

        if cafe_count == 0:
            raise HTTPException(
                status_code=404,
                detail="No cafes found in the database! Please add some cafes first."
            )

        # Get random cafe using offset
        random_offset = random.randint(0, cafe_count - 1)
        random_cafe = db.query(Cafe).offset(random_offset).first()

        if not random_cafe:
            raise HTTPException(
                status_code=404,
                detail="Failed to retrieve random cafe"
            )

        return random_cafe

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while getting random cafe: {str(e)}"
        )

@app.get("/all", response_model=List[CafeResponse], summary="Get all cafes")
def get_all_cafes(db: Session = Depends(get_db)):
    """Get all cafes from the database"""
    try:
        cafes = db.query(Cafe).all()
        return cafes

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while retrieving cafes: {str(e)}"
        )

@app.get("/search", response_model=List[CafeResponse], summary="Search cafes by location")
def get_cafe_at_location(
    loc: str = Query(..., description="Location to search for"),
    db: Session = Depends(get_db)
):
    """Search for cafes at a specific location"""
    try:
        # Case-insensitive search
        cafes = db.query(Cafe).filter(Cafe.location.ilike(f"%{loc}%")).all()

        if not cafes:
            raise HTTPException(
                status_code=404,
                detail=f"Sorry, we don't have any cafes at location '{loc}'"
            )

        return cafes

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while searching cafes: {str(e)}"
        )

@app.post("/add", response_model=dict, summary="Add new cafe")
def post_new_cafe(cafe: CafeCreate, db: Session = Depends(get_db)):
    """Add a new cafe to the database"""
    try:
        # Check if cafe with same name already exists
        existing_cafe = db.query(Cafe).filter(Cafe.name == cafe.name).first()
        if existing_cafe:
            raise HTTPException(
                status_code=400,
                detail=f"A cafe with name '{cafe.name}' already exists"
            )

        # Create new cafe
        db_cafe = Cafe(**cafe.model_dump())
        db.add(db_cafe)
        db.commit()
        db.refresh(db_cafe)

        return {
            "success": True,
            "message": f"Successfully added cafe '{cafe.name}'",
            "cafe_id": db_cafe.id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while adding cafe: {str(e)}"
        )

@app.delete("/delete/{cafe_id}", response_model=dict, summary="Delete cafe by ID")
def delete_cafe(cafe_id: int, db: Session = Depends(get_db)):
    """Delete a cafe by its ID"""
    try:
        cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()

        if not cafe:
            raise HTTPException(
                status_code=404,
                detail=f"Cafe with ID {cafe_id} not found"
            )

        cafe_name = cafe.name
        db.delete(cafe)
        db.commit()

        return {
            "success": True,
            "message": f"Successfully deleted cafe '{cafe_name}'"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while deleting cafe: {str(e)}"
        )

@app.patch("/update/{cafe_id}", response_model=CafeResponse, summary="Update cafe by ID")
def update_cafe(cafe_id: int, cafe_update: CafeBase, db: Session = Depends(get_db)):
    """Update a cafe by its ID"""
    try:
        cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()

        if not cafe:
            raise HTTPException(
                status_code=404,
                detail=f"Cafe with ID {cafe_id} not found"
            )

        # Update cafe attributes
        update_data = cafe_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(cafe, field, value)

        db.commit()
        db.refresh(cafe)

        return cafe

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while updating cafe: {str(e)}"
        )


@app.get("/health", summary="Health check")
def health_check():
    """Check if the API is healthy"""
    try:
        with SessionLocal() as db:
            cafe_count = db.query(Cafe).count()
            return {
                "status": "healthy",
                "database": "connected",
                "cafe_count": cafe_count
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
