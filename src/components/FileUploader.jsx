import { useState } from 'react'
import { Button, Spinner, ProgressBar, Alert } from 'react-bootstrap'
import { supabase } from '../lib/supabaseClient'

export default function FileUploader({ userId }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      setUploading(true)
      setError('')
      setSuccess('')
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onProgress: (progress) => {
            setProgress(progress.loaded / progress.total * 100)
          }
        })
      
      if (error) throw error
      setSuccess(`File "${file.name}" uploaded successfully!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setProgress(0)
      e.target.value = ''
    }
  }

  return (
    <div className="mt-3">
      <div className="mb-3">
        <h5>Upload Files</h5>
        <p className="text-muted">Upload PDF, DOC, TXT, or other document files</p>
      </div>
      
      <div className="d-grid">
        <Button 
          variant="outline-primary" 
          as="label"
          disabled={uploading}
          className="position-relative"
        >
          {uploading ? (
            <div className="d-flex align-items-center justify-content-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading...
            </div>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up me-2"></i>
              Select File to Upload
            </>
          )}
          <input
            type="file"
            className="visually-hidden"
            onChange={uploadFile}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
          />
        </Button>
      </div>
      
      {uploading && (
        <div className="mt-3">
          <ProgressBar 
            now={progress} 
            label={`${Math.round(progress)}%`} 
            className="mt-2"
            animated
            variant="success"
          />
          <small className="text-muted d-block mt-1">Upload in progress...</small>
        </div>
      )}
      
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      
      <div className="mt-4">
        <h6>Accepted File Types</h6>
        <div className="d-flex flex-wrap gap-2">
          <Badge bg="light" text="dark" className="border">
            PDF (.pdf)
          </Badge>
          <Badge bg="light" text="dark" className="border">
            Word (.doc, .docx)
          </Badge>
          <Badge bg="light" text="dark" className="border">
            Text (.txt)
          </Badge>
          <Badge bg="light" text="dark" className="border">
            Markdown (.md)
          </Badge>
        </div>
      </div>
    </div>
  )
}