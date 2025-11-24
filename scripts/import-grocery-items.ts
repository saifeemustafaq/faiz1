import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface Product {
  id: string;
  name: string;
  category: string;
  store: string;
  unit: string;
  notes: string;
  createdAt: string;
}

async function importGroceryItems() {
  console.log('🚀 Starting grocery items import...\n');

  try {
    // Read the cleaned CSV file
    const csvPath = path.join(process.cwd(), 'data', 'grocery-items-cleaned.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📦 Found ${records.length} products to import\n`);

    // Create products array
    const products: Product[] = records.map((record: any, index: number) => ({
      id: `prod-${String(index + 1).padStart(3, '0')}`,
      name: record['Product Name'],
      category: record['Category'],
      store: 'Not Assigned', // User will assign later
      unit: 'Not Assigned',  // User will assign later
      notes: '',
      createdAt: new Date().toISOString()
    }));

    // Save to products.json
    const productsJsonPath = path.join(process.cwd(), 'data', 'products.json');
    await fs.writeFile(
      productsJsonPath,
      JSON.stringify({ products }, null, 2),
      'utf-8'
    );

    console.log('✅ Import successful!');
    console.log(`📝 ${products.length} products saved to data/products.json\n`);

    // Show summary by category
    const categoryCounts: Record<string, number> = {};
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

  } catch (error) {
    console.error('❌ Error importing products:', error);
    process.exit(1);
  }
}

// Run the import
importGroceryItems();

