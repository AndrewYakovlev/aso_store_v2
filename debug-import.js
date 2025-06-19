const XLSX = require('xlsx');
const fs = require('fs');

async function debugImport() {
  console.log('=== ОТЛАДКА ИМПОРТА ===');
  
  const filePath = '/home/dev/aso_store_v2/files/price.xlsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('Файл не найден:', filePath);
    return;
  }

  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Читаем данные начиная с 4-й строки
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      range: 3, // Начинаем с строки 4 (индекс 3)
      defval: null 
    });

    console.log(`Всего строк: ${data.length}`);
    
    // Анализируем первые 10 строк
    console.log('\n=== АНАЛИЗ ПЕРВЫХ 10 СТРОК ===');
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      console.log(`\nСтрока ${i + 1}:`);
      console.log('Артикул:', JSON.stringify(row['Артикул']));
      console.log('Номенклатура:', JSON.stringify(row['Номенклатура']));
      console.log('Остаток (Цена реализации отдела продаж):', JSON.stringify(row['Цена реализации отдела продаж']));
      console.log('Цена (__EMPTY_11):', JSON.stringify(row['__EMPTY_11']));
      console.log('Все ключи:', Object.keys(row));
      
      // Проверяем валидацию
      const sku = row['Артикул'] ? String(row['Артикул']).trim() : '';
      const name = row['Номенклатура'] ? String(row['Номенклатура']).trim() : '';
      const stock = parseFloat(String(row['Цена реализации отдела продаж'] || '').replace(/[^\d.-]/g, '')) || 0;
      const price = parseFloat(String(row['__EMPTY_11'] || '').replace(/[^\d.-]/g, '')) || 0;
      
      console.log('Обработанные значения:');
      console.log('  sku:', sku);
      console.log('  name:', name);
      console.log('  stock:', stock);
      console.log('  price:', price);
      console.log('  валидация пройдена:', !!(sku && name && price > 0));
    }

    // Попробуем найти строки с данными
    console.log('\n=== ПОИСК ВАЛИДНЫХ СТРОК ===');
    let validCount = 0;
    for (let i = 0; i < data.length && validCount < 5; i++) {
      const row = data[i];
      
      const sku = row['Артикул'] ? String(row['Артикул']).trim() : '';
      const name = row['Номенклатура'] ? String(row['Номенклатура']).trim() : '';
      const price = parseFloat(String(row['__EMPTY_11'] || '').replace(/[^\d.-]/g, '')) || 0;
      
      if (sku && name && price > 0 && 
          sku !== 'RUB' && sku !== 'Включает НДС' && sku !== 'Остаток') {
        console.log(`\nВалидная строка ${i + 4}:`);
        console.log(`  ${sku} - ${name} - ${price} ₽`);
        validCount++;
      }
    }

    if (validCount === 0) {
      console.log('Валидных строк не найдено. Проверим альтернативные поля...');
      
      // Анализируем все поля в первых строках
      console.log('\n=== АНАЛИЗ ВСЕХ ПОЛЕЙ ===');
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        console.log(`\nСтрока ${i + 1} - все поля:`);
        Object.entries(row).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            console.log(`  ${key}: "${value}"`);
          }
        });
      }
    }

  } catch (error) {
    console.error('Ошибка при отладке:', error);
  }
}

debugImport();