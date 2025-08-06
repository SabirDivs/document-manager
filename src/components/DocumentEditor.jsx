import { useState, useEffect } from 'react'
import { Form, Button, Spinner, Card, Alert } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient'

export default function DocumentEditor({ userId, document, onSave }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (document) {
      setTitle(document.title || '')
      setContent(document.content || '')
      setIsPublic(document.is_public || false)
    } else {
      setTitle('')
      setContent('')
      setIsPublic(false)
    }
  }, [document])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const docData = {
        title,
        content,
        user_id: userId,
        is_public: isPublic
      }
      
      if (document) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update(docData)
          .eq('id', document.id)
        
        if (error) throw error
      } else {
        // Create new document
        const { error } = await supabase
          .from('documents')
          .insert(docData)
        
        if (error) throw error
      }
      
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        if (onSave) onSave()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column h-100">
        {error && <Alert variant="danger">{error}</Alert>}
        {saved && <Alert variant="success" className="mb-3">Document saved successfully!</Alert>}
        
        <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3 flex-grow-1 d-flex flex-column">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              className="flex-grow-1"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document content"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Make this document public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end mt-auto">
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {document ? 'Saving...' : 'Creating...'}
                </>
              ) : document ? (
                'Save Changes'
              ) : (
                'Create Document'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}