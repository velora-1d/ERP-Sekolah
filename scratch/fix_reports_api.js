const fs = require('fs');
const file = 'd:/Mahin Project/ERP-Sekolah/src/app/api/reports/[type]/route.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `.where(
            and(
                isNull(generalTransactions.deletedAt),
                eq(generalTransactions.status, "valid")
            )
        )
        .orderBy(desc(generalTransactions.createdAt));`;

const replacement = `.where(
            and(
                isNull(generalTransactions.deletedAt),
                eq(generalTransactions.status, "valid"),
                startDate && endDate ? gte(generalTransactions.transactionDate, startDate.toISOString().split("T")[0]) : undefined,
                startDate && endDate ? lte(generalTransactions.transactionDate, endDate.toISOString().split("T")[0]) : undefined
            )
        )
        .orderBy(desc(generalTransactions.transactionDate));`;

// Use regex to be more flexible with whitespace
const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
const regex = new RegExp(escapedTarget);

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log('Successfully updated.');
} else {
    console.log('Target not found.');
}
