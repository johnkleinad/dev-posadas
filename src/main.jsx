import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import outputs from '../amplify_outputs.json'
import '@fontsource/bangers/400.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/800.css'
import './index.css'
import App from './App.jsx'

Amplify.configure(outputs)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
