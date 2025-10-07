import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type Scores = {
  Cleanliness: number
  Lighting: number
  "Soap Dispenser": number
  "Water Supply": number
  "Odour Control": number
}

export function AIScoreResultScreen({ scores, imageUrl }: { scores?: Scores; imageUrl?: string }) {
  // If no scores yet, show a helpful message
  if (!scores) {
    return (
      <div className="p-4 space-y-4">
        {/* Analyzed Image Preview */}
        {imageUrl ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Photo analyzed by AI"
                className="w-full h-48 object-cover rounded-md border"
              />
            </CardContent>
          </Card>
        ) : null}
        <Card className="text-center">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI Cleanliness Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No analysis yet. Upload photos and continue to AI Analysis to see results.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const subScores = [
    { category: "Cleanliness", score: scores.Cleanliness, icon: "🧽" },
    { category: "Water Supply", score: scores["Water Supply"], icon: "💧" },
    { category: "Soap Dispenser", score: scores["Soap Dispenser"], icon: "🧴" },
    { category: "Odour Control", score: scores["Odour Control"], icon: "🌬️" },
    { category: "Lighting", score: scores.Lighting, icon: "💡" },
  ] as const

  const overallScore = Math.round(
    (scores.Cleanliness*0.9 +
      (scores.Lighting +
      scores["Soap Dispenser"] +
      scores["Water Supply"] +
      scores["Odour Control"])/4*0.1) 
      ,
  )

  return (
    <div className="p-4 space-y-4">
      {/* Analyzed Image Preview */}
      {imageUrl ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Photo analyzed by AI"
              className="w-full h-full object-cover rounded-md border"
            />
          </CardContent>
        </Card>
      ) : null}
      {/* Overall Score Card */}
      <Card className="text-center">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI Cleanliness Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">Highway Rest Stop A1 - Toilet Block #3</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="text-6xl font-bold text-primary mb-2">{overallScore}%</div>
            <Badge variant={overallScore >= 80 ? "default" : "destructive"} className="text-sm">
              {overallScore >= 80 ? "Excellent" : "Needs Improvement"}
            </Badge>
          </div>

          {/* Circular Progress Visualization */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100" aria-label="Overall score progress">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${overallScore * 2.51} 251`}
                className={overallScore >= 80 ? "text-primary" : "text-destructive"}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{overallScore}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subScores.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <Badge variant={item.score >= 80 ? "default" : item.score >= 60 ? "secondary" : "destructive"}>
                  {item.score}%
                </Badge>
              </div>
              <Progress value={item.score} className="h-2" aria-label={`${item.category} score`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline">📸 Retake Photos</Button>
        <Button>✅ Submit Report</Button>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🤖 AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>Refill soap dispenser - critically low</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Clean floor tiles around sink area</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary">•</span>
              <span>Check ventilation system for odour control</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}


