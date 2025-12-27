export const createUserToken = async (db, { userId, token, type, expiresAt }) => {
  return db.userToken.create({
    data: { userId, token, type, expiresAt },
  });
};

export const findUserToken = async (db, {token, type}) => {
  return db.userToken.findUnique({ where: { token, type }, include: { user: true } });
};

export const deleteUserToken = async (db, {token, type}) => {
  return db.userToken.deleteMany({ where: { token, type } });
};