## TreeMind - AI-Powered Journaling Companion

A private, empathetic, and intelligent journaling companion that makes self-reflection a seamless and insightful daily habit. Built with Next.js 14, TypeScript, and a privacy-first architecture that keeps your thoughts secure on your device.

### Demo
- Link: 

## 🌱 Core Features

### Journaling Experience
- **Dynamic Prompts**: Context-aware prompts based on previous entries to overcome blank page anxiety
- **Voice Recording**: "Rant it out" feature with real-time transcription using Web Speech API
- **Smart Title Generation**: AI-powered title suggestions with privacy-first local processing
- **Multiple Entry Methods**: Choose from curated prompts or start writing freely

### Reflection & Insights
- **Sentiment Analysis**: On-device analysis of emotional patterns over time
- **Theme Detection**: Automatic categorization of entries (work, health, relationships, etc.)
- **Weekly & Monthly Insights**: AI-generated summaries of key themes and progress patterns. Provides action-oriented next steps for improvements.
- **Privacy Toggle**: Choose between Private Mode (local-only) or Enhanced Insights (anonymized AI)

### Consistency & Growth
- **Plant Metaphor**: Growing plant visualization that represents your journaling journey
- **Progress Tracking**: Point system with streak bonuses and milestone celebrations
- **Collection System**: View all plants you've grown throughout your journey
- **Encouraging Tone**: Positive reinforcement and gentle guidance throughout the experience

### Privacy & Security
- **Local-First**: All analysis and storage happens on your device
- **No Raw Data Sharing**: Only anonymized aggregates sent to AI services (when enabled)
- **Transparent Privacy**: Clear privacy notices and user control over data sharing
- **Secure Storage**: Client-side storage with LocalForage for offline access

