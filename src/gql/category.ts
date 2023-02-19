export const typeDefs = /* GraphQL */ `
  # custom resolvers
  # type Query {
  # }

  type Category {
    categoryId: ID! @id
    name: String! @unique(constraintName: "Category_unique_name")
    businesses: [Business!]! @relationship(type: "IN_CATEGORY", direction: IN)
  }
`;
