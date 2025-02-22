import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import * as postResolve from "./resolve.js"
import * as postTypes from "./type.js"

export const postQuery = {
    getOnePost: {
        type: postTypes.getPostType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) }
        },
        resolve: postResolve.getPost
    },
    getAllPosts: {
        type: new GraphQLList(postTypes.getPostType),
        resolve: postResolve.getAllPosts
    }

}

export const postMutation = {
    likePosts: {
        type: postTypes.likePost,
        args: {
            postId: { type: GraphQLID },
            action: { type: new GraphQLNonNull(GraphQLString) },
            authorization: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: postResolve.likePosts,
    }
}