import { useState, useEffect } from 'react';
import { Button, Spinner, ProgressBar, Alert, ListGroup, Badge } from 'react-bootstrap';
import { supabase } from '../lib/supabaseClient';

export default function FileUploader({ userId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Fetch user's files on component mount
  useEffect(() => {
    fetchUserFiles();
  }, [userId]);

  const fetchUserFiles = async () => {
    try {
      setLoadingFiles(true);
      const { data, error } = await supabase.storage
        .from('documents')
        .list(`${userId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });
      
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      const { error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onProgress: (progress) => {
            setProgress(progress.loaded / progress.total * 100);
          }
        });
      
      if (error) throw error;
      setSuccess(`File "${file.name}" uploaded successfully!`);
      fetchUserFiles(); // Refresh file list
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
    }
  };

  const downloadFile = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(`${userId}/${fileName}`);
      
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  };

  const deleteFile = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([`${userId}/${fileName}`]);
      
      if (error) throw error;
      setSuccess(`File "${fileName}" deleted successfully!`);
      fetchUserFiles(); // Refresh file list
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="mb-4">
      <h5>Upload Files</h5>
      
      <div className="d-grid mb-4">
        <Button 
          variant="outline-primary" 
          as="label"
          disabled={uploading}
        >
          {uploading ? (
            <div className="d-flex align-items-center justify-content-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Uploading...
            </div>
          ) : (
            <><i className="bi bi-cloud-arrow-up me-2"></i> Select File to Upload</>
          )}
          <input
            type="file"
            className="visually-hidden"
            onChange={uploadFile}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.txt,.md,.jpg,.png"
          />
        </Button>
      </div>
      
      {uploading && (
        <ProgressBar 
          now={progress} 
          label={`${Math.round(progress)}%`} 
          className="mt-2 mb-4"
          animated
          variant="success"
        />
      )}
      
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      
      <div className="mt-4">
        <h5>Your Uploaded Files</h5>
        
        {loadingFiles ? (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <i className="bi bi-folder-x" style={{ fontSize: '2rem' }}></i>
            <p>No files uploaded yet</p>
          </div>
        ) : (
          <ListGroup>
            {files.map((file) => (
              <ListGroup.Item key={file.name} className="d-flex justify-content-between align-items-center">
                <div className="text-truncate" style={{ maxWidth: '60%' }}>
                  <i className="bi bi-file-earmark me-2"></i>
                  {file.name}
                </div>
                <div>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    className="me-2"
                    onClick={() => downloadFile(file.name)}
                    title="Download"
                  >
                    <i className="bi bi-download"></i>
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => deleteFile(file.name)}
                    title="Delete"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
}