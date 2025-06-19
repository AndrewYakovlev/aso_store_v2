const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Анализ структуры Excel файла с прайс-листом
 */
function analyzeExcelFile(filePath) {
  console.log('=== АНАЛИЗ ПРАЙС-ЛИСТА ===');
  
  if (!fs.existsSync(filePath)) {
    console.log(`Файл не найден: ${filePath}`);
    return null;
  }

  try {
    // Читаем Excel файл
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log(`Листов в файле: ${sheetNames.length}`);
    console.log(`Названия листов: ${sheetNames.join(', ')}`);

    // Работаем с первым листом
    const firstSheetName = sheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Конвертируем в JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`\n=== ЛИСТ: ${firstSheetName} ===`);
    console.log(`Количество строк: ${data.length}`);
    
    if (data.length === 0) {
      console.log('Файл пустой');
      return null;
    }

    // Анализируем колонки
    const columns = Object.keys(data[0]);
    console.log(`Количество колонок: ${columns.length}`);
    
    console.log('\n=== НАЗВАНИЯ КОЛОНОК ===');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. "${col}"`);
    });

    // Анализируем данные
    console.log('\n=== АНАЛИЗ ДАННЫХ ===');
    columns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== undefined && val !== null && val !== '');
      const uniqueValues = [...new Set(values)];
      
      console.log(`\n${col}:`);
      console.log(`  Заполненных значений: ${values.length}/${data.length} (${(values.length/data.length*100).toFixed(1)}%)`);
      console.log(`  Уникальных значений: ${uniqueValues.length}`);
      
      // Показываем примеры для колонок с разумным количеством уникальных значений
      if (uniqueValues.length <= 20 && uniqueValues.length > 1) {
        console.log(`  Примеры: ${uniqueValues.slice(0, 10).map(v => `"${v}"`).join(', ')}`);
      } else if (uniqueValues.length === 1) {
        console.log(`  Единственное значение: "${uniqueValues[0]}"`);
      }
      
      // Анализ типов данных
      const types = values.map(val => typeof val);
      const uniqueTypes = [...new Set(types)];
      console.log(`  Типы данных: ${uniqueTypes.join(', ')}`);
    });

    console.log('\n=== ПЕРВЫЕ 5 СТРОК ===');
    data.slice(0, 5).forEach((row, index) => {
      console.log(`\nСтрока ${index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: "${value}"`);
      });
    });

    console.log('\n=== ПОСЛЕДНИЕ 5 СТРОК ===');
    data.slice(-5).forEach((row, index) => {
      console.log(`\nСтрока ${data.length - 5 + index + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: "${value}"`);
      });
    });

    return { data, columns, sheetNames };

  } catch (error) {
    console.error('Ошибка при анализе файла:', error);
    return null;
  }
}

// Запускаем анализ
const filePath = '/home/dev/aso_store_v2/files/price.xlsx';
const result = analyzeExcelFile(filePath);

if (result) {
  console.log('\n=== РЕКОМЕНДАЦИИ ПО ИМПОРТУ ===');
  console.log('На основе анализа структуры файла можно создать маппинг полей для импорта товаров.');
}