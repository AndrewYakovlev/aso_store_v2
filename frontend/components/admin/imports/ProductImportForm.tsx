"use client"

import { useState, useRef } from "react"
import { importsApi, ImportOptions, ImportPreview, ImportResult } from "@/lib/api/imports"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react"

interface ProductImportFormProps {
  onSuccess?: () => void
}

export function ProductImportForm({ onSuccess }: ProductImportFormProps) {
  const { accessToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'preview' | 'options' | 'result'>('select')
  
  const [options, setOptions] = useState<ImportOptions>({
    updateExisting: true,
    createNew: true,
    autoMatchCategories: true,
    autoMatchBrands: true,
    confidenceThreshold: 70,
    updatePrices: true,
    updateStock: true,
    skipErrors: true,
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreview(null)
      setImportResult(null)
      setError(null)
      setStep('select')
    }
  }

  const handlePreview = async () => {
    if (!selectedFile || !accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      const previewResult = await importsApi.previewProductsImport(selectedFile, accessToken)
      setPreview(previewResult)
      setStep('preview')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при анализе файла')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await importsApi.importProducts(selectedFile, options, accessToken)
      setImportResult(result)
      setStep('result')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при импорте товаров')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setImportResult(null)
    setError(null)
    setStep('select')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
      case 'updated':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      created: "default",
      updated: "secondary", 
      skipped: "outline",
      error: "destructive",
    }
    
    const labels: Record<string, string> = {
      created: "Создан",
      updated: "Обновлен",
      skipped: "Пропущен",
      error: "Ошибка",
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Импорт товаров из Excel</CardTitle>
          <CardDescription>
            Загрузите Excel файл с товарами для автоматического импорта в каталог
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Выбор файла */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Excel файл</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handlePreview}
                  disabled={!selectedFile || isLoading}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {isLoading ? 'Анализ...' : 'Предварительный просмотр'}
                </Button>
              </div>
            </div>
          )}

          {/* Предварительный просмотр */}
          {step === 'preview' && preview && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Предварительный просмотр</h3>
                <Button variant="outline" onClick={handleReset}>
                  Выбрать другой файл
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{preview.totalRecords}</div>
                    <p className="text-sm text-gray-600">Всего записей</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{preview.categoryMatches.length}</div>
                    <p className="text-sm text-gray-600">Найдено категорий</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{preview.brandMatches.length}</div>
                    <p className="text-sm text-gray-600">Найдено брендов</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="products" className="w-full">
                <TabsList>
                  <TabsTrigger value="products">Товары</TabsTrigger>
                  <TabsTrigger value="categories">Категории</TabsTrigger>
                  <TabsTrigger value="brands">Бренды</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Артикул</th>
                            <th className="px-4 py-2 text-left">Название</th>
                            <th className="px-4 py-2 text-left">Цена</th>
                            <th className="px-4 py-2 text-left">Остаток</th>
                            <th className="px-4 py-2 text-left">Категория</th>
                            <th className="px-4 py-2 text-left">Бренд</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.preview.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2 font-mono text-xs">{item.sku}</td>
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2">{item.price} ₽</td>
                              <td className="px-4 py-2">{item.stock}</td>
                              <td className="px-4 py-2">
                                {item.suggestedCategory ? (
                                  <div>
                                    <div className="text-sm">{item.suggestedCategory}</div>
                                    <div className="text-xs text-gray-500">
                                      {item.categoryConfidence}% уверенности
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Не найдена</span>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {item.suggestedBrand ? (
                                  <div>
                                    <div className="text-sm">{item.suggestedBrand}</div>
                                    <div className="text-xs text-gray-500">
                                      {item.brandConfidence}% уверенности
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Не найден</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                  <div className="space-y-2">
                    {preview.categoryMatches.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span>{category.categoryName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{category.count} товаров</span>
                          <Badge variant="outline">{category.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="brands" className="space-y-4">
                  <div className="space-y-2">
                    {preview.brandMatches.map((brand, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span>{brand.brandName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{brand.count} товаров</span>
                          <Badge variant="outline">{brand.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3">
                <Button onClick={() => setStep('options')}>
                  Настроить импорт
                </Button>
                <Button variant="outline" onClick={handleImport} disabled={isLoading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Импортировать сейчас
                </Button>
              </div>
            </div>
          )}

          {/* Настройки импорта */}
          {step === 'options' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Настройки импорта</h3>
                <Button variant="outline" onClick={() => setStep('preview')}>
                  Назад к просмотру
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Основные настройки</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="createNew">Создавать новые товары</Label>
                    <Switch
                      id="createNew"
                      checked={options.createNew}
                      onCheckedChange={checked => setOptions(prev => ({ ...prev, createNew: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="updateExisting">Обновлять существующие</Label>
                    <Switch
                      id="updateExisting"
                      checked={options.updateExisting}
                      onCheckedChange={checked => setOptions(prev => ({ ...prev, updateExisting: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="updatePrices">Обновлять цены</Label>
                    <Switch
                      id="updatePrices"
                      checked={options.updatePrices}
                      onCheckedChange={checked => setOptions(prev => ({ ...prev, updatePrices: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="updateStock">Обновлять остатки</Label>
                    <Switch
                      id="updateStock"
                      checked={options.updateStock}
                      onCheckedChange={checked => setOptions(prev => ({ ...prev, updateStock: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Автоматическое сопоставление</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoMatchCategories">Сопоставлять категории</Label>
                    <Switch
                      id="autoMatchCategories"
                      checked={options.autoMatchCategories}
                      onCheckedChange={checked => setOptions(prev => ({ ...prev, autoMatchCategories: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoMatchBrands">Сопоставлять бренды</Label>
                    <Switch
                      id="autoMatchBrands"
                      checked={options.autoMatchBrands}
                      onCheckedChange={checked => setOptions(prev => ({ ...prev, autoMatchBrands: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidenceThreshold">Уровень уверенности (%)</Label>
                    <Input
                      id="confidenceThreshold"
                      type="number"
                      min="0"
                      max="100"
                      value={options.confidenceThreshold}
                      onChange={e => setOptions(prev => ({ 
                        ...prev, 
                        confidenceThreshold: parseInt(e.target.value) || 70 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleImport} disabled={isLoading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? 'Импорт...' : 'Начать импорт'}
                </Button>
              </div>
            </div>
          )}

          {/* Результат импорта */}
          {step === 'result' && importResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Результат импорта</h3>
                <Button onClick={handleReset}>
                  Новый импорт
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{importResult.createdProducts}</div>
                    <p className="text-sm text-gray-600">Создано</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{importResult.updatedProducts}</div>
                    <p className="text-sm text-gray-600">Обновлено</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">{importResult.skippedRecords}</div>
                    <p className="text-sm text-gray-600">Пропущено</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{importResult.errors}</div>
                    <p className="text-sm text-gray-600">Ошибки</p>
                  </CardContent>
                </Card>
              </div>

              {importResult.errorMessages.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Обнаружены ошибки:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {importResult.errorMessages.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.errorMessages.length > 5 && (
                          <li>И еще {importResult.errorMessages.length - 5} ошибок...</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border">
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">Строка</th>
                        <th className="px-4 py-2 text-left">Артикул</th>
                        <th className="px-4 py-2 text-left">Название</th>
                        <th className="px-4 py-2 text-left">Статус</th>
                        <th className="px-4 py-2 text-left">Результат</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.details.map((detail, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{detail.row}</td>
                          <td className="px-4 py-2 font-mono text-xs">{detail.sku}</td>
                          <td className="px-4 py-2">{detail.name}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(detail.status)}
                              {getStatusBadge(detail.status)}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div>{detail.message}</div>
                            {detail.matchedCategory && (
                              <div className="text-xs text-gray-600">Категория: {detail.matchedCategory}</div>
                            )}
                            {detail.matchedBrand && (
                              <div className="text-xs text-gray-600">Бренд: {detail.matchedBrand}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Ошибки */}
          {error && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-600 mb-2">
                {step === 'preview' ? 'Анализируем файл...' : 'Импортируем товары...'}
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}