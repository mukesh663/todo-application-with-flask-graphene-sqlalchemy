import graphene

from todo import db
from todo.graphql.object import Todo as Todo
from todo.model import Todo as TodoModel

from datetime import datetime

class TodoMutation(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String(required=True)
        date = graphene.String(required=True)

    id = graphene.Int()
    todo = graphene.Field(lambda: Todo)

    def mutate(self, info, title, description, date):
        date = datetime.strptime(date, '%Y-%m-%d').date()
        todo = TodoModel(title=title, description=description, date=date)

        db.session.add(todo)
        db.session.commit()

        id = todo.id
        return TodoMutation(todo=todo, id=id)

class TodoDelete(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)

    todo = graphene.Field(lambda: Todo)

    def mutate(self, info, id):
        query = Todo.get_query(info)
        todo = query.filter(TodoModel.id == id).first()

        db.session.delete(todo)
        db.session.commit()

        return TodoDelete(todo=todo)

class TodoEdit(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        title = graphene.String(required=True)
        description = graphene.String(required=True)
        date = graphene.String(required=True)

    todo = graphene.Field(lambda: Todo)
    id = graphene.Int()

    def mutate(self, info, id, title, description, date):
        query = Todo.get_query(info)
        todo = query.filter(TodoModel.id == id).first()

        todo.title = title
        todo.description = description
        date = datetime.strptime(date, '%Y-%m-%d').date()
        todo.date = date

        db.session.commit()

        return TodoMutation(todo=todo, id=id)

class Mutation(graphene.ObjectType):
    mutate_todo = TodoMutation.Field()
    delete_todo = TodoDelete.Field()
    edit_todo = TodoEdit.Field()