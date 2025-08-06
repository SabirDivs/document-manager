import { useState, useEffect } from 'react'
import { ListGroup, Badge, Spinner, Button } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient'

export default function DocumentList({ userId, onSelectDocument }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    fetchDocuments()
    setupRealtime()
  }, [userId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    const subscription = supabase
      .channel('public:documents')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'documents' },
        () => fetchDocuments()
      )
      .subscribe()
    
    return () => supabase.removeChannel(subscription)
  }

  const deleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSelect = (doc) => {
    setSelectedId(doc.id)
    if (onSelectDocument) onSelectDocument(doc)
  }

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" size="sm" className="me-2" />
        Loading documents...
      </div>
    )
  }

  return (
    <div className="mt-2">
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      
      {documents.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-folder-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
          <p className="mt-3">No documents found</p>
          <p className="text-muted">Create your first document to get started</p>
        </div>
      ) : (
        <ListGroup>
          {documents.map(doc => (
            <ListGroup.Item 
              key={doc.id} 
              className={`document-item ${selectedId === doc.id ? 'active' : ''}`}
              onClick={() => handleSelect(doc)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-2">
                  <div className="fw-medium">{doc.title || 'Untitled Document'}</div>
                  <small className="text-muted">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </small>
                </div>
                
                <div>
                  {doc.is_public && (
                    <Badge bg="success" className="me-1">Public</Badge>
                  )}
                  <Button 
                    variant="link" 
                    className="text-danger p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    title="Delete document"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  )
}