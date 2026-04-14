import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDir = path.join(__dirname, 'src', 'app', 'api');

function getAllRoutes(dir, fileList = []) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllRoutes(filePath, fileList);
    } else if (filePath.endsWith('route.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const routes = getAllRoutes(apiDir);
const results = [];

for (const route of routes) {
  const content = fs.readFileSync(route, 'utf-8');
  
  // Only check routes that have a GET method
  if (!content.includes('export async function GET') && !content.includes('export function GET')) continue;

  const relativePath = path.relative(apiDir, route).replace('/route.ts', '').replace('\\route.ts', '');
  
  const hasPaginationParams = content.includes('searchParams.get("page")') || content.includes("searchParams.get('page')");
  const hasPrismaPagination = content.includes('skip:') || content.includes('take:');
  
  // Also check if they get all data via findMany without pagination
  const usesFindMany = content.includes('.findMany(') || content.includes('.find(');

  results.push({
    endpoint: `/api/${relativePath}`,
    file: route,
    hasFindMany: usesFindMany,
    hasPagination: hasPaginationParams || hasPrismaPagination,
  });
}

// Filter only those that return lists (uses findMany) but are missing pagination
const missingPagination = results.filter(r => r.hasFindMany && !r.hasPagination);
const withPagination = results.filter(r => r.hasFindMany && r.hasPagination);

console.log('\n=== ENDPOINTS DENGAN PAGINASI ===');
if (withPagination.length === 0) console.log('(Tidak ada)');
withPagination.forEach(r => console.log(`[V] ${r.endpoint}`));

console.log('\n=== ENDPOINTS TANPA PAGINASI (MEMBUTUHKAN AUDIT) ===');
if (missingPagination.length === 0) console.log('(Semua sudah terpaginasi)');
missingPagination.forEach(r => console.log(`[X] ${r.endpoint}`));
console.log('\n');
