# 🎨 Color Palette Generator

A modern web application that uses AI to extract beautiful color palettes from images. Built with Next.js 15, React 19, and Google's Gemini AI.

![Color Palette Generator](https://img.shields.io/badge/Next.js-15-338B8F?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-338B8F?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-FFDA33?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-FFDA33?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **🤖 AI-Powered Color Extraction** - Uses Google Gemini AI to intelligently analyze images and extract meaningful color palettes
- **🎯 Smart Color Analysis** - Provides creative color names, descriptions, and mood analysis
- **💾 Persistent Storage** - Save and manage your favorite color palettes locally
- **📱 Responsive Design** - Works seamlessly across desktop, tablet, and mobile devices
- **🎨 Interactive UI** - Drag & drop image upload with real-time feedback
- **📋 One-Click Copy** - Copy hex codes to clipboard instantly
- **💾 Export Functionality** - Download palettes for use in design tools
- **🔄 Dynamic Color Count** - Generate palettes with 3-8 colors
- **♿ Accessibility First** - Built with Radix UI components for full accessibility

## 🚀 Live Demo

[View Live Application](arrecifes-colors.vercel.app)

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### State Management & Data

- **Zustand** - Lightweight state management
- **Zod** - Schema validation
- **Local Storage** - Client-side persistence

### AI & APIs

- **Google Gemini AI** - Advanced image analysis
- **Vercel AI SDK** - Streamlined AI integration

### Development Tools

- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Google AI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/color-palette-generator.git
   cd color-palette-generator
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.template .env.local
   ```

   Add your Google AI API key:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

### Getting Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── actions.ts         # Server actions for AI integration
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components (Radix UI)
│   ├── ColorPalette.tsx  # Palette display component
│   ├── Header.tsx        # Application header
│   ├── ImageUpload.tsx   # Image upload interface
│   └── ...               # Other components
├── lib/                  # Utilities and configurations
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── styles/               # Global styles
└── public/               # Static assets
```

## 🎯 Key Features Explained

### AI-Powered Analysis

The application uses Google's Gemini AI to analyze uploaded images and extract:

- Dominant colors with hex codes
- Creative color names and descriptions
- Overall mood and aesthetic analysis
- Intelligent color selection based on visual prominence

### Smart State Management

- **Zustand** for lightweight, performant state management
- **Persistent storage** with automatic compression for saved palettes
- **Real-time updates** across all components

### Modern UI/UX

- **Drag & drop** image upload with visual feedback
- **Responsive design** that works on all devices
- **Accessibility-first** approach with proper ARIA labels
- **Smooth animations** and micro-interactions

## 🚀 Deployment

This application is optimized for deployment on:

- **Vercel** (Recommended)
- **Netlify**
- **Railway**
- **AWS Amplify**

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/color-palette-generator)

1. Connect your GitHub repository
2. Add your `GOOGLE_GENERATIVE_AI_API_KEY` environment variable
3. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**David Silgado Salcedo**

- GitHub: [@dsilgadosalcedo](https://github.com/dsilgadosalcedo)
- LinkedIn: [dsilgadosalcedo](https://linkedin.com/in/dsilgadosalcedo)
- Portfolio: [dsilgado.vercel.app](https://dsilgado.vercel.app/)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Google AI](https://ai.google.dev/) for the powerful Gemini API
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

⭐ **If you found this project helpful, please give it a star!** ⭐
