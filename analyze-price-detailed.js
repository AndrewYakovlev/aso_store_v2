const XLSX = require('xlsx');
const fs = require('fs');

function analyzeExcelDetailed(filePath) {
  console.log('=== ДЕТАЛЬНЫЙ АНАЛИЗ ПРАЙС-ЛИСТА ===');
  
  if (!fs.existsSync(filePath)) {
    console.log(`Файл не найден: ${filePath}`);
    return null;
  }

  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Получаем диапазон данных
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    console.log(`Диапазон данных: ${worksheet['!ref']}`);
    
    // Читаем данные построчно для лучшего понимания структуры
    console.log('\n=== АНАЛИЗ СТРУКТУРЫ ===');
    
    const rows = [];
    for (let R = range.s.r; R <= Math.min(range.e.r, 20); ++R) {
      const row = {};
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({c: C, r: R});
        const cell = worksheet[cell_address];
        if (cell) {
          row[`col_${C}`] = cell.v;
        }
      }
      rows.push(row);
      
      console.log(`Строка ${R + 1}:`, Object.values(row).join(' | '));
    }
    
    // Пытаемся найти строку с заголовками
    console.log('\n=== ПОИСК ЗАГОЛОВКОВ ===');
    let headerRow = -1;
    for (let i = 0; i < rows.length; i++) {
      const values = Object.values(rows[i]).filter(v => v);
      const potentialHeaders = values.map(v => String(v).toLowerCase());
      
      if (potentialHeaders.includes('артикул') || 
          potentialHeaders.includes('номенклатура') ||
          potentialHeaders.includes('цена')) {
        console.log(`Возможная строка заголовков: ${i + 1}`);
        console.log(`Значения: ${values.join(' | ')}`);
        if (headerRow === -1) headerRow = i;
      }
    }
    
    // Парсим данные начиная с найденной строки заголовков
    if (headerRow !== -1) {
      console.log(`\n=== ПАРСИНГ С СТРОКИ ${headerRow + 1} ===`);
      
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        range: headerRow,
        defval: null 
      });
      
      console.log(`Количество записей: ${data.length}`);
      
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log('Колонки:', columns);
        
        // Показываем несколько примеров данных
        console.log('\n=== ПРИМЕРЫ ДАННЫХ ===');
        data.slice(0, 10).forEach((row, index) => {
          console.log(`\nЗапись ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              console.log(`  ${key}: "${value}"`);
            }
          });
        });
        
        return { data, columns, headerRow };
      }
    }
    
    return null;

  } catch (error) {
    console.error('Ошибка при анализе файла:', error);
    return null;
  }
}

// Запускаем детальный анализ
const filePath = '/home/dev/aso_store_v2/files/price.xlsx';
const result = analyzeExcelDetailed(filePath);

if (result) {
  console.log('\n=== НАЙДЕННАЯ СТРУКТУРА ===');
  console.log(`Данных: ${result.data.length} записей`);
  console.log(`Колонки: ${result.columns.join(', ')}`);
  console.log(`Строка заголовков: ${result.headerRow + 1}`);
}