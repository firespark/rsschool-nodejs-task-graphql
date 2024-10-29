import DataLoader from 'dataloader';

export const memberTypeLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: [...ids] } },
    });

    return ids.map((id) => memberTypes.find((type) => id === type.id));
  });
};

export const postLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { id: { in: [...ids] } },
    });

    return ids.map((id) => posts.find((post) => id === post.id));
  });
};

export const postsByAuthorLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...ids] } },
    });

    const authoredPosts = posts.reduce(
      (acc, post) => {
        const key = post.authorId;
        acc[key] = acc[key] ? [...acc[key], post] : [post];
        return acc;
      },
      {},
    );

    return ids.map((id) => authoredPosts[id] || []);
  });
};

export const profileLoader = (prisma, type) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { [type]: { in: [...ids] } },
    });

    return ids.map((id) => profiles.find((profile) => id === profile[type]));
  });
};

export const userLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
      include: {
        subscribedToUser: true,
        userSubscribedTo: true,
      },
    });

    return ids.map((id) => users.find((user) => id === user.id));
  });
};

export const addLoadersToContext = (prisma) => {
  return {
    prisma,
    memberTypeLoader: memberTypeLoader(prisma),
    postsByAuthorLoader: postsByAuthorLoader(prisma),
    postLoader: postLoader(prisma),
    profileByIdLoader: profileLoader(prisma,"id"),
    profileByUserIdLoader: profileLoader(prisma,"userId"),
    userLoader: userLoader(prisma),
  };
};