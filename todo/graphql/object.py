from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType
from todo.model import Todo as TodoModel

class Todo(SQLAlchemyObjectType):
    class Meta:
        model = TodoModel
        interfaces = (relay.Node,)