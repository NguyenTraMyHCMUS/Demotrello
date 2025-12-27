export const findUserByEmail = async (db, email) => {
  return await db.user.findUnique({ where: { email } });
};

export const createUser = async (db, { email, fullName, password, avatarUrl = null, isEmailVerified = false }) => {
  return db.user.create({
    data: { email, fullName, password, avatarUrl, isEmailVerified },
  });
};

export const findUserById = async (db, id) => {
  return db.user.findUnique({ where: { id } });
};

export const markUserAsVerified = async (db, {userId}) => {
  return db.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });
}

export const getUserWithOAuthId = async (db, { email, provider }) => {
  return db.user.findFirst({
    where: {
      email,
    },
    include: {
      providers: {
        where: {
          authProvider: provider,
        },
      },
    },
  });
};

export const updateUser = async (db, id, updateData) => {
  return db.user.update({
    where: { id },
    data: updateData,
  });
};