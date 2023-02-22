import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import createDebugger from './src/app/debugger';
import * as neo4j from './src/app/neo4j-driver';
import { ogm } from './src/app/server';
// import { appConstants as c } from './app/constants';
// import { hashPassword } from './utils';

const debug = createDebugger('Seeder');
const Business = ogm.model('Business');
const Category = ogm.model('Category');
const User = ogm.model('User');
// const Comment = ogm.model('Comment');

// const defaultEmail = 'admin@admin.com';
// const defaultPassword = 'password';

async function main() {
  debug('Seeding Started');

  await neo4j.neo4jConnect();

  await ogm.init();

  await Promise.all([
    Business,
    Category,
    User,
    // Comment
  ].map((m) => m.delete({})));

  const categoryArray = Array();
  for (let i = 0; i < 5; i++) {
    categoryArray.push([
      // uuidv4(),
      faker.lorem.word()
    ]);
  }

  const usersArray = Array();
  for (let i = 0; i < 5; i++) {
    usersArray.push([faker.internet.userName()]);
  }

  const { categories } = await Category.create({
    input: await Promise.all(
      [...categoryArray].map(async ([name]) => {
        return { name, };
      })
    ),
  });

  const { users } = await User.create({
    input: await Promise.all(
      [...usersArray].map(async ([name]) => {
        return { name, };
      })
    ),
  });

  await Business.create({
    input: categories.map((category) => {
      return {
        name: faker.lorem.word(),
        address: faker.address.streetAddress(),
        city: faker.address.cityName(),
        state: faker.address.state(),
        categories: {
          connect: { where: { node: { categoryId: category.categoryId } } },
        },
        // posts: {
        //   create: new Array(3).fill(null).map(() => ({
        //     node: {
        //       title: faker.lorem.word(),
        //       content: faker.lorem.paragraphs(4),
        //       author: {
        //         connect: { where: { node: { id: category.id } } },
        //       },
        //     },
        //   })),
        // },
      };
    }),
  });



  // await Blog.create({
  //   input: users.map((user) => {
  //     return {
  //       name: faker.lorem.word(),
  //       creator: {
  //         connect: { where: { node: { id: user.id } } },
  //       },
  //       posts: {
  //         create: new Array(3).fill(null).map(() => ({
  //           node: {
  //             title: faker.lorem.word(),
  //             content: faker.lorem.paragraphs(4),
  //             author: {
  //               connect: { where: { node: { id: user.id } } },
  //             },
  //             comments: {
  //               create: new Array(3).fill(null).map(() => {
  //                 const u = users[Math.floor(Math.random() * users.length)];
  //                 return {
  //                   node: {
  //                     content: faker.lorem.paragraph(),
  //                     author: {
  //                       connect: { where: { node: { id: u.id } } },
  //                     },
  //                   },
  //                 };
  //               }),
  //             },
  //           },
  //         })),
  //       },
  //     };
  //   }),
  // });

  await neo4j.neo4jConnect();

  debug('Seeding Finished');
}

main();
