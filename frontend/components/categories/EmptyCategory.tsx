import { ArchiveBoxIcon } from "@heroicons/react/24/outline"

interface EmptyCategoryProps {
  categoryName: string
  productCount?: number
}

export default function EmptyCategory({
  categoryName,
  productCount,
}: EmptyCategoryProps) {
  return (
    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12">
      <div className="text-center">
        <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          Товары в категории "{categoryName}"
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {productCount !== undefined && productCount > 0 ? (
            <>
              В этой категории {productCount} товаров. Они скоро появятся на
              сайте.
            </>
          ) : (
            <>В данный момент в этой категории нет товаров.</>
          )}
        </p>
      </div>
    </div>
  )
}
