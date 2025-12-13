import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FlampSettings } from "@/components/admin/flamp-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function FlampIntegrationPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/admin/login")
  }

  const { data: settings, error } = await supabase.from("flamp_settings").select("*").single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching Flamp settings:", error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Интеграция с Flamp</h1>
        <p className="text-muted-foreground">Настройте виджет Flamp для автоматического отображения отзывов на сайте</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Виджет Flamp подключен
          </CardTitle>
          <CardDescription>
            Отзывы с Flamp автоматически отображаются на странице /reviews через официальный виджет
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Виджет загружает актуальные отзывы напрямую с Flamp.ru без необходимости ручного импорта. После
                настройки ID компании, виджет автоматически появится на странице отзывов.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/reviews" target="_blank" className="flex items-center gap-2" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
                Посмотреть
              </a>
            </Button>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">Возможности виджета:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Автоматическое обновление отзывов</li>
              <li>✓ Отображение рейтинга и текстов отзывов</li>
              <li>✓ Адаптивный дизайн для всех устройств</li>
              <li>✓ Ссылка на вашу страницу на Flamp</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <FlampSettings settings={settings} />
    </div>
  )
}
