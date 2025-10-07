// "use client"

// import { useState } from "react"
// import { WorkerDashboard } from "@/components/worker-dashboard"
// import { PhotoUploadScreen } from "@/components/photo-upload-screen"
// import { AIScoreResultScreen } from "@/components/ai-score-result-screen"
// import { SupervisorDashboard } from "@/components/supervisor-dashboard"
// import { GamificationScreen } from "@/components/gamification-screen"
// import { PublicFeedbackScreen } from "@/components/public-feedback-screen"
// import { Button } from "@/components/ui/button"
// import { analyzeImageForScores } from "@/lib/ai-scoring"

// type Screen = "worker" | "photo" | "score" | "supervisor" | "gamification" | "public"

// type Scores = {
//   Cleanliness: number
//   Lighting: number
//   "Soap Dispenser": number
//   "Water Supply": number
//   "Odour Control": number
// }

// export default function Home() {
//   const [currentScreen, setCurrentScreen] = useState<Screen>("worker")
//   const [aiScores, setAiScores] = useState<Scores | undefined>(undefined)
//   const [aiImageUrl, setAiImageUrl] = useState<string | undefined>(undefined)

//   const screens = [
//     { id: "worker" as Screen, label: "Worker Dashboard", icon: "👷" },
//     { id: "photo" as Screen, label: "Photo Upload", icon: "📸" },
//     { id: "score" as Screen, label: "AI Score", icon: "🎯" },
//     { id: "supervisor" as Screen, label: "NHHMD Dashboard", icon: "👨‍💼" },
//     { id: "gamification" as Screen, label: "Leaderboard", icon: "🏆" },
//     { id: "public" as Screen, label: "Public Feedback", icon: "⭐" },
//   ]

//   const handleContinueFromUpload = async (photos: string[]) => {
//     try {
//       // pick the latest as "after"
//       const afterPhoto = photos[photos.length - 1]
//       setAiImageUrl(afterPhoto)
//       // analyze image using ported scoring logic
//       const scores = await analyzeImageForScores(afterPhoto)
//       setAiScores(scores)
//       setCurrentScreen("score")
//     } catch (err) {
//       console.log("[v0] Error analyzing image:", (err as Error)?.message)
//       setAiScores(undefined)
//       setCurrentScreen("score")
//     }
//   }

//   const renderScreen = () => {
//     switch (currentScreen) {
//       case "worker":
//         return <WorkerDashboard />
//       case "photo":
//         return <PhotoUploadScreen onContinue={handleContinueFromUpload} />
//       case "score":
//         return <AIScoreResultScreen scores={aiScores} imageUrl={aiImageUrl} />
//       case "supervisor":
//         return <SupervisorDashboard />
//       case "gamification":
//         return <GamificationScreen />
//       case "public":
//         return <PublicFeedbackScreen />
//       default:
//         return <WorkerDashboard />
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Navigation Header */}
//       <div className="sticky top-0 z-50 bg-card border-b border-border">
//         <div className="max-w-md mx-auto p-4">
//           <h1 className="text-lg font-semibold text-foreground mb-4 text-center">
//             NHHMS (National Highway Hygiene Management System)
//           </h1>
//           <div className="grid grid-cols-3 gap-2">
//             {screens.map((screen) => (
//               <Button
//                 key={screen.id}
//                 variant={currentScreen === screen.id ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setCurrentScreen(screen.id)}
//                 className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
//               >
//                 <span className="text-base">{screen.icon}</span>
//                 <span className="leading-tight">{screen.label}</span>
//               </Button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-md mx-auto">{renderScreen()}</div>
//     </div>
//   )
// }

//--------------------------------------------------------------------------
"use client"

import { useState } from "react"
import { WorkerDashboard } from "@/components/worker-dashboard"
import { PhotoUploadScreen } from "@/components/photo-upload-screen"
import { AIScoreResultScreen } from "@/components/ai-score-result-screen"
import { SupervisorDashboard } from "@/components/supervisor-dashboard"
import { GamificationScreen } from "@/components/gamification-screen"
import { PublicFeedbackScreen } from "@/components/public-feedback-screen"
import { Button } from "@/components/ui/button"
import { analyzeImageViaApi, Scores } from "@/lib/ai-scoring"

