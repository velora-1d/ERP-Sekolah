const fs = require('fs');
const file = 'd:/Mahin Project/ERP-Sekolah/src/app/api/reports/[type]/route.ts';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
for (let i = 180; i < 200; i++) {
    console.log(`${i+1}: |${lines[i]}|`);
}
