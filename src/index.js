const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const path = require('path');
const { createWriteStream,existsSync,mkdirSync } = require('fs');

const typeDefs = gql`
  type Query{
          files: [String]
  }
    type Mutation {
         uploadImage(file: Upload!): [String]
    }
`;
const files = [];
const resolvers = {
  Query: {
    files: () =>{
         return files;
    }
  },
  Mutation: {
    uploadImage: async (_, { file }) => {
      const { createReadStream, filename } = await file;

      await new Promise(res =>
        createReadStream()
          .pipe(createWriteStream(path.join(__dirname, "../images", filename)))
          .on("close", res)
      );

      files.unshift(filename);

      return files;
    }
  }
};
existsSync(path.join(__dirname, "../images")) || mkdirSync(path.join(__dirname, "../images"));

const server = new ApolloServer({
  typeDefs,
  resolvers
});
const app = express();
app.use("/images", express.static(path.join(__dirname, "../images")));
server.applyMiddleware({ app });
app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});
