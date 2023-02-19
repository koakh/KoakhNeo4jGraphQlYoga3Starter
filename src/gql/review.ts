export const typeDefs = /* GraphQL */ `
  # custom resolvers
  # type Query {
  # }

  type Review {
    reviewId: ID!
    stars: Float!
    date: Date!
    text: String
    user: User! @relationship(type: "WROTE", direction: IN)
    business: Business! @relationship(type: "REVIEWS", direction: OUT)
  }

  extend type Review @auth(rules: [{ operations: [CREATE, UPDATE], bind: { user: { userId: "$jwt.sub" } } }])
`;
