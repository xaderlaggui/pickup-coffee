import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { SplashScreen } from "./components/SplashScreen"
import "./index.css"

function Root() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splash-seen')
  )

  // Use the .app class on a wrapper to ensure CSS variables like --background are applied
  return (
    <div className="app">
      {showSplash ? (
        <SplashScreen onDone={() => setShowSplash(false)} />
      ) : (
        <App />
      )}
      <div className="portrait-only-notice" role="status">
        Please rotate your phone to portrait to continue.
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
