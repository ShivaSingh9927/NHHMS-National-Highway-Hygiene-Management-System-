"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function PhotoUploadScreen({ onContinue }: { onContinue?: (photos: string[]) => void }) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const urls = files.map((f) => URL.createObjectURL(f))
      setPhotos((prev) => [...prev, ...urls])

      let progress = 0
      const step = 100 / Math.max(5, urls.length * 2)
      const timer = setInterval(() => {
        progress = Math.min(100, progress + step)
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(timer)
          setIsUploading(false)
        }
      }, 100)
    } catch {
      setIsUploading(false)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* QR Code Scanner - moved above location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">📱 QR Code Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent">
            <span>📷</span>
            Scan Location QR Code
          </Button>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">📍 Current Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">UP West NE6 Tundla</p>
            <p className="text-sm text-muted-foreground">Toilet Block #3</p>
            <Badge variant="outline" className="text-xs">
              QR Code Verified ✓
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Upload Photos</CardTitle>
          <p className="text-sm text-muted-foreground">Take before and after photos</p>
          <p className="text-xs text-muted-foreground">
            Current: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload photos"
          />

          {/* Camera / Upload Button */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">📸</div>
            <Button onClick={openFilePicker} disabled={isUploading} className="w-full">
              {isUploading ? "Uploading..." : "Take or Upload Photo(s)"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Tip: On mobile, this will open the camera. You can also choose from gallery.
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Uploaded Photos</h4>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Badge className="absolute top-1 right-1 text-xs">{index === 0 ? "Before" : "After"}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📋 Upload History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { date: "2024-01-15", time: "14:30", location: "Rest Stop A1", score: 85 },
            { date: "2024-01-15", time: "11:45", location: "Service Station B2", score: 78 },
            { date: "2024-01-14", time: "16:20", location: "Rest Stop C3", score: 92 },
          ].map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-sm">{entry.location}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.date} at {entry.time}
                </p>
              </div>
              <Badge variant={entry.score >= 80 ? "default" : "secondary"}>{entry.score}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline">Save Draft</Button>
        <Button variant="outline" className="bg-transparent">
          🚨 Insert Issues
        </Button>
        <Button disabled={photos.length === 0} onClick={() => onContinue?.(photos)}>
          Continue to AI Analysis
        </Button>
      </div>
    </div>
  )
}
