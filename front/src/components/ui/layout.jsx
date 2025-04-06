import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "./theme-provider"
import { FloatingFoodIcons } from "./floating-food-icons"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Food Explorer</title>
        <meta name="description" content="Explore delicious food items with our interactive app" />
      </head>
      <body className={inter.className}>
        <FloatingFoodIcons />
        <ThemeProvider attribute="class" defaultTheme="light" disableSystemTheme>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

