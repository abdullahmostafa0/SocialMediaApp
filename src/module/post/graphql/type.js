import { GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { userTypes } from "../../user/graphql/type.js";




export const getPostType = new GraphQLObjectType({
    name: "onePost",
    fields: {
        _id: { type: GraphQLID },
        content: { type: GraphQLString },
        likes: { type: new GraphQLList(GraphQLID) },
        //userId: { type: userTypes },
        deletedBy: { type: GraphQLID },
        isDeleted: { type: GraphQLString }
    }
})

export const likePost = new GraphQLObjectType({
    name: "likePost",
    fields: {
        post: { type: getPostType }
    }
})