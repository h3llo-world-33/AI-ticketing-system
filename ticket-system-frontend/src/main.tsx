import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'

import CheckAuth from './components/check-auth'
import Tickets from './pages/tickets'
import TicketDetails from './pages/ticket'
import Login from './pages/login'
import Signup from './pages/signup'
import Admin from './pages/admin'
import Navbar from './components/navbar'
// import { useAuthStore } from './store'

// Rehydrate Zustand from localStorage before rendering
// useAuthStore.getState().rehydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={
          <CheckAuth protectedRoute={true}>
            <Tickets />
          </CheckAuth>
        } />
        <Route path='/tickets/:ticketNumber' element={
          <CheckAuth protectedRoute={true}>
            <TicketDetails />
          </CheckAuth>
        } />
        <Route path='/login' element={
          <CheckAuth protectedRoute={false}>
            <Login />
          </CheckAuth>
        } />
        <Route path='/signup' element={
          <CheckAuth protectedRoute={false}>
            <Signup />
          </CheckAuth>
        } />
        <Route path='/admin' element={
          <CheckAuth protectedRoute={true}>
            <Admin />
          </CheckAuth>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
