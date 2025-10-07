import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function GamificationScreen() {
  const leaderboard = [
    { name: "Company A", score: 92, tasks: 45, streak: 7 },
    { name: "Company B", score: 87, tasks: 52, streak: 5 },
    { name: "Company C", score: 85, tasks: 41, streak: 3 },
    { name: "Company D", score: 78, tasks: 38, streak: 2 },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">🏆 Monthly Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.map((company, index) => (
            <div key={company.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-muted-foreground text-white"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.tasks} tasks completed</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={index === 0 ? "default" : "secondary"}>{company.score}%</Badge>
                <p className="text-xs text-muted-foreground">{company.streak} day streak</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Motivational Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="font-semibold text-sm">Keep up the great work!</p>
          <p className="text-xs text-muted-foreground">Competition drives excellence in hygiene standards!</p>
        </CardContent>
      </Card>
    </div>
  )
}
