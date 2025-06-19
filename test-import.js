const XLSX = require('xlsx');
const fs = require('fs');

async function testImport() {
  console.log('=== ТЕСТ ИМПОРТА ТОВАРОВ ===');
  
  const filePath = '/home/dev/aso_store_v2/files/price.xlsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('Файл не найден:', filePath);
    return;
  }

  try {
    // Читаем Excel файл
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Читаем данные начиная с 4-й строки
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      range: 3, // Начинаем с строки 4 (индекс 3)
      defval: null 
    });

    console.log(`Всего строк: ${data.length}`);
    
    const products = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Пропускаем строки без артикула или названия
      if (!row['__EMPTY'] || !row['__EMPTY_5']) {
        continue;
      }

      // Пропускаем служебные строки
      if (row['__EMPTY'] === 'RUB' || row['__EMPTY'] === 'Включает НДС' || row['__EMPTY'] === 'Остаток') {
        continue;
      }

      const sku = String(row['__EMPTY']).trim();
      const name = String(row['__EMPTY_5']).trim();
      const stock = parseFloat(String(row['RUB'] || '').replace(/[^\d.-]/g, '')) || 0;
      const price = parseFloat(String(row['__EMPTY_13'] || '').replace(/[^\d.-]/g, '')) || 0;

      // Валидируем обязательные поля
      if (!sku || !name || price <= 0) {
        continue;
      }

      products.push({
        row: i + 4, // Реальный номер строки в Excel
        sku,
        name,
        price,
        stock: Math.max(0, stock),
      });
    }

    console.log(`Валидных товаров: ${products.length}`);
    
    // Показываем первые 10 товаров
    console.log('\n=== ПЕРВЫЕ 10 ТОВАРОВ ===');
    products.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.sku} - ${product.name}`);
      console.log(`   Цена: ${product.price} ₽, Остаток: ${product.stock}`);
      console.log(`   Категория: ${predictCategory(product.name)}`);
      console.log(`   Бренд: ${predictBrand(product.name)}`);
      console.log('');
    });

    // Статистика по категориям
    const categoryStats = {};
    products.forEach(product => {
      const category = predictCategory(product.name);
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    console.log('=== СТАТИСТИКА КАТЕГОРИЙ ===');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`${category}: ${count} товаров`);
      });

    // Статистика по брендам
    const brandStats = {};
    products.forEach(product => {
      const brand = predictBrand(product.name);
      if (brand !== 'Неизвестный') {
        brandStats[brand] = (brandStats[brand] || 0) + 1;
      }
    });

    console.log('\n=== СТАТИСТИКА БРЕНДОВ ===');
    Object.entries(brandStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`${brand}: ${count} товаров`);
      });

  } catch (error) {
    console.error('Ошибка при тестировании импорта:', error);
  }
}

function predictCategory(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('автошина') || lowerName.includes('шина')) return 'Шины';
  if (lowerName.includes('автокамера') || lowerName.includes('камера')) return 'Камеры';
  if (lowerName.includes('автошампунь') || lowerName.includes('шампунь')) return 'Автохимия';
  if (lowerName.includes('эмаль') || lowerName.includes('краска')) return 'Краски и эмали';
  if (lowerName.includes('аккумулятор') || lowerName.includes('батарея')) return 'Аккумуляторы';
  if (lowerName.includes('масло') || lowerName.includes('смазка')) return 'Масла и жидкости';
  if (lowerName.includes('фильтр')) return 'Фильтры';
  if (lowerName.includes('свеча')) return 'Свечи зажигания';
  if (lowerName.includes('лампа') || lowerName.includes('освещение')) return 'Освещение';
  if (lowerName.includes('тормоз') || lowerName.includes('диск') || lowerName.includes('колодка')) return 'Тормозная система';
  
  return 'Общие автозапчасти';
}

function predictBrand(name) {
  const lowerName = name.toLowerCase();
  
  // Проверяем популярные бренды
  const brands = [
    'TYREX', 'КАМА', 'БИ-392', 'FELIX', 'GRASS', 'KUDO', 'DECORIX', 
    'BRAVO', 'MTZ', 'РЗТЗ', 'PRO-3', 'UNIVERSAL'
  ];
  
  for (const brand of brands) {
    if (lowerName.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return 'Неизвестный';
}

// Запускаем тест
testImport();