import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function WorkerDashboard() {
  const alerts = [
    { location: "Toll Plaza(Tundla): User Feedback", score: 65, urgent: true },
    { location: "Toll Plaza(Tundla): User Feedback", score: 72, urgent: false },
  ]

  const recentTasks = [
    { location: "Toll Plaza(Tundla): Shift 3", time: "4 hours ago", score: 85 },
    { location: "Toll Plaza(Tundla): Shift 2", time: "8 hours ago", score: 78 },
    { location: "Toll Plaza(Tundla): Shift 1", time: "12 hours ago", score: 92 },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Worker Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Rohit Yadav</CardTitle>
              <p className="text-sm text-muted-foreground">Maintenance Worker</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">87%</div>
              <p className="text-xs text-muted-foreground">Performance</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={87} className="h-2" />
        </CardContent>
      </Card>

      {/* Alerts Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            🚨 Priority Alerts
            <Badge variant="destructive" className="text-xs">
              {alerts.filter((a) => a.urgent).length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-sm">{alert.location}</p>
                <p className="text-xs text-muted-foreground">Score: {alert.score}%</p>
              </div>
              <Badge variant={alert.urgent ? "destructive" : "secondary"}>{alert.urgent ? "Urgent" : "Low"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="h-16 flex flex-col gap-1">
          <span className="text-lg">📸</span>
          <span className="text-xs">Upload Photo</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-1 bg-transparent">
          <span className="text-lg">📋</span>
          <span className="text-xs">View Tasks</span>
        </Button>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{task.location}</p>
                <p className="text-xs text-muted-foreground">{task.time}</p>
              </div>
              <Badge variant={task.score >= 80 ? "default" : "secondary"}>{task.score}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
