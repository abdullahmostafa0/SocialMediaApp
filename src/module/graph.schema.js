import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { postMutation, postQuery } from "./post/graphql/field.js";




export const schema = new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"query",
        fields:{
            ...postQuery
        },
    }),
    mutation : new GraphQLObjectType({
        name:"mutation",
        fields:{
            ...postMutation
        }
    })
})