"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export function ConsultationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || null,
      property_type: (formData.get("property_type") as string) || null,
      property_area: formData.get("property_area") ? Number.parseFloat(formData.get("property_area") as string) : null,
      preferred_date: (formData.get("preferred_date") as string) || null,
      preferred_time: (formData.get("preferred_time") as string) || null,
      message: (formData.get("message") as string) || null,
    }

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from("consultation_requests").insert([data])

      if (insertError) throw insertError

      // 🔴 ОТПРАВКА В TELEGRAM - НАЧАЛО
      try {
        const telegramResponse = await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'consultation',
            name: data.full_name,
            phone: data.phone,
            email: data.email,
            property_type: data.property_type,
            property_area: data.property_area,
            preferred_date: data.preferred_date,
            preferred_time: data.preferred_time,
            message: data.message,
          }),
        })

        const telegramResult = await telegramResponse.json()
        
        if (!telegramResponse.ok) {
          console.error('Ошибка отправки в Telegram:', telegramResult.error)
          // Можно залогировать ошибку, но не показывать пользователю
        } else {
          console.log('✅ Уведомление отправлено в Telegram')
        }
      } catch (telegramError) {
        console.error('Ошибка при отправке в Telegram:', telegramError)
        // Продолжаем выполнение даже при ошибке Telegram
      }
      // 🔴 ОТПРАВКА В TELEGRAM - КОНЕЦ

      setIsSuccess(true)
      ;(e.target as HTMLFormElement).reset()

      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при отправке формы")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cons_full_name">
          Ваше имя <span className="text-destructive">*</span>
        </Label>
        <Input id="cons_full_name" name="full_name" placeholder="Иван Иванов" required disabled={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cons_phone">
            Телефон <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cons_phone"
            name="phone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cons_email">Email</Label>
          <Input id="cons_email" name="email" type="email" placeholder="ivan@example.com" disabled={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property_type">Тип объекта</Label>
          <Input id="property_type" name="property_type" placeholder="Квартира, офис..." disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_area">Площадь (м²)</Label>
          <Input
            id="property_area"
            name="property_area"
            type="number"
            step="0.1"
            placeholder="65"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_date">Предпочтительная дата</Label>
          <Input id="preferred_date" name="preferred_date" type="date" disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_time">Предпочтительное время</Label>
          <Input id="preferred_time" name="preferred_time" type="time" placeholder="14:00" disabled={isLoading} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cons_message">Комментарий</Label>
        <Textarea
          id="cons_message"
          name="message"
          placeholder="Дополнительная информация о вашем проекте..."
          rows={4}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 text-sm rounded-lg border border-green-500/20">
          Спасибо! Заявка на консультацию отправлена. Мы свяжемся с вами в указанное время.
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Отправка...
          </>
        ) : (
          "Заказать консультацию"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
      </p>
    </form>
  )
}
