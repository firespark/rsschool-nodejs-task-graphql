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
        async resolve(parent, args, { prisma }) {
          return await prisma.memberType.findUnique({
            where: { id: parent.memberTypeId }, 
          });
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

            async resolve(parent, args, { prisma }) {
              return await prisma.profile.findUnique({
                where: { userId: parent.id },
              });
            },
          },
          posts: {
            type: new GraphQLNonNull(new GraphQLList(PostType)),

            async resolve(parent, args, { prisma }) {
              return await prisma.post.findMany({
                where: { authorId: parent.id },
              });
            },
          },
          userSubscribedTo: {
            type: new GraphQLNonNull(new GraphQLList(UserType)),

            async resolve(parent, args, { prisma }) {
              const subscribedTo = await prisma.user.findMany({
                where: {
                  subscribedToUser: {
                    some: {
                      subscriberId: parent.id,
                    },
                  },
                },
                include: {
                  subscribedToUser: true,
                },
              });
      
              return subscribedTo;
            },
          },
          subscribedToUser: {
            type: new GraphQLNonNull(new GraphQLList(UserType)),
            
            async resolve(parent, args, { prisma }) {
              const subscribedToUser = await prisma.user.findMany({
                where: {
                  userSubscribedTo: {
                    some: {
                      authorId: parent.id,
                    },
                  },
                },
                include: {
                  userSubscribedTo: true,
                },
              });
      
              return subscribedToUser;
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
            async resolve(parent, args, { prisma }) {
                return prisma.user.create({
                    data: args.dto,
                });
            },
        },

        createProfile: {
            type: new GraphQLNonNull(ProfileType),
            args: {
                dto: { type: new GraphQLNonNull(CreateProfileInputType) },
            },
            async resolve(parent, args, { prisma }) {
                return prisma.profile.create({
                    data: args.dto,
                });
            },
        },

        createPost: {
            type: new GraphQLNonNull(PostType),
            args: {
                dto: { type: new GraphQLNonNull(CreatePostInputType) },
            },
            async resolve(parent, args, { prisma }) {
                return prisma.post.create({
                    data: args.dto,
                });
            },
        },

        changePost: {
            type: new GraphQLNonNull(PostType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangePostInputType) },
            },
            async resolve(parent, args, { prisma }) {
                return prisma.post.update({
                    where: { id: args.id },
                    data: args.dto,
                });
            },
        },

        changeProfile: {
            type: new GraphQLNonNull(ProfileType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
            },
            async resolve(parent, args, { prisma }) {
                return prisma.profile.update({
                    where: { id: args.id },
                    data: args.dto,
                });
            },
        },

        changeUser: {
            type: new GraphQLNonNull(UserType),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
                dto: { type: new GraphQLNonNull(ChangeUserInputType) },
            },
            async resolve(parent, args, { prisma }) {
                return prisma.user.update({
                    where: { id: args.id },
                    data: args.dto,
                });
            },
        },

        deleteUser: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, args, { prisma }) {
                await prisma.user.delete({
                    where: { id: args.id },
                });

                return "User successfully deleted";
            },
        },

        deletePost: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, args, { prisma }) {
                await prisma.post.delete({
                    where: { id: args.id },
                });

                return "Post successfully deleted";
            },
        },

        deleteProfile: {
            type: new GraphQLNonNull(GraphQLString),
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, args, { prisma }) {
                await prisma.profile.delete({
                    where: { id: args.id },
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
            async resolve(parent, args, { prisma }) {
                const { userId, authorId } = args;
            
                const user = await prisma.user.findUnique({ where: { id: userId } });
                const author = await prisma.user.findUnique({ where: { id: authorId } });
            
                if (!user || !author) {
                  //throw new Error('User or Author not found');
                  return null;
                }

                const existingSubscription = await prisma.subscribersOnAuthors.findUnique({
                  where: {
                    subscriberId_authorId: {
                      subscriberId: userId,
                      authorId: authorId,
                    },
                  },
                });
            
                if (existingSubscription) {
                  //throw new Error('User already subscribed to the Author');
                  return null;
                }
            
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
            async resolve(parent, args, { prisma }) {
                await prisma.subscribersOnAuthors.delete({
                    where: {
                        subscriberId_authorId: {
                            subscriberId: args.userId,
                            authorId: args.authorId,
                        },
                    },
                });
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
                return prisma.memberType.findMany();
            },
        },

        memberType: {
            type: MemberType,
            args: {
                id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
            },
            async resolve(parent, args, { prisma }) {
                const memberType = await prisma.memberType.findUnique({
                    where: { id: args.id },
                });

                if (!memberType) {
                    //throw new Error('MemberType not found');
                    return null;
                }

                return memberType;
            },
        },

        users: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
            resolve(parent, args, { prisma }) {
                return prisma.user.findMany();
            },
        },

        user: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, args, { prisma }) {
                const user = await prisma.user.findUnique({
                    where: { id: args.id },
                    include: {
                        profile: {
                          include: {
                            memberType: true, // Загружаем связанный тип членства (memberType)
                          },
                        },
                        posts: true, // Загружаем связанные посты
                      },
                });

                if (!user) {
                    //throw new Error('User not found');
                    return null;
                }

                return user;
            },
        },

        posts: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
            resolve(parent, args, { prisma }) {
                return prisma.post.findMany();
            },
        },

        post: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, args, { prisma }) {
                const post = await prisma.post.findUnique({
                    where: { id: args.id },
                });

                if (!post) {
                    //throw new Error('Post not found');
                    return null;
                }

                return post;
            },
        },

        profiles: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
            resolve(parent, args, { prisma }) {
                return prisma.profile.findMany();
            },
        },

        profile: {
            type: ProfileType,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) },
            },
            async resolve(parent, args, { prisma }) {
                const profile = await prisma.profile.findUnique({
                    where: { id: args.id },
                });

                if (!profile) {
                    //throw new Error('Profile not found');
                    return null;
                }

                return profile;
            },
        },
    },
});

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});