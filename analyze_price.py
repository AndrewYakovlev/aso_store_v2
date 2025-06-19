#!/usr/bin/env python3
import pandas as pd
import os

def analyze_excel_file(file_path):
    """Анализ структуры Excel файла с прайс-листом"""
    
    if not os.path.exists(file_path):
        print(f"Файл не найден: {file_path}")
        return None
    
    try:
        # Читаем Excel файл
        df = pd.read_excel(file_path)
        
        print("=== АНАЛИЗ ПРАЙС-ЛИСТА ===")
        print(f"Количество строк: {len(df)}")
        print(f"Количество колонок: {len(df.columns)}")
        
        print("\n=== НАЗВАНИЯ КОЛОНОК ===")
        for i, col in enumerate(df.columns):
            print(f"{i+1}. {col}")
        
        print("\n=== ТИПЫ ДАННЫХ ===")
        for col, dtype in df.dtypes.items():
            print(f"{col}: {dtype}")
        
        print("\n=== ПУСТЫЕ ЗНАЧЕНИЯ ===")
        null_counts = df.isnull().sum()
        for col, count in null_counts.items():
            if count > 0:
                print(f"{col}: {count} пустых значений ({count/len(df)*100:.1f}%)")
        
        print("\n=== ПЕРВЫЕ 5 СТРОК ===")
        print(df.head().to_string())
        
        print("\n=== ПОСЛЕДНИЕ 5 СТРОК ===")
        print(df.tail().to_string())
        
        # Анализ уникальных значений в важных колонках
        print("\n=== АНАЛИЗ ДАННЫХ ===")
        for col in df.columns:
            unique_count = df[col].nunique()
            print(f"{col}: {unique_count} уникальных значений")
            
            # Показываем примеры для колонок с разумным количеством уникальных значений
            if 2 <= unique_count <= 20:
                print(f"  Примеры: {list(df[col].dropna().unique()[:10])}")
            elif unique_count == 1:
                print(f"  Единственное значение: {df[col].dropna().iloc[0] if len(df[col].dropna()) > 0 else 'None'}")
        
        return df
        
    except Exception as e:
        print(f"Ошибка при анализе файла: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    file_path = "/home/dev/aso_store_v2/files/price.xlsx"
    df = analyze_excel_file(file_path)