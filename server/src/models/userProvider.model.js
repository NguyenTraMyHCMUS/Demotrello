export const createUserProvider = async (db, { userId, authProvider, providerUserId }) => {
  return db.userProvider.create({
    data: {
      userId,
      authProvider,
      providerUserId,
    },
  });
}