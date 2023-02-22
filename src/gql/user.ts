export const typeDefs = /* GraphQL */ `
  # custom resolvers
  # type Query {
  # }

  type User {
    userId: ID! @id
    name: String! @unique(constraintName: "UserUniqueName")
    reviews: [Review!]! @relationship(type: "WROTE", direction: OUT)
  }

  extend type User
    @auth(
      rules: [
        { operations: [READ], where: { userId: "$jwt.sub" } }
        { operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }
      ]
    )
`;
