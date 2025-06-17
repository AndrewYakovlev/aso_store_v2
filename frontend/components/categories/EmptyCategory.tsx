import { ArchiveBoxIcon } from "@heroicons/react/24/outline"

interface EmptyCategoryProps {
  categoryName: string
}

export default function EmptyCategory({
  categoryName,
}: EmptyCategoryProps) {
  return (
    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
      <div className="text-center">
        <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Нет товаров
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          В категории "{categoryName}" пока нет товаров
        </p>
      </div>
    </div>
  )
}
