/**
 * Seed script to populate initial technologies data
 * 
 * Usage:
 * 1. Ensure backend is running
 * 2. Get an admin JWT token from /api/v1/auth/sign-in
 * 3. Run: npx ts-node scripts/seed-technologies.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

interface TechnologyData {
    name: string;
    description?: string;
    category: string;
    displayOrder: number;
    officialUrl?: string;
    iconFileName?: string;
}

const technologies: TechnologyData[] = [
    // Backend
    {
        name: 'Node.js',
        description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        category: 'BACKEND',
        displayOrder: 1,
        officialUrl: 'https://nodejs.org',
        iconFileName: 'nodejs.png',
    },
    {
        name: 'TypeScript',
        description: 'JavaScript with syntax for types',
        category: 'BACKEND',
        displayOrder: 2,
        officialUrl: 'https://www.typescriptlang.org',
        iconFileName: 'typescript.png',
    },
    {
        name: 'NestJS',
        description: 'Progressive Node.js framework for building efficient and scalable server-side applications',
        category: 'BACKEND',
        displayOrder: 3,
        officialUrl: 'https://nestjs.com',
        iconFileName: 'nestjs.png',
    },
    {
        name: 'Express',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        category: 'BACKEND',
        displayOrder: 4,
        officialUrl: 'https://expressjs.com',
        iconFileName: 'express.png',
    },

    // Databases
    {
        name: 'MySQL',
        description: 'Open-source relational database management system',
        category: 'DATABASE',
        displayOrder: 5,
        officialUrl: 'https://www.mysql.com',
        iconFileName: 'mysql.png',
    },
    {
        name: 'PostgreSQL',
        description: 'Powerful, open source object-relational database system',
        category: 'DATABASE',
        displayOrder: 6,
        officialUrl: 'https://www.postgresql.org',
        iconFileName: 'postgres.png',
    },
    {
        name: 'Firebird',
        description: 'Open source SQL relational database management system',
        category: 'DATABASE',
        displayOrder: 7,
        officialUrl: 'https://firebirdsql.org',
        iconFileName: 'firebird.png',
    },

    // ORMs
    {
        name: 'Sequelize',
        description: 'Promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server',
        category: 'ORM',
        displayOrder: 8,
        officialUrl: 'https://sequelize.org',
        iconFileName: 'sequelize.png',
    },
    {
        name: 'TypeORM',
        description: 'ORM that can run in NodeJS and can be used with TypeScript and JavaScript',
        category: 'ORM',
        displayOrder: 9,
        officialUrl: 'https://typeorm.io',
        iconFileName: 'typeorm.png',
    },

    // Infrastructure
    {
        name: 'Docker',
        description: 'Platform for developing, shipping, and running applications in containers',
        category: 'INFRASTRUCTURE',
        displayOrder: 10,
        officialUrl: 'https://www.docker.com',
        iconFileName: 'docker.png',
    },
    {
        name: 'RabbitMQ',
        description: 'Open source message broker software',
        category: 'INFRASTRUCTURE',
        displayOrder: 11,
        officialUrl: 'https://www.rabbitmq.com',
        iconFileName: 'rabbitmq.png',
    },
    {
        name: 'Ubuntu',
        description: 'Open source Debian-based Linux operating system',
        category: 'INFRASTRUCTURE',
        displayOrder: 12,
        officialUrl: 'https://ubuntu.com',
        iconFileName: 'ubuntu.png',
    },
    {
        name: 'PM2',
        description: 'Advanced, production process manager for Node.js',
        category: 'INFRASTRUCTURE',
        displayOrder: 13,
        officialUrl: 'https://pm2.keymetrics.io',
        iconFileName: 'pm2.png',
    },

    // Frontend
    {
        name: 'React',
        description: 'JavaScript library for building user interfaces',
        category: 'FRONTEND',
        displayOrder: 14,
        officialUrl: 'https://reactjs.org',
        iconFileName: 'react.png',
    },
    {
        name: 'Vue.js',
        description: 'Progressive JavaScript framework for building user interfaces',
        category: 'FRONTEND',
        displayOrder: 15,
        officialUrl: 'https://vuejs.org',
        iconFileName: 'vuejs.png',
    },

    // Mobile
    {
        name: 'React Native',
        description: 'Framework for building native apps using React',
        category: 'MOBILE',
        displayOrder: 16,
        officialUrl: 'https://reactnative.dev',
        iconFileName: 'react-native.png',
    },
    {
        name: 'Flutter',
        description: 'Google\'s UI toolkit for building natively compiled applications',
        category: 'MOBILE',
        displayOrder: 17,
        officialUrl: 'https://flutter.dev',
        iconFileName: 'flutter.png',
    },

    // Version Control
    {
        name: 'Git',
        description: 'Distributed version control system',
        category: 'VERSION_CONTROL',
        displayOrder: 18,
        officialUrl: 'https://git-scm.com',
        iconFileName: 'git.png',
    },
];

async function createTechnology(tech: TechnologyData): Promise<any> {
    console.log(`Creating technology: ${tech.name}...`);

    const response = await fetch(`${API_BASE_URL}/technologies`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: tech.name,
            description: tech.description,
            category: tech.category,
            displayOrder: tech.displayOrder,
            officialUrl: tech.officialUrl,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create ${tech.name}: ${error}`);
    }

    const created = await response.json();
    console.log(`✅ Created: ${tech.name} (ID: ${created.id})`);
    return created;
}

async function uploadProfileImage(techId: number, techName: string, iconFileName?: string): Promise<void> {
    if (!iconFileName) {
        console.log(`⏭️  Skipping image for ${techName} (no icon file specified)`);
        return;
    }

    // Path to frontend icons (adjust if needed)
    const iconPath = path.join(__dirname, '../../frontend/public/icons/technologies_and_stacks', iconFileName);

    if (!fs.existsSync(iconPath)) {
        console.log(`⚠️  Icon file not found: ${iconPath}`);
        return;
    }

    console.log(`Uploading profile image for ${techName}...`);

    const formData = new FormData();
    formData.append('profileImage', fs.createReadStream(iconPath));

    const response = await fetch(`${API_BASE_URL}/technologies/${techId}/profile-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        console.log(`⚠️  Failed to upload image for ${techName}: ${error}`);
        return;
    }

    console.log(`✅ Uploaded image for ${techName}`);
}

async function seedTechnologies(): Promise<void> {
    console.log('🌱 Starting technologies seed...\n');

    if (!ADMIN_TOKEN) {
        console.error('❌ Error: ADMIN_TOKEN environment variable is required');
        console.log('\nUsage:');
        console.log('1. Start the backend server');
        console.log('2. Get admin token: POST /api/v1/auth/sign-in');
        console.log('3. Run: ADMIN_TOKEN=your_token npx ts-node scripts/seed-technologies.ts');
        process.exit(1);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const tech of technologies) {
        try {
            const created = await createTechnology(tech);
            await uploadProfileImage(created.id, tech.name, tech.iconFileName);
            successCount++;
        } catch (error) {
            console.error(`❌ Error processing ${tech.name}:`, error);
            errorCount++;
        }
        console.log(''); // Empty line for readability
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('\n✨ Seed completed!');
}

// Run the seed
seedTechnologies().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

