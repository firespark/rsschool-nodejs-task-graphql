import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLList,
    GraphQLInputObjectType,
    GraphQLSchema
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';
import { parse, ResolveTree, simplify } from 'graphql-parse-resolve-info';

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
        memberType: {
            type: new GraphQLNonNull(MemberType),
            async resolve({ memberTypeId }, args, { memberTypeLoader }) {
                return memberTypeLoader.load(memberTypeId);
            },
        },
    }),
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: {
            type: ProfileType,
            resolve: async ({ id }, args, { profileByUserIdLoader }) => {
                return profileByUserIdLoader.load(id);
            },
        },
        posts: {
            type: new GraphQLNonNull(new GraphQLList(PostType)),
            resolve: async ({ id }, args, { postsByAuthorLoader }) => {
                return postsByAuthorLoader.load(id);
            },
        },
        userSubscribedTo: {
            type: new GraphQLNonNull(new GraphQLList(UserType)),
            resolve: async ({ userSubscribedTo }, args, { userLoader }) => {
                return userSubscribedTo.map((subscribtion) => userLoader.load(subscribtion.authorId));
            },
        },
        subscribedToUser: {
            type: new GraphQLNonNull(new GraphQLList(UserType)),
            resolve: async ({ subscribedToUser }, args, { userLoader }) => {
                return subscribedToUser.map((subscribtion) => userLoader.load(subscribtion.subscriberId));
            },
        },
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
            async resolve(parent, { dto }, { prisma }) {
                return prisma.user.create({
                    data: dto,
                });
            },
        },

        createProfile: {
            type: new GraphQLNonNull(ProfileType),
            args: {
                dto: { type: new GraphQLNonNull(CreateProfileInputType) },
            },
            async resolve(parent, { dto }, { prisma }) {
                return prisma.profile.create({
                    data: dto,
                });
            },
        },

        createPost: {
            type: new GraphQLNonNull(PostType),
            args: {
                dto: { type: new GraphQLNonNull(CreatePostInputType) },
            },
            async resolve(parent, { dto }, { prisma }) {
                return prisma.post.create({
                    data: dto,
                });
            },
        },

        changePost: {
            type: new GraphQLNonNull(PostType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangePostInputType) },
            },
            async resolve(parent, { id, dto }, { prisma }) {
                return prisma.post.update({
                    where: { id: id },
                    data: dto,
                });
            },
        },

        changeProfile: {
            type: new GraphQLNonNull(ProfileType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
            },
            async resolve(parent, { id, dto }, { prisma }) {
                return prisma.profile.update({
                    where: { id: id },
                    data: dto,
                });
            },
        },

        changeUser: {
            type: new GraphQLNonNull(UserType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangeUserInputType) },
            },
            async resolve(parent, { id, dto }, { prisma }) {
                return prisma.user.update({
                    where: { id: id },
                    data: dto,
                });
            },
        },

        deleteUser: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { id }, { prisma }) {
                await prisma.user.delete({
                    where: { id: id },
                });

                return "User successfully deleted";
            },
        },

        deletePost: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { id }, { prisma }) {
                await prisma.post.delete({
                    where: { id: id },
                });

                return "Post successfully deleted";
            },
        },

        deleteProfile: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { id }, { prisma }) {
                await prisma.profile.delete({
                    where: { id: id },
                });

                return "Profile successfully deleted";
            },
        },

        subscribeTo: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                userId: { type: new GraphQLNonNull(UUIDType) },
                authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { userId, authorId }, { prisma }) {
                await prisma.subscribersOnAuthors.create({
                    data: {
                        subscriberId: userId,
                        authorId: authorId,
                    },
                });

                return "Subscription created successfully";
            },
        },

        unsubscribeFrom: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                userId: { type: new GraphQLNonNull(UUIDType) },
                authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { userId, authorId }, { prisma }) {
                await prisma.subscribersOnAuthors.delete({
                    where: {
                        subscriberId_authorId: {
                            subscriberId: userId,
                            authorId: authorId,
                        },
                    },
                });
                return "Unsubscribed successfully"
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
            async resolve(parent, args, { prisma, memberTypeLoader }) {
                const memberTypes = await prisma.memberType.findMany();
                memberTypes.forEach((memberType) =>
                    memberTypeLoader.prime(memberType.id, memberType),
                );

                return memberTypes;
            },
        },

        memberType: {
            type: MemberType,
            args: {
                id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
            },
            async resolve(parent, { id }, { memberTypeLoader }) {
                return memberTypeLoader.load(id);
            },
        },

        users: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
            async resolve(parent, args, { prisma, userLoader }, resolveInfo) {
                const parsedInfo = parse(resolveInfo);
                const { fields } = simplify(parsedInfo as ResolveTree, new GraphQLList(UserType));

                const users = await prisma.user.findMany({
                    include: {
                        subscribedToUser: 'subscribedToUser' in fields,
                        userSubscribedTo: 'userSubscribedTo' in fields,
                    },
                });

                users.forEach((user) => {
                    userLoader.prime(user.id, user);
                });

                return users;
            },
        },

        user: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { id }, { userLoader }) {
                return userLoader.load(id);
            },
        },

        posts: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
            async resolve(parent, args, { prisma, postLoader }) {
                const posts = await prisma.post.findMany();
                posts.forEach((post) => {
                    postLoader.prime(post.id, post);
                });

                return posts;
            },
        },

        post: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { id }, { postLoader }) {
                return postLoader.load(id);
            },
        },

        profiles: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
            async resolve(parent, args, { prisma, profileByIdLoader }) {
                const profiles = await prisma.profile.findMany();
                profiles.forEach((profile) => {
                    profileByIdLoader.prime(profile.id, profile);
                });

                return profiles;
            },
        },

        profile: {
            type: ProfileType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, { id }, { profileByIdLoader }) {
                return profileByIdLoader.load(id);
            },
        },
    },
});

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});