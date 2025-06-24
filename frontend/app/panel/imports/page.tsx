import { ProductImportForm } from "@/components/admin/imports/ProductImportForm"

export default function ImportsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
