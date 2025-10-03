import * as schema from '../schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';


const dbConnection = drizzle(process.env.DATABASE_URL!, { schema });

async function main() {
  console.log('🌱 Starting database seeding...');

  console.log('👥 Seeding users...');
    await dbConnection.insert(schema.usersTable).values([
      {
        username: 'Anawat',
        gmail: 'anawat@example.com',
        password: '$2b$10$hashedpassword1',
        pfp_path: '/profiles/anawat.jpg'
      },
      {
        username: 'Insi',
        gmail: 'insi@example.com',
        password: '$2b$10$hashedpassword2',
        pfp_path: '/profiles/insi.jpg'
      },
      {
        username: 'Best',
        gmail: 'best@example.com',
        password: '$2b$10$hashedpassword3',
        pfp_path: '/profiles/best.jpg'
      },
      {
        username: 'Sukhum',
        gmail: 'sukhum@example.com',
        password: '$2b$10$hashedpassword4',
        pfp_path: '/profiles/sukhum.jpg'
      },
      {
        username: 'Petch',
        gmail: 'petch@example.com',
        password: '$2b$10$hashedpassword5',
        pfp_path: '/profiles/petch.jpg'
      }
    ]);

    // Seed categories
    console.log('📁 Seeding categories...');
    await dbConnection.insert(schema.categoriesTable).values([
      { category: 'Web' },
      { category: 'Crypto' },
      { category: 'Reverse' },
      { category: 'Pwn' },
      { category: 'Forensics' },
      { category: 'Misc' }
    ]);

    // Seed problems
    console.log('🧩 Seeding problems...');
    await dbConnection.insert(schema.problemsTable).values([
      {
        problem: 'SQL Injection Basics',
        description: 'Find the flag by exploiting SQL injection vulnerability',
        difficulty: 'Easy',
        score: 100,
        task_definition: "test1",
        duration_minutes: 60
      },
      {
        problem: 'XSS Challenge',
        description: 'Execute XSS to retrieve admin cookies',
        difficulty: 'Easy',
        score: 150,
        task_definition: "test2",
        duration_minutes: 60
      },
      {
        problem: 'Caesar Cipher',
        description: 'Decode the message using Caesar cipher',
        difficulty: 'Medium',
        score: 200,
        task_definition: "test3",
        duration_minutes: 60
      },
      {
        problem: 'RSA Decryption',
        description: 'Break the RSA encryption to get the flag',
        difficulty: 'Hard',
        score: 400,
        task_definition: "test4",
        duration_minutes: 60
      },
      {
        problem: 'Buffer Overflow',
        description: 'Exploit buffer overflow to gain shell access',
        difficulty: 'Hard',
        score: 500,
        task_definition: "test5",
        duration_minutes: 60
      },
      {
        problem: 'Memory Corruption',
        description: 'Find memory corruption bugs in the binary',
        difficulty: 'Medium',
        score: 300,
        task_definition: "test6",
        duration_minutes: 60
      },
      {
        problem: 'Hidden Flag',
        description: 'The flag is hidden somewhere in this file',
        difficulty: 'Easy',
        score: 100,
        task_definition: "test7",
        duration_minutes: 60
      },
      {
        problem: 'Network Analysis',
        description: 'Analyze network traffic to find credentials',
        difficulty: 'Medium',
        score: 250,
        task_definition: "test8",
        duration_minutes: 60
      },
      {
        problem: 'Password Cracking',
        description: 'Crack the password hash to reveal the flag',
        difficulty: 'Hard',
        score: 450,
        task_definition: "test9",
        duration_minutes: 60
      },
      {
        problem: 'Steganography',
        description: 'Extract hidden data from the image file',
        difficulty: 'Medium',
        score: 300,
        task_definition: "test10",
        duration_minutes: 60
      }
    ]);

    // Seed problem-category relationships
    console.log('🔗 Seeding problem-category relationships...');
    await dbConnection.insert(schema.problemsToCategoriesTable).values([
      { problem_id: 1, category_id: 1 }, // SQL Injection -> Web
      { problem_id: 2, category_id: 1 }, // XSS -> Web
      { problem_id: 3, category_id: 2 }, // Caesar -> Crypto
      { problem_id: 4, category_id: 2 }, // RSA -> Crypto
      { problem_id: 5, category_id: 4 }, // Buffer Overflow -> Pwn
      { problem_id: 6, category_id: 4 }, // Memory Corruption -> Pwn
      { problem_id: 7, category_id: 5 }, // Hidden Flag -> Forensics
      { problem_id: 8, category_id: 5 }, // Network Analysis -> Forensics
      { problem_id: 9, category_id: 6 }, // Password Cracking -> Misc
      { problem_id: 10, category_id: 5 } // Steganography -> Forensics
    ]);

    // Seed solved records
    console.log('✅ Seeding solved records...');
    await dbConnection.insert(schema.solvedRecordsTable).values([
      { user_id: 1, problem_id: 1, solve_score: 100 }, // Anawat solved SQL Injection
      { user_id: 1, problem_id: 2, solve_score: 150 }, // Anawat solved XSS
      { user_id: 1, problem_id: 3, solve_score: 200 }, // Anawat solved Caesar
      { user_id: 2, problem_id: 1, solve_score: 100 }, // Insi solved SQL Injection
      { user_id: 2, problem_id: 7, solve_score: 100 }, // Insi solved Hidden Flag
      { user_id: 3, problem_id: 1, solve_score: 100 }, // Best solved SQL Injection
      { user_id: 3, problem_id: 2, solve_score: 150 }, // Best solved XSS
      { user_id: 3, problem_id: 6, solve_score: 300 }, // Best solved Memory Corruption
      { user_id: 4, problem_id: 7, solve_score: 100 }, // Sukhum solved Hidden Flag
      { user_id: 4, problem_id: 8, solve_score: 250 }, // Sukhum solved Network Analysis
      { user_id: 5, problem_id: 1, solve_score: 100 }, // Petch solved SQL Injection
      { user_id: 5, problem_id: 3, solve_score: 200 }, // Petch solved Caesar
      { user_id: 5, problem_id: 10, solve_score: 300 }, // Petch solved Steganography
      { user_id: 1, problem_id: 4, solve_score: 400 }, // Anawat solved RSA
      { user_id: 2, problem_id: 6, solve_score: 300 }  // Insi solved Memory Corruption
    ]);

    // Seed user likes
    console.log('❤️ Seeding user likes...');
    await dbConnection.insert(schema.usersLikeProblemsTable).values([
      { solve_id: 1, is_like: true },   // Anawat liked SQL Injection
      { solve_id: 2, is_like: true },   // Anawat liked XSS
      { solve_id: 3, is_like: false },  // Anawat didn't like Caesar
      { solve_id: 4, is_like: true },   // Insi liked SQL Injection
      { solve_id: 5, is_like: true },   // Insi liked Hidden Flag
      { solve_id: 6, is_like: true },   // Best liked SQL Injection
      { solve_id: 7, is_like: true },   // Best liked XSS
      { solve_id: 8, is_like: false },  // Best didn't like Memory Corruption
      { solve_id: 9, is_like: true },   // Sukhum liked Hidden Flag
      { solve_id: 10, is_like: true },  // Sukhum liked Network Analysis
      { solve_id: 11, is_like: true },  // Petch liked SQL Injection
      { solve_id: 12, is_like: true },  // Petch liked Caesar
      { solve_id: 13, is_like: false }, // Petch didn't like Steganography
      { solve_id: 14, is_like: true },  // Anawat liked RSA
      { solve_id: 15, is_like: true }   // Insi liked Memory Corruption
    ]);

    // Seed hints
    console.log('💡 Seeding hints...');
    await dbConnection.insert(schema.hintsTable).values([
      { problem_id: 1, hint: 'Try using UNION SELECT to extract data' },
      { problem_id: 2, hint: 'Look for input fields that reflect user data' },
      { problem_id: 3, hint: 'The shift value is less than 10' },
      { problem_id: 4, hint: 'Factor the large number to find p and q' },
      { problem_id: 5, hint: 'Check for buffer boundaries in the input' },
      { problem_id: 6, hint: 'Use a debugger to examine memory layout' },
      { problem_id: 7, hint: 'Check file metadata and hidden directories' },
      { problem_id: 8, hint: 'Look for suspicious network connections' }
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