import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/logout-button"
import { User, Phone, Mail, FileText, ClipboardList } from "lucide-react"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    new: { label: "Новая", variant: "default" },
    in_progress: { label: "В работе", variant: "secondary" },
    completed: { label: "Выполнено", variant: "outline" },
    cancelled: { label: "Отменено", variant: "destructive" },
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const { data: consultations } = await supabase
        .from("consultation_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const { data: contacts } = await supabase
        .from("contact_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto max-w-4xl px-4 py-10">

                {/* Шапка */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Личный кабинет</h1>
                        <p className="text-muted-foreground mt-1">Ваши заявки и информация</p>
                    </div>
                    <LogoutButton />
                </div>

                {/* Профиль */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Ваш профиль
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{profile?.full_name || "Имя не указано"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{profile?.phone || "Телефон не указан"}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Заявки на консультацию */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Заявки на консультацию
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!consultations || consultations.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Заявок пока нет</p>
                        ) : (
                            <div className="divide-y">
                                {consultations.map((item) => {
                                    const status = statusMap[item.status] ?? statusMap.new
                                    return (
                                        <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium">{item.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{item.phone}</p>
                                                {item.property_type && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.property_type}{item.property_area ? `, ${item.property_area} м²` : ""}
                                                    </p>
                                                )}
                                                {item.message && (
                                                    <p className="text-sm mt-1">{item.message}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(item.created_at).toLocaleDateString("ru-RU")}
                                                </p>
                                            </div>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Контактные обращения */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Контактные обращения
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!contacts || contacts.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Обращений пока нет</p>
                        ) : (
                            <div className="divide-y">
                                {contacts.map((item) => {
                                    const status = statusMap[item.status] ?? statusMap.new
                                    return (
                                        <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium">{item.full_name || item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.phone}</p>
                                                {item.message && (
                                                    <p className="text-sm mt-1">{item.message}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(item.created_at).toLocaleDateString("ru-RU")}
                                                </p>
                                            </div>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}