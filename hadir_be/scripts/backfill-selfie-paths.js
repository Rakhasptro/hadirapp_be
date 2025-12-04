const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Scanning attendances for non-public selfieImage values...');
  const rows = await prisma.attendances.findMany();
  let updated = 0;
  for (const r of rows) {
    const img = r.selfieImage || '';
    // Skip if already public path
    if (img.startsWith('/uploads/')) continue;
    // Extract filename from path (handles backslashes and forward slashes)
    const filename = path.basename(img.replace(/\\/g, '/'));
    if (!filename) continue;
    const publicPath = `/uploads/selfies/${filename}`;
    try {
      await prisma.attendances.update({ where: { id: r.id }, data: { selfieImage: publicPath } });
      updated++;
    } catch (err) {
      console.error('Failed to update', r.id, err.message || err);
    }
  }

  console.log(`Updated ${updated} rows.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
