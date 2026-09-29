import * as schema from '../schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import pictureManagerConfig from '../../../config/pictureManagerConfig';


const dbConnection = drizzle(process.env.DATABASE_URL!, { schema });

async function main() {
  console.log('🌱 Starting database seeding...');

  console.log('👥 Seeding users...');
    await dbConnection.insert(schema.usersTable).values([
      {
        username: 'Anawat',
        gmail: 'anawat@example.com',
        password: '$2b$10$hashedpassword1',
        pfp_path: pictureManagerConfig.defaultPath,
      },
      {
        username: 'Insi',
        gmail: 'insi@example.com',
        password: '$2b$10$hashedpassword2',
        pfp_path: pictureManagerConfig.defaultPath,
      },
      {
        username: 'Best',
        gmail: 'best@example.com',
        password: '$2b$10$hashedpassword3',
        pfp_path: pictureManagerConfig.defaultPath,
      },
      {
        username: 'Sukhum',
        gmail: 'sukhum@example.com',
        password: '$2b$10$hashedpassword4',
        pfp_path: pictureManagerConfig.defaultPath,
      },
      {
        username: 'Petch',
        gmail: 'petch@example.com',
        password: '$2b$10$hashedpassword5',
        pfp_path: pictureManagerConfig.defaultPath,
      }
    ]);

    // Seed categories
    console.log('📁 Seeding categories...');
    await dbConnection.insert(schema.categoriesTable).values([
      { category: 'Web' },
      { category: 'Crypto' },
      { category: 'Reverse' },
      { category: 'General' },
      { category: 'Forensics' },
    ]);

    // Seed problems
    console.log('🧩 Seeding problems...');
    await dbConnection.insert(schema.problemsTable).values([
      {
        problem: 'Getting-Started',
        description: 'Find the flag in home directory',
        difficulty: 'Easy',
        score: 97,
        task_definition: "getting-start:1",
        duration_minutes: 60
      }
    ]);

    // Seed problem-category relationships
    console.log('🔗 Seeding problem-category relationships...');
    await dbConnection.insert(schema.problemsToCategoriesTable).values([
      { problem_id: 1, category_id: 4 }
    ]);

    // Seed solved records
    console.log('✅ Seeding solved records...');
    await dbConnection.insert(schema.solvedRecordsTable).values([
      { user_id: 1, problem_id: 1, solve_score: 100 },
      { user_id: 2, problem_id: 1, solve_score: 98 },
      { user_id: 5, problem_id: 1,  solve_score: 99 }
    ]);

    // Seed user likes
    console.log('❤️ Seeding user likes...');
    await dbConnection.insert(schema.usersLikeProblemsTable).values([
      { solve_id: 1, is_like: true },
      { solve_id: 2, is_like: true },
      { solve_id: 3, is_like: false }
    ]);

    // Seed hints
    console.log('💡 Seeding hints...');
    await dbConnection.insert(schema.hintsTable).values([
      { problem_id: 1, hint: "It's right in front of your face" },
      { problem_id: 1, hint: "Try looking in the home directory" }
    ]);

    console.log('✅ Database seeding completed successfully!');
}

  main()
    .then(() => {
      console.log('🎉 All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });