"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { ExternalLink } from "lucide-react"

interface FlampSettingsProps {
  settings: any
}

export function FlampSettings({ settings: initialSettings }: FlampSettingsProps) {
  const [settings, setSettings] = useState(initialSettings || {})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (initialSettings?.id) {
        const { error } = await supabase
          .from("flamp_settings")
          .update({
            company_id: settings.company_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialSettings.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("flamp_settings").insert({
          company_id: settings.company_id,
          company_flamp_url: `https://novosibirsk.flamp.ru/firm/absolyutprofremont_remontno_otdelochnaya_kompaniya-${settings.company_id}`,
        })

        if (error) throw error
      }

      toast({
        title: "Настройки сохранены",
        description: "ID компании Flamp успешно обновлен. Виджет отобразится на странице отзывов.",
      })
    } catch (error) {
      console.error("[v0] Error saving Flamp settings:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const companyUrl = settings.company_id
    ? `https://novosibirsk.flamp.ru/firm/absolyutprofremont_remontno_otdelochnaya_kompaniya-${settings.company_id}`
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки Flamp</CardTitle>
        <CardDescription>Укажите ID вашей компании на Flamp для отображения виджета с отзывами</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-id">ID компании на Flamp</Label>
          <Input
            id="company-id"
            placeholder="70000001020667161"
            value={settings.company_id || ""}
            onChange={(e) => setSettings({ ...settings, company_id: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Найдите ID в коде виджета Flamp или в URL вашей страницы (цифры после названия компании)
          </p>
        </div>

        {companyUrl && (
          <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
            <a href={companyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Открыть страницу компании на Flamp
            </a>
          </Button>
        )}

        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm font-medium">Как получить ID компании:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Откройте страницу вашей компании на Flamp.ru</li>
            <li>Нажмите "Получить виджет" или найдите код виджета</li>
            <li>Скопируйте числовой ID из атрибута data-flamp-widget-id</li>
            <li>Вставьте ID в поле выше</li>
          </ol>
        </div>

        <Button onClick={handleSave} disabled={isLoading || !settings.company_id} className="w-full">
          {isLoading ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </CardContent>
    </Card>
  )
}
