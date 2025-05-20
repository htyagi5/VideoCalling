import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import { SocketProvider } from './context/socketProvider.jsx'

createRoot(document.getElementById('root')).render(
<BrowserRouter>
    <SocketProvider>
       <App />
     </SocketProvider>
</BrowserRouter>,
  
)
