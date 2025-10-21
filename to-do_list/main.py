from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, Date, Boolean
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
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return get_all_todos()

@app.route('/all')
def get_all_todos():
    todos = db.session.execute(db.select(ToDo)).scalars().all()
    return render_template("index.html", all_todos=todos)

@app.route('/add', methods=['GET', 'POST'])
def add_todo():
    """Add a new todo"""
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        day_str = request.form.get('day')

        try:
            day = date.fromisoformat(day_str)
        except (ValueError, TypeError):
            day = date.today()

        new_todo = ToDo(
            title=title,
            description=description,
            day=day
        )
        db.session.add(new_todo)
        db.session.commit()
        return redirect(url_for('get_all_todos'))

    return render_template("add.html")

@app.route('/complete/<int:todo_id>')
def complete_todo(todo_id):
    """Mark a todo as completed"""
    todo = db.session.get(ToDo, todo_id)
    if todo:
        todo.completed = not todo.completed
        db.session.commit()
    return redirect(url_for('get_all_todos'))

@app.route('/delete/<int:todo_id>')
def delete_todo(todo_id):
    """Delete a todo permanently"""
    todo = db.session.get(ToDo, todo_id)
    if todo:
        db.session.delete(todo)
        db.session.commit()
    return redirect(url_for('get_all_todos'))




if __name__ == "__main__":
    app.run(debug=True, port=5000)