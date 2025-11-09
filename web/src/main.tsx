import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { AppRouter } from './router'
import './index.css'
import { Toaster as SonnerToaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppRouter />
      <Toaster />
      <SonnerToaster 
        position="top-right" 
        richColors 
        expand={false}
        duration={3000}
      />
    </ThemeProvider>
  </StrictMode>,
)
