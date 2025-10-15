from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, Date
from datetime import date


app = Flask(__name__)

class Base(DeclarativeBase):
    pass
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
db = SQLAlchemy(model_class=Base)
db.init_app(app)


class ToDo(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text)
    day: Mapped[date] = mapped_column(Date, nullable=False)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return get_all_todos()

@app.route('/all')
def get_all_todos():
    todos = db.session.execute(db.select(ToDo)).scalars().all()
    return render_template("index.html", all_todos=todos)

@app.route('/add-sample')
def add_sample_todos():
    """Add sample todos for testing"""
    existing = db.session.execute(db.select(ToDo)).scalars().first()
    if not existing:
        sample_todos = [
            ToDo(
                title="Complete Python Project",
                description="Finish the Flask todo application with a beautiful frontend",
                day=date(2025, 10, 25)
            ),
            ToDo(
                title="Learn Tailwind CSS",
                description="Master utility-first CSS framework for modern web design",
                day=date(2025, 10, 23)
            ),
            ToDo(
                title="Deploy Application",
                description="Deploy the todo app to a cloud platform",
                day=date(2025, 10, 30)
            )
        ]
        db.session.add_all(sample_todos)
        db.session.commit()
        return "Sample todos added! <a href='/all'>View all todos</a>"
    return "Todos already exist! <a href='/all'>View all todos</a>"




if __name__ == "__main__":
    app.run(debug=True, port=5000)