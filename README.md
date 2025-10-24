# 🏋️ LiftLogKit - Your Ultimate Gym Companion

<div align="center">

![LiftLogKit Logo](https://via.placeholder.com/150x150/ff6b35/ffffff?text=LiftLogKit)

**Track. Progress. Achieve.**

A modern, feature-rich Progressive Web App (PWA) for tracking your fitness journey, logging workouts, and crushing your goals.

[![Made with React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8)](https://web.dev/progressive-web-apps/)

[✨ Features](#-features) • [🚀 Getting Started](#-getting-started) • [📱 Usage Guide](#-usage-guide) • [🛠️ Tech Stack](#️-tech-stack) • [📸 Screenshots](#-screenshots)

</div>

---

## ✨ Features

### 🎯 Core Features

- **📊 Comprehensive Workout Tracking**
  - Log exercises with sets, reps, and weights
  - Real-time workout timer and rest intervals
  - Track volume, calories, and workout duration
  - Exercise history with detailed analytics

- **💪 64+ Pre-loaded Exercises**
  - Organized by body parts (Chest, Back, Shoulders, Arms, Legs, Abs, Cardio, Forearms, Glutes)
  - High-quality exercise images and instructions
  - Quick search and filter functionality
  - Favorite exercises for easy access

- **📈 Progress Analytics**
  - Weekly/Monthly performance charts
  - Body part distribution graphs
  - Personal records and achievements
  - Volume and strength progression tracking

- **📸 Progress Photos**
  - Upload multiple photos at once (up to 10)
  - Organize by body part
  - Before/after comparisons
  - Timeline view of your transformation

- **🔥 Workout Streaks & Goals**
  - Track consecutive workout days
  - Set and monitor fitness goals
  - Achievement badges and milestones
  - Motivational stats and insights

### 🌟 Advanced Features

- **🔐 Dual Authentication**
  - Sign in with Google (OAuth)
  - Email/Password authentication
  - Secure session management
  - Auth provider conflict handling

- **📱 Progressive Web App (PWA)**
  - Install as native app on any device
  - Offline functionality with service workers
  - Fast loading with asset caching
  - App-like experience (no browser UI)

- **☁️ Cloud Integration**
  - Cloudinary for image storage
  - Real-time data sync with Supabase
  - Automatic backups
  - Cross-device synchronization

- **🎨 Modern UI/UX**
  - Dark mode optimized
  - Smooth animations and transitions
  - Responsive design (mobile-first)
  - Intuitive navigation with bottom nav

- **⚡ Performance Optimized**
  - Lazy loading for images
  - Code splitting and tree shaking
  - Optimized bundle size
  - Fast page transitions

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn**
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/lift-log-kit.git
cd lift-log-kit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration (for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the following SQL commands** in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  auth_provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercises JSONB NOT NULL,
  total_volume INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Photos table
CREATE TABLE public.progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  body_part TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for workouts table
CREATE POLICY "Users can view own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for progress_photos table
CREATE POLICY "Users can view own photos"
  ON public.progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON public.progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.progress_photos FOR DELETE
  USING (auth.uid() = user_id);
```

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Add upload preset
3. Set the preset to **unsigned** mode
4. Copy your **Cloud Name** and **Upload Preset** to `.env.local`

### Run the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

---

## 📱 Usage Guide

### 1️⃣ **Getting Started**

#### Sign Up
1. Open the app and click **"Sign Up"**
2. Choose your method:
   - **Continue with Google** - Quick OAuth signup
   - **Email & Password** - Enter name, email, and password
3. You're ready to start tracking!

#### Sign In
- Use the same method you signed up with
- Google accounts must use Google sign-in
- Email accounts use email/password

---

### 2️⃣ **Logging Your First Workout**

#### From Home Page
1. Tap **"Start Workout"** button
2. Select a body part (e.g., Chest, Back, Legs)
3. Browse and tap an exercise to add it

#### Add Exercise Details
1. **Tap "Add Set"** to log:
   - Reps (e.g., 10)
   - Weight (e.g., 50 kg)
2. Add multiple sets with the **+ button**
3. Timer starts automatically between sets
4. Add more exercises as needed

#### Complete Workout
1. Review your exercises and sets
2. Add optional notes (e.g., "Felt strong today!")
3. Tap **"Complete Workout"** to save
4. View instant stats: volume, duration, calories

---

### 3️⃣ **Tracking Progress Photos**

#### Upload Photos
1. Navigate to **"Progress"** tab
2. Tap **"Upload"** button
3. Select body part (Chest, Back, etc.)
4. Choose 1-10 photos at once
5. Review previews and remove any if needed
6. Tap **"Upload Photos"**

#### View Progress
- Photos organized by body part
- Timeline view with dates
- Tap any photo for full-screen view
- Compare photos over time
- Delete unwanted photos

---

### 4️⃣ **Viewing Analytics**

#### Weekly Stats
- **Home Page** shows:
  - Current workout streak 🔥
  - Weekly volume (total kg lifted)
  - Workouts completed this week
  - Top exercises

#### Summary Page
- **Detailed charts** including:
  - Weekly volume trends
  - Body part distribution
  - Exercise frequency
  - Personal records

#### Exercise History
- Tap any exercise to see:
  - All previous sessions
  - Weight progression graph
  - Set/rep history
  - Personal best highlights

---

### 5️⃣ **Managing Your Profile**

#### Profile Settings
1. Tap **"Profile"** in bottom nav
2. View your stats:
   - Total workouts logged
   - Lifetime volume
   - Current streak
   - Favorite exercises

#### Update Information
- Edit your name
- Change password
- Update profile picture
- Set fitness goals

#### Sign Out
- Tap **"Sign Out"** button
- Your data is saved in the cloud
- Sign back in anytime from any device

---

### 6️⃣ **Using Offline Mode (PWA)**

#### Install the App
**On Android/Chrome:**
1. Tap the browser menu (⋮)
2. Select "Install app" or "Add to Home Screen"
3. Confirm installation

**On iOS/Safari:**
1. Tap the Share button (📤)
2. Scroll and tap "Add to Home Screen"
3. Confirm

**On Desktop:**
1. Look for install icon in address bar
2. Click to install as desktop app

#### Offline Features
- ✅ View cached workouts
- ✅ Browse exercises
- ✅ View progress photos
- ⚠️ New workouts sync when back online
- 📶 Offline indicator shows connection status

---

### 7️⃣ **Pro Tips**

#### Workout Efficiency
- ⭐ **Favorite** commonly used exercises
- 📝 Use **notes** to track form improvements
- ⏱️ Follow **rest timer** between sets
- 📊 Review **previous workout** before starting

#### Progress Tracking
- 📸 Take photos **same time/lighting** for best comparison
- 📅 Weekly progress photos show trends better
- 🎯 Set **specific goals** in profile
- 📈 Check analytics weekly for motivation

#### Data Management
- ☁️ Data auto-syncs across devices
- 🔄 Pull down to refresh on any page
- 🗑️ Long-press to delete old workouts
- 📤 Export data coming soon!

---

## 🛠️ Tech Stack

### Frontend
- **⚛️ React 18** - UI library
- **📘 TypeScript** - Type safety
- **⚡ Vite** - Build tool & dev server
- **🎨 Tailwind CSS** - Utility-first styling
- **🧩 shadcn/ui** - Component library
- **📊 Recharts** - Data visualization
- **🎭 Framer Motion** - Animations

### Backend & Services
- **🗄️ Supabase** - PostgreSQL database & auth
- **☁️ Cloudinary** - Image storage & optimization
- **🔐 Supabase Auth** - OAuth & email authentication

### PWA & Optimization
- **📱 Vite PWA Plugin** - Service worker generation
- **⚙️ Workbox** - Caching strategies
- **🚀 Code Splitting** - Dynamic imports
- **🖼️ Image Optimization** - Lazy loading

### State Management
- **🔄 React Query** - Server state management
- **🎣 React Hooks** - Local state
- **🌐 React Router** - Client-side routing

---

## 📁 Project Structure

```
lift-log-kit/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker for offline
│   ├── icon-192.png          # App icons
│   └── icon-512.png
├── src/
│   ├── assets/
│   │   └── exercises/        # 64 exercise images
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── BottomNav.tsx     # Navigation component
│   │   ├── InstallPrompt.tsx # PWA install banner
│   │   ├── OfflineIndicator.tsx
│   │   └── RequireAuth.tsx   # Protected route wrapper
│   ├── context/
│   │   └── AuthProvider.tsx  # Auth context
│   ├── data/
│   │   └── dummyData.ts      # Exercise data & images
│   ├── lib/
│   │   ├── supabaseClient.ts # Supabase config
│   │   └── cloudinary.ts     # Image upload helper
│   ├── pages/
│   │   ├── Home.tsx          # Dashboard
│   │   ├── ExerciseList.tsx  # Browse exercises
│   │   ├── ExerciseDetail.tsx # Exercise history
│   │   ├── Workout.tsx       # Active workout
│   │   ├── Summary.tsx       # Analytics
│   │   ├── ProgressPhotos.tsx # Photo gallery
│   │   ├── Profile.tsx       # User profile
│   │   └── Login.tsx         # Authentication
│   ├── utils/
│   │   └── registerSW.ts     # PWA registration
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📸 Screenshots

<div align="center">

### Home Dashboard
![Home](https://via.placeholder.com/300x600/1a1a1a/ffffff?text=Home+Dashboard)

### Workout Logger
![Workout](https://via.placeholder.com/300x600/1a1a1a/ffffff?text=Active+Workout)

### Progress Photos
![Progress](https://via.placeholder.com/300x600/1a1a1a/ffffff?text=Progress+Photos)

### Analytics
![Analytics](https://via.placeholder.com/300x600/1a1a1a/ffffff?text=Analytics)

</div>

---

## 🎯 Roadmap

### Coming Soon
- [ ] 🍎 Nutrition tracking integration
- [ ] 🤝 Social features & workout sharing
- [ ] 📅 Workout templates & programs
- [ ] 🏆 Challenges & leaderboards
- [ ] 📊 Advanced analytics & insights
- [ ] 🔔 Workout reminders
- [ ] 📱 Native iOS/Android apps
- [ ] 🎥 Exercise video tutorials
- [ ] 📤 Data export (CSV/PDF)
- [ ] 🌍 Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Exercise Images** - Sourced from fitness databases
- **Icons** - Lucide React
- **UI Components** - shadcn/ui

---

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with friends

---

<div align="center">

**Made with ❤️ and 💪 by fitness enthusiasts**

[⬆ Back to Top](#-liftlogkit---your-ultimate-gym-companion)

</div>