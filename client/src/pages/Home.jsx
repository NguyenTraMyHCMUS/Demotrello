import React from 'react'
import { Button } from '@/components/ui/button'
import api from '@/api/axios.js'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await api.post('/auth/logout');
      if (response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  return (
    <div>
      <Button variant="outline" onClick={handleLogout}>Log out</Button>
    </div>
  )
}

export default Home