## 📁 Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # Welcome/landing page
│   ├── home/                     # Progress dashboard with plant growth
│   ├── create/                   # Journal entry creation
│   ├── library/                  # Entry library with search & filters
│   ├── vibe/                     # Weekly insights and mood tracking
│   ├── entry/[id]/               # Individual entry view & editing
│   ├── insights/                 # Monthly insights and analytics
│   ├── api/                      # API routes for enhanced features
│   │   ├── generate-weekly-insights/    # Weekly AI insights
│   │   ├── generate-monthly-insights/   # Monthly AI insights
│   │   ├── generate-gemini-title/       # AI title generation
│   │   └── generate-context-prompt/     # Context-aware prompts
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout with navigation
├── components/                    # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── GlobalNavigation.tsx      # Main navigation component
│   ├── ConditionalNavigation.tsx # Context-aware navigation
│   ├── SentimentLineChart.tsx    # Sentiment visualization
│   ├── ThemeCalendar.tsx         # Theme-based calendar view
│   └── CreateEntryFormv0.tsx     # Main entry creation form
├── hooks/                        # Custom React hooks
│   ├── useVoiceRecording.ts      # Voice recording & transcription
│   ├── useInspirationPrompts.ts  # Dynamic prompt generation
│   └── usePrivacyPreferences.ts  # Privacy settings management
├── lib/                          # Core business logic
│   ├── analysis/                 # On-device analysis
│   │   ├── sentiment.ts          # Sentiment analysis engine
│   │   ├── themes.ts             # Theme detection
│   │   ├── titleGeneration.ts    # Title generation logic
│   │   └── weeklyInsights.ts     # Weekly insights calculation
│   ├── storage/                  # Data persistence
│   │   └── entries.ts            # Entry storage & retrieval
│   ├── prompts/                  # Prompt management
│   │   └── curatedPrompts.ts     # Curated prompt library
│   └── utils.ts                  # Utility functions
└── test/                         # Test setup and utilities
```

## 📋 Product Requirements Document 

*Sections are taken directly from the case prompt. 

### Problem Statement *
While the mental health benefits of journaling are well-documented, many people struggle to maintain a consistent practice. They face "blank page" anxiety, don't know what to write about, and find it difficult to reflect on past entries to identify meaningful patterns in their thoughts, emotions, and behaviors. As a result, the journal becomes a log of events rather than a tool for growth.

### Pain Points Addressed
- **Inconsistency in journaling** (hard to continue, intimidating)
- **Writer's block / blank page anxiety** (anxious getting started)
- **Hard to reflect and distill meaningful patterns** (difficulty reflecting, understanding)

### Target Users *
- Individuals focused on mental wellness who want a tool to help them understand their emotional patterns
- People new to journaling who need guidance and encouragement to get started
- Busy professionals who want a quick and effective way to de-stress and process their day

### Key Features

#### Journaling Experience
- **Dynamic Prompts**: Context-aware prompts based on previous submissions *
- **Voice Feature**: "Rant it out" functionality to make it easier to start, feel like a conversation
- **No Back and Forth**: It's a journal, not a therapy session

#### Reflection Experience
- **Sentiment and Theme Analysis**: AI analyzes user entries over time to create visual dashboards
- **Reflection Summaries**: Weekly summaries of key themes and progress
- **Pattern Recognition**: Example: "feeling most energized on morning walks. Wrote about creative ideas in those weeks." *

#### Consistency & Gamification
- **Plant Growth Metaphor**: Growing plant visualization that takes varying days to reach full potential
- **Point System**: 1 point for journal entry, 1 point per day showing up, +1 for each consecutive day
- **Progress Stages**: Points accumulate over time (never decreasing)
- **Progress Bar**: For journal entries + consecutive days
- **Encouraging Tone**: Emphasize progress made throughout the experience

### User Journeys

#### 1. First-time User Onboarding
- Welcome screen: "Your words stay yours. Only anonymized trends ever leave your device."
- Privacy Mode Toggle: Private Mode (default) vs Enhanced Insights
- Start with a seed (plant metaphor)

#### 2. Creating a New Journal Entry
- Tap "Create" → see 3 prompts (based on last themes/sentiment trends)
- 1 context-aware prompt (unless first entry)
- User writes or records (rant-to-text)
- On save: Local analysis runs (sentiment + theme tagging), entry stored locally

#### 3. Reviewing Past Entries
- Library tab shows entries by date with tabs: sentiment + theme
- User can scroll, search, or open entry detail

#### 4. Reflection & Insights
- **Private Mode**: App shows charts + rule-based summary
- **Enhanced Insights**: Aggregates sent to AI for narrative summary
- **Display Charts**: Line charts, bar charts, calendars for sentiment, consistency, and theme tracking

#### 5. Consistency & Growth
- Plant metaphor progresses with streaks + cumulative points
- Weekly insights include encouragement tied to plant growth
- Collection tab stores all plants earned
- Easy to derive insights on a weekly and month basis

### Success Metrics *
- **User Engagement**: How effectively does the app encourage consistent, daily journaling?
- **Insightfulness**: Do the AI-generated insights help users discover meaningful patterns?
- **Privacy and Trust**: Is the user interface and technical design built to feel secure, private, and non-judgmental?
- **AI Application**: How well does the solution leverage NLP and sentiment analysis to provide a helpful and empathetic experience?

## 🎯 Design Choices & Tradeoffs

### Privacy-First Architecture
**Approach**: Local-first processing with optional AI enhancement
- **Why**: Journaling is deeply personal - users need absolute trust in data privacy
- **Implementation**: All sentiment analysis, theme detection, and storage happens on-device
- **Tradeoff**: Scaling and performance issues
- **Future Plans**: Database with encrypted entries 

### Hybrid AI Strategy
**Approach**: Local processing + optional anonymized AI enhancement
- **Why**: Balance between privacy and intelligent insights
- **Implementation**: 
  - Private Mode: Pure local analysis with rule-based insights
  - Enhanced Mode: Anonymized aggregates sent to Google Gemini for narrative summaries
- **Tradeoff**: Two code paths to maintain, but provides user choice
- **Future Plans**: Query a stateless LLM (no data persistence), Redaction of Entries

### Voice Recording with Web Speech API
**Approach**: Browser-native speech recognition instead of external APIs
- **Why**: Privacy (no data leaves device) + no API costs + works offline
- **Implementation**: Real-time transcription using Web Speech API with graceful fallbacks
- **Tradeoff**: Browser compatibility limitations

### On-Device Sentiment Analysis
**Approach**: Custom sentiment analysis engine instead of external APIs
- **Why**: Privacy, cost, and reliability - works offline
- **Implementation**: Comprehensive word lists with intensity scoring
- **Tradeoff**: Less sophisticated than cloud-based NLP
- **Future Plans**: Stateless LLM or encrypted/redacted entries.

### Context-Aware Prompts
**Approach**: Dynamic prompts based on recent entry themes and sentiment
- **Why**: Reduces blank page anxiety by providing relevant starting points
- **Implementation**: Analysis of recent entries to suggest personalized prompts

### Progressive Enhancement
**Approach**: Core functionality works without JavaScript, enhanced with JS
- **Why**: Accessibility and reliability - journaling should always work
- **Implementation**: Basic form submission works, enhanced with real-time features
- **Tradeoff**: More development effort for edge cases
- **Decision**: Reliability is crucial for a daily habit app

## 🔄 Development Workflow

### 1. Product Planning & Design
- **PRD Development**: Drafted comprehensive Product Requirements Document with clear problem definition, user journeys, and success metrics
- **AI-Assisted Ideation**: Used GPT as a collaborative assistant to bounce off ideas, refine implementation approaches, and explore technical tradeoffs throughout the development process
- **Rapid Prototyping**: Leveraged Vercel v0 to create initial UI mockups and validate design concepts for the MVP

### 2. Development Environment & Tools
- **IDE**: Cursor as primary development environment for intelligent code completion, scaffolding, feature implementation, and drafting this README!
- **AI-Powered Development**: Integrated AI assistance for code generation, refactoring, and architectural decisions
- **Version Control**: Git-based workflow with feature branches and iterative development

### 3. Implementation Strategy
- **Feature-First Development**: Built core journaling functionality before adding advanced features
- **Privacy-First Architecture**: Implemented local storage and on-device analysis as foundation
- **Progressive Enhancement**: Added AI features as optional enhancements while maintaining core functionality
- **Testing Status**: Basic testing setup exists but is minimal - unit tests for core logic (storage, analysis) and E2E tests for critical user flows (create entry, library view). Some fail, didn't spend much time here to build prototype. 

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

- **/** - Welcome page with app overview and navigation
- **/home** - Progress dashboard with plant growth visualization and analytics
- **/create** - Journal entry creation with voice recording and smart prompts
- **/library** - Entry library with search, filters, and sentiment/theme tags
- **/vibe** - Weekly insights and mood tracking with AI-generated summaries
- **/entry/[id]** - Individual entry view and editing
- **/insights** - Monthly insights and long-term pattern analysis

## 🔧 Technical Stack

### Frontend
- **Next.js 14** with App Router for modern React development
- **TypeScript** for type safety and better developer experience
- **TailwindCSS** for utility-first styling
- **shadcn/ui** for accessible, customizable UI components
- **Lucide React** for consistent iconography
- **Recharts** for interactive data visualizations

### State Management & Storage
- **Zustand** for lightweight, type-safe state management
- **LocalForage** for client-side storage with IndexedDB fallbacks
- **React Hooks** for custom logic (voice recording, privacy preferences, prompts)

### AI & Analysis
- **Custom Sentiment Analysis** - On-device word-list based analysis
- **Theme Detection** - Keyword-based categorization system
- **Google Gemini API** - Optional AI enhancement for insights (anonymized data only)
- **Web Speech API** - Browser-native voice transcription

### Development & Testing
- **Vitest** + **Testing Library** for unit testing
- **Playwright** for end-to-end testing
- **ESLint** for code quality
- **TypeScript** for type checking

## 🔒 Privacy Architecture

### Local-First Design
- **All journal entries** are stored locally using LocalForage (IndexedDB)
- **Sentiment analysis** runs entirely on-device using custom algorithms
- **Theme detection** uses keyword matching without external API calls
- **Voice transcription** uses browser-native Web Speech API (no data leaves device)

### Enhanced Insights (Optional)
- **Anonymized Data Only**: When Enhanced Insights is enabled, only statistical aggregates are sent to AI
- **No Raw Text**: Journal content never leaves your device
- **User Control**: Privacy toggle allows switching between modes at any time
- **Transparent Processing**: Clear indication of what data (if any) is being processed externally

### Data Flow
```
User Entry → Local Storage → On-Device Analysis → Local Insights
                    ↓
            [Optional] Anonymized Aggregates → AI Enhancement → Enhanced Insights
