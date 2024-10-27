import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLList,
    GraphQLInputObjectType
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

// Types

const MemberTypeIdEnum = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
        BASIC: { value: MemberTypeId.BASIC },
        BUSINESS: { value: MemberTypeId.BUSINESS },
    },
});

const MemberType = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    }),
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        memberType: { type: new GraphQLNonNull(MemberType) },
    }),
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: { type: ProfileType },
        posts: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))) },
        userSubscribedTo: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))) },
        subscribedToUser: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))) },
    }),
});


// Input Types

const ChangePostInputType = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: {
        title: { type: GraphQLString },
        content: { type: GraphQLString },
    },
});

const ChangeProfileInputType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: {
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        memberTypeId: { type: MemberTypeIdEnum },
    },
});

const ChangeUserInputType = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: {
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
    },
});

const CreatePostInputType = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
    },
});

const CreateProfileInputType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: {
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    },
});

const CreateUserInputType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
    },
});


// Mutations

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

        createUser: {
            type: new GraphQLNonNull(UserType),
            args: {
                dto: { type: new GraphQLNonNull(CreateUserInputType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        createProfile: {
            type: new GraphQLNonNull(ProfileType),
            args: {
                dto: { type: new GraphQLNonNull(CreateProfileInputType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        createPost: {
            type: new GraphQLNonNull(PostType),
            args: {
                dto: { type: new GraphQLNonNull(CreatePostInputType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        changePost: {
            type: new GraphQLNonNull(PostType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangePostInputType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        changeProfile: {
            type: new GraphQLNonNull(ProfileType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        changeUser: {
            type: new GraphQLNonNull(UserType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangeUserInputType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        deleteUser: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        deletePost: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        deleteProfile: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        subscribeTo: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                userId: { type: new GraphQLNonNull(UUIDType) },
                authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

        unsubscribeFrom: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                userId: { type: new GraphQLNonNull(UUIDType) },
                authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                //TODO
            },
        },

    },
});


// Queries

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        memberTypes: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        memberType: {
            type: MemberType,
            args: {
                id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
            },
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        users: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        user: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        posts: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        post: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        profiles: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },

        profile: {
            type: ProfileType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve(parent, args, { prisma }) {
                // TODO
            },
        },
    },
});