type Screen = "worker" | "photo" | "score" | "supervisor" | "gamification" | "public"

// helper: turn blob: preview into a real File
async function blobUrlToFile(blobUrl: string, filename = "upload.jpg") {
  const resp = await fetch(blobUrl)
  const blob = await resp.blob()
  const type = blob.type || "image/jpeg"
  return new File([blob], filename, { type })
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("worker")
  const [aiScores, setAiScores] = useState<Scores | undefined>(undefined)
  const [aiImageUrl, setAiImageUrl] = useState<string | undefined>(undefined) // annotated (detected) image
  const [loading, setLoading] = useState(false)

  const screens = [
    { id: "worker" as Screen, label: "Worker Dashboard", icon: "👷" },
    { id: "photo" as Screen, label: "Photo Upload", icon: "📸" },
    { id: "score" as Screen, label: "AI Score", icon: "🎯" },
    { id: "supervisor" as Screen, label: "NHHMD Dashboard", icon: "👨‍💼" },
    { id: "gamification" as Screen, label: "Leaderboard", icon: "🏆" },
    { id: "public" as Screen, label: "Public Feedback", icon: "⭐" },
  ]

  const handleContinueFromUpload = async (photos: (File | string)[]) => {
    setLoading(true)
    try {
      let last = photos[photos.length - 1]

      // debug: see what we got
      console.log("[upload] typeof last =", typeof last)
      if (typeof last === "string") {
        console.log("[upload] string start =", last.slice(0, 40))
        if (last.startsWith("blob:")) {
          // 🔑 convert blob preview → real File for the API
          last = await blobUrlToFile(last)
          console.log("[upload] converted blob: to File", (last as File).name, (last as File).type)
        }
      } else {
        console.log("[upload] is File:", last instanceof File, (last as File)?.name, (last as File)?.type)
      }

      const { scores, detected_image_url, image_url } = await analyzeImageViaApi(last)

      setAiScores({
        Cleanliness: scores.Cleanliness,
        Lighting: scores.Lighting,
        "Soap Dispenser": scores["Soap Dispenser"],
        "Water Supply": scores["Water Supply"],
        "Odour Control": scores["Odour Control"],
        // add this line to stash the overall into the object (or pass separately)
        // @ts-ignore - extend type ad-hoc
        Overall: (scores as any)["Overall Score"],
      })

      // Prefer annotated image, fall back if backend only returns image_url
      setAiImageUrl(detected_image_url ?? image_url)
      setCurrentScreen("score")
    } catch (err) {
      console.log("[v0] Error analyzing image:", (err as Error)?.message)
      setAiScores(undefined)
      setCurrentScreen("score")
    } finally {
      setLoading(false)
    }
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "worker":
        return <WorkerDashboard />
      case "photo":
        return <PhotoUploadScreen onContinue={handleContinueFromUpload} />
      case "score":
        return <AIScoreResultScreen scores={aiScores} imageUrl={aiImageUrl} loading={loading} />
      case "supervisor":
        return <SupervisorDashboard />
      case "gamification":
        return <GamificationScreen />
      case "public":
        return <PublicFeedbackScreen />
      default:
        return <WorkerDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-md mx-auto p-4">
          <h1 className="text-lg font-semibold text-foreground mb-4 text-center">
            NHHMS (National Highway Hygiene Management System)
          </h1>
          <div className="grid grid-cols-3 gap-2">
            {screens.map((screen) => (
              <Button
                key={screen.id}
                variant={currentScreen === screen.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentScreen(screen.id)}
                className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
              >
                <span className="text-base">{screen.icon}</span>
                <span className="leading-tight">{screen.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-md mx-auto">{renderScreen()}</div>
    </div>
  )
}
