import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
import { Pool } from 'pg';

async function renameTables() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString,
    ssl: false
  });

  const renames = [
    ['web_heroes', 'cms_web_heroes'],
    ['web_posts', 'cms_web_posts'],
    ['web_facilities', 'cms_web_facilities'],
    ['web_achievements', 'cms_web_achievements'],
    ['web_teachers', 'cms_web_teachers'],
    ['web_settings', 'cms_web_settings'],
    ['web_programs', 'cms_web_programs'],
    ['web_stats', 'cms_web_stats'],
  ];

  try {
    for (const [oldName, newName] of renames) {
      console.log(`Renaming ${oldName} to ${newName}...`);
      await pool.query(`ALTER TABLE ${oldName} RENAME TO ${newName}`);
    }
    console.log('✅ All tables renamed successfully!');
  } catch (error) {
    console.error('❌ Failed to rename tables:', error);
  } finally {
    await pool.end();
  }
}

renameTables();
