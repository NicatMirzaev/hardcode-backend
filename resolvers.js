module.exports = db => {
  const resolvers = {
    message: () => db
  }
  return resolvers;
};
