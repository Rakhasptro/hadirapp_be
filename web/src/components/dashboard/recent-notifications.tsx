import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, FileText, UserX, Activity } from "lucide-react"
import { recentNotifications } from "@/lib/mock-data"

export function RecentNotifications() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return FileText
      case 'absent':
        return UserX
      case 'activity':
        return Activity
      default:
        return Bell
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'leave':
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
      case 'absent':
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      case 'activity':
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Notifikasi Terbaru</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {recentNotifications.filter(n => !n.read).length} notifikasi belum dibaca
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {recentNotifications.map((notification) => {
            const Icon = getIcon(notification.type)
            const iconColor = getIconColor(notification.type)
            
            return (
              <div
                key={notification.id}
                className={`flex gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 transition-colors ${
                  !notification.read ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
              >
                <div className={`rounded-lg p-1.5 sm:p-2 h-fit flex-shrink-0 ${iconColor}`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium leading-none truncate">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <Badge variant="default" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs flex-shrink-0">
                        Baru
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {notification.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
