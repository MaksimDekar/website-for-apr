import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/logout-button"
import { User, Phone, Mail, CheckCircle, Clock, Circle, Image as ImageIcon, Video } from "lucide-react"

const projectStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    active: { label: "В работе", variant: "default" },
    paused: { label: "Приостановлен", variant: "secondary" },
    completed: { label: "Завершён", variant: "outline" },
}

const requestStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
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

    const { data: clientProjects } = await supabase
        .from("client_projects")
        .select(`
      *,
      project_stages (
        id, title, order_index, status, started_at, completed_at,
        stage_media (id, file_url, file_type, caption, created_at)
      )
    `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const { data: consultations } = await supabase
        .from("consultation_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto max-w-5xl px-4 py-10">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Личный кабинет</h1>
                        <p className="text-muted-foreground mt-1">{profile?.full_name || user.email}</p>
                    </div>
                    <LogoutButton />
                </div>

                {/* Профиль */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-6">
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
                        </div>
                    </CardContent>
                </Card>

                {/* Трекер ремонта */}
                {clientProjects && clientProjects.length > 0 && (
                    <div className="mb-6 space-y-6">
                        <h2 className="text-xl font-bold">Мои объекты</h2>
                        {clientProjects.map((project) => {
                            const stages = (project.project_stages || []).sort(
                                (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
                            )
                            const totalStages = stages.length
                            const completedStages = stages.filter((s: { status: string }) => s.status === "completed").length
                            const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
                            const projStatus = projectStatusMap[project.status] ?? projectStatusMap.active

                            return (
                                <Card key={project.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>{project.title}</CardTitle>
                                                {project.address && (
                                                    <p className="text-sm text-muted-foreground mt-1">{project.address}</p>
                                                )}
                                            </div>
                                            <Badge variant={projStatus.variant}>{projStatus.label}</Badge>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                                <span>Прогресс</span>
                                                <span>{completedStages} из {totalStages} этапов · {progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {stages.map((stage: {
                                                id: string
                                                title: string
                                                status: "pending" | "in_progress" | "completed"
                                                completed_at: string | null
                                                stage_media: { id: string; file_url: string; file_type: string; caption: string | null }[]
                                            }) => {
                                                const stageMedia = stage.stage_media || []
                                                return (
                                                    <div key={stage.id} className={`rounded-lg border p-4 ${stage.status === "in_progress" ? "border-primary/50 bg-primary/5" :
                                                            stage.status === "completed" ? "border-green-500/30 bg-green-500/5" :
                                                                "border-border"
                                                        }`}>
                                                        <div className="flex items-center gap-3">
                                                            {stage.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                                                            {stage.status === "in_progress" && <Clock className="h-5 w-5 text-primary shrink-0" />}
                                                            {stage.status === "pending" && <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                                                            <div>
                                                                <span className={`font-medium text-sm ${stage.status === "pending" ? "text-muted-foreground" : ""}`}>
                                                                    {stage.title}
                                                                </span>
                                                                {stage.status === "in_progress" && (
                                                                    <span className="ml-2 text-xs text-primary">· Выполняется сейчас</span>
                                                                )}
                                                                {stage.status === "completed" && stage.completed_at && (
                                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                                        · {new Date(stage.completed_at).toLocaleDateString("ru-RU")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {stageMedia.length > 0 && (
                                                            <div className="grid grid-cols-4 gap-2 mt-3">
                                                                {stageMedia.map((file) => (
                                                                    <div key={file.id}>
                                                                        {file.file_type === "photo" ? (
                                                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                                                <div className="relative">
                                                                                    <img
                                                                                        src={file.file_url}
                                                                                        alt={file.caption || ""}
                                                                                        className="w-full h-20 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                                                                    />
                                                                                    <div className="absolute top-1 left-1">
                                                                                        <ImageIcon className="h-3 w-3 text-white drop-shadow" />
                                                                                    </div>
                                                                                </div>
                                                                            </a>
                                                                        ) : (
                                                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                                                                <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors">
                                                                                    <Video className="h-6 w-6 text-muted-foreground" />
                                                                                </div>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Заявки */}
                {consultations && consultations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Заявки на консультацию</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {consultations.map((item) => {
                                    const status = requestStatusMap[item.status] ?? requestStatusMap.new
                                    return (
                                        <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-sm">{item.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{item.phone}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(item.created_at).toLocaleDateString("ru-RU")}
                                                </p>
                                            </div>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(!clientProjects || clientProjects.length === 0) && (!consultations || consultations.length === 0) && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-muted-foreground">Пока нет активных проектов и заявок</p>
                            <p className="text-sm text-muted-foreground mt-2">Оставьте заявку на консультацию и мы свяжемся с вами</p>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}