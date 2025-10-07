"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export function PublicFeedbackScreen() {
  const [rating, setRating] = useState(0)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const cleaningHistory = [
    { date: "2024-01-15", time: "14:30", cleaner: "Rohit Yadav", company: "Company A", score: 85 },
    { date: "2024-01-15", time: "09:15", cleaner: "Neeraj Bansali", company: "Company B", score: 92 },
    { date: "2024-01-14", time: "16:45", cleaner: "Saral Singh", company: "Company C", score: 78 },
    { date: "2024-01-14", time: "11:30", cleaner: "Davi Chopra", company: "Company D", score: 88 },
  ]

  const issues = [
    { id: "water", label: "No Water", icon: "💧" },
    { id: "soap", label: "No Soap", icon: "🧴" },
    { id: "smell", label: "Bad Smell", icon: "🤢" },
    { id: "dirty", label: "Dirty Floor", icon: "🧽" },
    { id: "light", label: "Broken Light", icon: "💡" },
    { id: "paper", label: "No Toilet Paper", icon: "🧻" },
  ]

  const toggleIssue = (issueId: string) => {
    setSelectedIssues((prev) => (prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setRating(0)
      setSelectedIssues([])
      setComment("")
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <Card className="w-full text-center">
          <CardContent className="p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback has been submitted and will help improve our facilities.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-lg">Rate This Facility</CardTitle>
          <p className="text-sm text-muted-foreground">Highway Rest Stop A1 - Toilet Block #3</p>
        </CardHeader>
      </Card>

      {/* Cleaning History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🧹 Recent Cleaning History</CardTitle>
          <p className="text-sm text-muted-foreground">See who cleaned this facility and when</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {cleaningHistory.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-sm">{entry.cleaner}</p>
                <p className="text-xs text-muted-foreground">{entry.company}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.date} at {entry.time}
                </p>
              </div>
              <Badge variant={entry.score >= 80 ? "default" : "secondary"}>{entry.score}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Star Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Overall Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${star <= rating ? "text-yellow-400" : "text-muted"}`}
              >
                ⭐
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-center">
              <Badge variant={rating >= 4 ? "default" : rating >= 3 ? "secondary" : "destructive"}>
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                    ? "Good"
                    : rating === 3
                      ? "Average"
                      : rating === 2
                        ? "Poor"
                        : "Very Poor"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Report Issues (Optional)</CardTitle>
          <p className="text-sm text-muted-foreground">Select any problems you noticed</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {issues.map((issue) => (
              <Button
                key={issue.id}
                variant={selectedIssues.includes(issue.id) ? "default" : "outline"}
                onClick={() => toggleIssue(issue.id)}
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                <span className="text-lg">{issue.icon}</span>
                <span className="text-xs">{issue.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell us more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button onClick={handleSubmit} disabled={rating === 0} className="w-full h-12">
        Submit Feedback
      </Button>

      {/* QR Code Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <div className="text-2xl mb-2">📱</div>
          <p className="text-xs text-muted-foreground">Scan the QR code inside the facility to provide feedback</p>
        </CardContent>
      </Card>
    </div>
  )
}
