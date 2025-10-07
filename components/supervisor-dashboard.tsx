"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function SupervisorDashboard() {
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const toiletLocations = [
    { id: 1, name: "Company A", score: 85, status: "clean", lat: 40.7128, lng: -74.006 },
    { id: 2, name: "Company B", score: 72, status: "moderate", lat: 40.7589, lng: -73.9851 },
    { id: 3, name: "Company C", score: 45, status: "dirty", lat: 40.7831, lng: -73.9712 },
    { id: 4, name: "Company D", score: 92, status: "clean", lat: 40.7505, lng: -73.9934 },
  ]

  const companies = [
    {
      name: "Comapany A",
      score: 87,
      tasks: 45,
      earnings: 12340,
      workers: ["Rajesh Kumar", "Priya Sharma", "Amit Singh"],
    },
    {
      name: "Comapany B",
      score: 92,
      tasks: 52,
      earnings: 15680,
      workers: ["Sunita Patel", "Vikram Gupta", "Kavya Reddy"],
    },
    {
      name: "Comapany C",
      score: 78,
      tasks: 38,
      earnings: 9980,
      workers: ["Arjun Mehta", "Deepika Joshi"],
    },
    {
      name: "Comapany D",
      score: 85,
      tasks: 41,
      earnings: 11250,
      workers: ["Rohit Verma", "Neha Agarwal", "Karan Malhotra"],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clean":
        return "bg-accent"
      case "moderate":
        return "bg-secondary"
      case "dirty":
        return "bg-destructive"
      default:
        return "bg-muted"
    }
  }

  const selectedCompanyData = companies.find((c) => c.name === selectedCompany)

  return (
    <div className="p-4 space-y-4">
      {/* Date Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📅 Performance Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">From Date</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To Date</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <p className="text-xs text-muted-foreground">Total Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">78%</div>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">🗺️ Tundla → Agra Route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[400px]">
            <img
              src="/agra-tundla.png" // or your Cloudinary URL
              alt="Map from Tundla to Agra"
              className="w-full object-contain hover:scale-200 transition-transform duration-600"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Showing route coverage between Tundla and Agra (Uttar Pradesh)
          </p>
        </CardContent>
      </Card>


      {/* Toilet Status List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Facility Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {toiletLocations.map((location) => (
            <div key={location.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(location.status)}`} />
                <div>
                  <p className="font-medium text-sm">{location.name}</p>
                  <p className="text-xs text-muted-foreground">Last updated: 2h ago</p>
                </div>
              </div>
              <Badge variant={location.score >= 80 ? "default" : location.score >= 60 ? "secondary" : "destructive"}>
                {location.score}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Company Performance Rankings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Firm Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {companies
            .sort((a, b) => b.score - a.score)
            .map((company, index) => (
              <div key={company.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.tasks} tasks completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={company.score >= 85 ? "default" : "secondary"}>{company.score}%</Badge>
                  <p className="text-xs text-muted-foreground">{company.earnings} points</p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Company Worker Dropdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Company Workers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Select a company to view workers" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.name} value={company.name}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCompanyData && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Workers in {selectedCompany}:</p>
              {selectedCompanyData.workers.map((worker, index) => (
                <div key={worker} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{worker}</span>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          📊 Export Report
        </Button>
        <Button className="flex items-center gap-2">📧 Send Summary</Button>
      </div>
    </div>
  )
}
