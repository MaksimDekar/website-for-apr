import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FlampWidget } from "@/components/flamp-widget"

async function ReviewsList() {
  const supabase = await createServerClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching reviews:", error)
    return <div className="text-center py-12">Не удалось загрузить отзывы</div>
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Отзывов пока нет</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar>
                <AvatarImage src={review.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">{review.client_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{review.client_name}</h3>
                {review.project_title && <p className="text-sm text-muted-foreground">{review.project_title}</p>}
              </div>
            </div>

            <div className="flex mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                />
              ))}
            </div>

            <div className="relative">
              <Quote className="absolute -top-1 -left-1 w-8 h-8 text-muted opacity-20" />
              <p className="text-sm leading-relaxed pl-6">{review.text}</p>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Отзывы наших клиентов</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Узнайте, что думают о нас те, кто уже доверил нам свои проекты
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
            }
          >
            <FlampWidget companyId="70000001020667161" count={3} />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
