import { useState } from 'react'
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <i className="bi bi-files" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
            <h3 className="mt-2">Document Manager</h3>
          </div>
          
          <Card.Title className="text-center mb-4">
            {isSignUp ? 'Create Account' : 'Login to Your Account'}
          </Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleAuth}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </Form.Group>
            
            <div className="d-grid mb-3">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isSignUp ? 'Creating Account...' : 'Logging In...'}
                  </>
                ) : isSignUp ? (
                  'Sign Up'
                ) : (
                  'Login'
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-decoration-none"
              >
                {isSignUp 
                  ? 'Already have an account? Login' 
                  : "Don't have an account? Sign Up"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}