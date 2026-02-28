"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Pencil } from "lucide-react"

interface EditProfileFormProps {
    userId: string
    initialName: string
    initialPhone: string
}

export function EditProfileForm({ userId, initialName, initialPhone }: EditProfileFormProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(initialName)
    const [phone, setPhone] = useState(initialPhone)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSave = async () => {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ full_name: name, phone })
            .eq("id", userId)

        if (updateError) {
            setError(updateError.message)
        } else {
            setOpen(false)
            router.refresh()
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Редактировать
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Редактировать профиль</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Имя</Label>
                        <Input
                            placeholder="Иван Иванов"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Input
                            type="tel"
                            placeholder="+7 (999) 123-45-67"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Сохранение...</> : "Сохранить"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}