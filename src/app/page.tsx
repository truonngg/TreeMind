import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Home, Plus, Library, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">VibeFlow</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your creative journey starts here. Explore, create, and discover amazing content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Home className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Home</CardTitle>
              <CardDescription>Your personalized dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/home">
                <Button className="w-full">Go to Home</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Plus className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Create</CardTitle>
              <CardDescription>Start building something new</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button className="w-full">Start Creating</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Library className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Library</CardTitle>
              <CardDescription>Browse your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/library">
                <Button className="w-full">View Library</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Heart className="w-12 h-12 mx-auto text-pink-600 mb-2" />
              <CardTitle>Vibe</CardTitle>
              <CardDescription>Feel the energy</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vibe">
                <Button className="w-full">Get Vibe</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
