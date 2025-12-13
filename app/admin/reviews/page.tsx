import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function ReviewsList() {
  const supabase = await createServerClient()

  const { data: reviews, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching reviews:", error)
    return <div>Ошибка загрузки отзывов</div>
  }

  const publishedCount = reviews?.filter((r) => r.is_published).length || 0
  const unpublishedCount = reviews?.filter((r) => !r.is_published).length || 0
  const flampCount = reviews?.filter((r) => r.source === "flamp").length || 0

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Опубликовано</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>На модерации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{unpublishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Из Flamp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{flampCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Все отзывы</CardTitle>
              <CardDescription>Управление отзывами клиентов</CardDescription>
            </div>
            <Link href="/admin/reviews/flamp">
              <Button variant="outline">Интеграция Flamp</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{review.client_name}</h3>
                      {review.project_title && <p className="text-sm text-muted-foreground">{review.project_title}</p>}
                    </div>
                    <div className="flex gap-2">
                      {review.source === "flamp" && <Badge variant="secondary">Flamp</Badge>}
                      <Badge variant={review.is_published ? "default" : "secondary"}>
                        {review.is_published ? "Опубликован" : "На модерации"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                      />
                    ))}
                  </div>

                  <p className="text-sm">{review.text}</p>

                  <div className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleString("ru-RU")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Отзывов пока нет</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminReviewsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Отзывы</h1>
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              </div>
            }
          >
            <ReviewsList />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
