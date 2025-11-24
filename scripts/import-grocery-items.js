const fs = require('fs');
const path = require('path');

console.log('🚀 Starting grocery items import...\n');

// Read the cleaned CSV file
const csvPath = path.join(process.cwd(), 'data', 'grocery-items-cleaned.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV manually (skip header)
const lines = csvContent.split('\n').slice(1);
const products = [];

let index = 1;
for (const line of lines) {
  if (!line.trim()) continue;
  
  // Simple CSV parsing (handles quotes)
  const match = line.match(/^"?([^",]+)"?,\s*"?([^"]+)"?$/);
  if (!match) continue;
  
  const [, name, category] = match;
  
  products.push({
    id: `prod-${String(index).padStart(3, '0')}`,
    name: name.trim(),
    category: category.trim(),
    store: 'Not Assigned',
    unit: 'Not Assigned',
    notes: '',
    createdAt: new Date().toISOString()
  });
  
  index++;
}

console.log(`📦 Found ${products.length} products to import\n`);

// Save to products.json
const productsJsonPath = path.join(process.cwd(), 'data', 'products.json');
fs.writeFileSync(
  productsJsonPath,
  JSON.stringify({ products }, null, 2),
  'utf-8'
);

console.log('✅ Import successful!');
console.log(`📝 ${products.length} products saved to data/products.json\n`);

// Show summary by category
const categoryCounts = {};
products.forEach(product => {
  categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
});

console.log('📊 Products by category:');
Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`   ${category}: ${count} items`);
  });

console.log('\n🎉 All done! You can now:');
console.log('   1. Open your app');
console.log('   2. Go to "Add New Items"');
console.log('   3. Assign stores and units to each product');
console.log('\n✨ Happy organizing!\n');

