# Next.js 14 App with TypeScript and Modern Stack

A modern Next.js 14 application built with the App Router, TypeScript, and a comprehensive set of tools and libraries.

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for beautiful UI components
- **Lucide React** for icons
- **Recharts** for data visualization
- **LocalForage** for client-side storage
- **Zustand** for state management
- **Vitest** + **Testing Library** for unit testing
- **Playwright** for end-to-end testing

## 📁 Project Structure

```
src/
├── app/                    # App Router pages
│   ├── page.tsx          # Home page (/)
│   ├── home/             # Dashboard page (/home)
│   ├── create/           # Creation page (/create)
│   ├── library/          # Library page (/library)
│   ├── vibe/             # Vibe page (/vibe)
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
└── test/                  # Test setup and utilities
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextjs-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

### Unit Tests (Vitest + Testing Library)

Run unit tests:
```bash
npm run test           # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### End-to-End Tests (Playwright)

Run E2E tests:
```bash
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Run E2E tests with UI
```

## 📱 Available Routes

- **/** - Landing page with navigation to all routes
- **/home** - Dashboard with analytics and quick actions
- **/create** - Content creation interface with forms and tools
- **/library** - Content library with grid layout and search
- **/vibe** - Mood-based interface with interactive elements

## 🎨 UI Components

The project uses shadcn/ui components:
- Button
- Card
- Input
- Label

## 🔧 Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📚 Key Libraries

- **shadcn/ui**: Modern, accessible UI components
- **Lucide React**: Beautiful, customizable icons
- **Recharts**: Composable charting library for React
- **LocalForage**: Offline storage with fallbacks
- **Zustand**: Lightweight state management
- **Vitest**: Fast unit testing framework
- **Playwright**: Reliable end-to-end testing

## 🚀 Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting platform

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you have any questions or need help, please open an issue in the repository.
