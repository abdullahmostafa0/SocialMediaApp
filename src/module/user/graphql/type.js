import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

const imageType = new GraphQLObjectType({
    name: "image",
    fields: {
        secure_url: { type: GraphQLString },
        public_url: { type: GraphQLString }
    }
})

export const userTypes = new GraphQLObjectType({
    name: "user",
    fields: {
        _id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        gender: {
            type: new GraphQLEnumType({
                name: "gender",
                values: {
                    male: { type: GraphQLString },
                    female: { type: GraphQLString }
                }
            })
        },
        provider: { type: GraphQLString },
        isDeleted: { type: GraphQLBoolean },
        image: {
            type: imageType
        },
        coverImage:{type : new GraphQLList(imageType)}
    }
}) 