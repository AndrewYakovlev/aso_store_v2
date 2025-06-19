import { ProductImportForm } from "@/components/admin/imports/ProductImportForm"

export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Импорт данных</h1>
        <p className="text-gray-600">
          Загрузка и импорт товаров из Excel файлов
        </p>
      </div>
      
      <ProductImportForm />
    </div>
  )
}