```

## 🎨 UI Components

The project uses shadcn/ui components for consistent, accessible design:
- **Form Components**: Button, Input, Label, Textarea, Select
- **Layout Components**: Card, Badge, Progress, Tabs
- **Feedback Components**: Tooltip, Alert, Toast
- **Navigation Components**: Custom navigation with plant-themed icons

## 🔧 Development

### Environment Setup

1. **Clone and Install**:
```bash
git clone <your-repo-url>
cd TreeMind
npm install
```

2. **Environment Variables** (Optional - for Enhanced Insights):
```bash
# Create .env.local file
GEMINI_API_KEY=your_google_gemini_api_key_here
```

3. **Run Development Server**:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# All tests
npm run test:all
```

### Linting & Type Checking

```bash
npm run lint
npm run type-check
```

## 📚 Key Libraries

- **shadcn/ui**: Modern, accessible UI components
- **Lucide React**: Beautiful, customizable icons
- **Recharts**: Interactive data visualization
- **LocalForage**: Offline storage with IndexedDB fallbacks
- **Zustand**: Lightweight, type-safe state management
- **Web Speech API**: Browser-native voice transcription
- **Vitest**: Fast unit testing framework
- **Playwright**: Reliable end-to-end testing

## 🚀 Deployment

The application can be deployed to:
- **Vercel** (recommended for Next.js) - Easy deployment with automatic HTTPS
- **Netlify** - Good alternative with edge functions
- **Any Node.js hosting platform** - Standard Next.js deployment

### Production Considerations
- **HTTPS Required**: Voice recording requires secure context
- **Environment Variables**: Set `GEMINI_API_KEY` for Enhanced Insights feature
- **Browser Support**: Modern browsers required for Web Speech API

### 🔄 Areas for Review/Enhancement
- **Mobile Optimization**: Current implementation is web-first; mobile-specific optimizations may be needed
- **AI Outputs**: Find a way to balance personalized outputs and privacy. 
- **Storage**: Find a way to redact/encrypt entries such that privacy doesn't impede scaling. 
-**UI/UX**: Create a welcoming experience (cleaner, clearer look). Plant should one, ongoing visual as a main focal point of the app. 

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

