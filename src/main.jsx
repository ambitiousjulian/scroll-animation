import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import ScrapbookPage from "./ScrapbookPage"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ScrapbookPage />
  </StrictMode>
)
