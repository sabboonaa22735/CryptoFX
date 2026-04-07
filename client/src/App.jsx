import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import Indices from './pages/Indices'
import Stocks from './pages/Stocks'
import Futures from './pages/Futures'
import CopyTrading from './pages/CopyTrading'
import Trade from './pages/Trade'
import Portfolio from './pages/Portfolio'
import Wallet from './pages/Wallet'
import AIChat from './pages/AIChat'
import Support from './pages/Support'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import SuperAdmin from './pages/SuperAdmin'
import DepositConfirmation from './pages/DepositConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Landing from './pages/Landing'
import About from './pages/About'
import Prices from './pages/Prices'
import { useAdminUpdates } from './hooks/useAdminUpdates'

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 5000,
      gcTime: 300000,
    },
  },
})

const AdminUpdatesListener = () => {
  const { isAuthenticated } = useAuthStore()
  useAdminUpdates({
    enabled: isAuthenticated(),
    onUpdate: (type, data) => {
      console.log('[App] Admin update received:', type, data)
    }
  })
  return null
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminUpdatesListener />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/superadmin" element={<SuperAdmin />} />
          
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="markets" element={<PrivateRoute><Markets /></PrivateRoute>} />
            <Route path="indices" element={<PrivateRoute><Indices /></PrivateRoute>} />
            <Route path="stocks" element={<PrivateRoute><Stocks /></PrivateRoute>} />
            <Route path="futures" element={<PrivateRoute><Futures /></PrivateRoute>} />
            <Route path="copytrading" element={<PrivateRoute><CopyTrading /></PrivateRoute>} />
            <Route path="trade" element={<PrivateRoute><Trade /></PrivateRoute>} />
            <Route path="trade/:symbol" element={<PrivateRoute><Trade /></PrivateRoute>} />
            <Route path="portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
            <Route path="wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
            <Route path="ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
            <Route path="support" element={<PrivateRoute><Support /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="deposit/:coin?" element={<PrivateRoute><DepositConfirmation /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
