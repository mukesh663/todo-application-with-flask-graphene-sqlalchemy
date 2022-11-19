import graphene

from todo.graphql.mutation import Mutation
from todo.graphql.query import Query

schema = graphene.Schema(query=Query, mutation=Mutation)