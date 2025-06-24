import { MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ExpertHelpCard() {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <MessageCircle className="w-16 h-16 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Не нашли то, что искали?
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Оставьте запрос в чате и наши эксперты предложат вам несколько 
          подходящих вариантов с доставкой от 1 дня и лучшей ценой
        </p>
        <Button asChild className="gap-2">
          <Link href="/chat">
            <MessageCircle className="w-4 h-4" />
            Открыть чат с экспертом
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}