import graphene
from graphene import relay
from todo.graphql.object import Todo as Todo
from todo.model import Todo as TodoModel

class Query(graphene.ObjectType):
    node = relay.Node.Field()

    alltodos = graphene.List(lambda: Todo)
    allids = graphene.List(lambda: graphene.Int)
    todos = graphene.Field(lambda: Todo, id=graphene.Int())

    def resolve_todos(self, info, id=None):
        query = Todo.get_query(info)
        if id:
            query = query.filter(TodoModel.id == id)
        return query.first()

    def resolve_alltodos(self, info):
        query = Todo.get_query(info).all()
        return query

    def resolve_allids(self, info):
        query = Todo.get_query(info).all()
        return [todo.id for todo in query]