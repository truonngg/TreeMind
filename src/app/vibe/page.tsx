import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Music, Sparkles, TrendingUp, Zap, Coffee, Sun, Moon, Star, Palette } from 'lucide-react'

export default function VibePage() {
  const moodCategories = [
    { name: 'Energetic', icon: Zap, color: 'bg-yellow-500', description: 'High energy, upbeat vibes' },
    { name: 'Chill', icon: Coffee, color: 'bg-blue-500', description: 'Relaxed, laid-back atmosphere' },
    { name: 'Creative', icon: Palette, color: 'bg-purple-500', description: 'Inspirational, artistic mood' },
    { name: 'Adventurous', icon: Star, color: 'bg-green-500', description: 'Exciting, exploratory energy' },
    { name: 'Peaceful', icon: Sun, color: 'bg-orange-500', description: 'Calm, serene vibes' },
    { name: 'Mysterious', icon: Moon, color: 'bg-indigo-500', description: 'Intriguing, enigmatic aura' }
  ]

  const vibePlaylists = [
    { title: 'Morning Motivation', mood: 'Energetic', tracks: 24, duration: '1h 23m' },
    { title: 'Late Night Vibes', mood: 'Chill', tracks: 18, duration: '1h 5m' },
    { title: 'Creative Flow', mood: 'Creative', tracks: 31, duration: '2h 12m' },
    { title: 'Adventure Time', mood: 'Adventurous', tracks: 22, duration: '1h 45m' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            What&apos;s Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Vibe</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect mood for your moment. Let us curate the perfect experience just for you.
          </p>
        </div>

        <div className="mb-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">How are you feeling today?</CardTitle>
              <CardDescription>Select your current mood to get personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {moodCategories.map((mood) => (
                  <Button
                    key={mood.name}
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:scale-105 transition-transform"
                  >
                    <mood.icon className={`w-8 h-8 ${mood.color} text-white p-1 rounded-full`} />
                    <span className="text-sm font-medium">{mood.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Current Vibe
              </CardTitle>
              <CardDescription>Your personalized vibe recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Creative Flow</span>
                  </div>
                  <span className="text-sm text-gray-600">95% match</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Chill Vibes</span>
                  </div>
                  <span className="text-sm text-gray-600">87% match</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Adventure Ready</span>
                  </div>
                  <span className="text-sm text-gray-600">78% match</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Vibe Analytics
              </CardTitle>
              <CardDescription>Your vibe patterns and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Most Common Mood</span>
                  <span className="font-medium">Creative</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Vibe Time</span>
                  <span className="font-medium">2:00 PM</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weekly Vibe Score</span>
                  <span className="font-medium">8.5/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Curated Vibe Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vibePlaylists.map((playlist) => (
              <Card key={playlist.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{playlist.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {playlist.mood}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{playlist.tracks} tracks</p>
                    <p>{playlist.duration}</p>
                  </div>
                  <Button className="w-full mt-4">
                    <Music className="w-4 h-4 mr-2" />
                    Play Vibe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create Your Own Vibe</CardTitle>
              <CardDescription>Mix and match to create the perfect atmosphere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vibe-name">Vibe Name</Label>
                  <Input id="vibe-name" placeholder="e.g., Cozy Sunday Morning" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vibe-intensity">Intensity</Label>
                  <select
                    id="vibe-intensity"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <Button className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Vibe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
