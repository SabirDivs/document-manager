import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Navbar, Nav } from 'react-bootstrap';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import FileUploader from './components/FileUploader';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleNewDocument = () => {
    setCurrentDocument(null);
    setActiveTab('editor');
  };

  const handleDocumentSelect = (doc) => {
    setCurrentDocument(doc);
    setActiveTab('editor');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Navbar.Brand className="d-flex align-items-center">
          <i className="bi bi-files me-2"></i>
          <span>Document Manager</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link 
              active={activeTab === 'documents'} 
              onClick={() => setActiveTab('documents')}
            >
              <i className="bi bi-folder me-1"></i> Documents
            </Nav.Link>
            <Nav.Link 
              active={activeTab === 'editor'} 
              onClick={() => setActiveTab('editor')}
            >
              <i className="bi bi-pencil me-1"></i> Editor
            </Nav.Link>
            <Nav.Link 
              active={activeTab === 'upload'} 
              onClick={() => setActiveTab('upload')}
            >
              <i className="bi bi-upload me-1"></i> Files
            </Nav.Link>
            
            <div className="d-flex align-items-center ms-3">
              <span className="text-light me-2">
                <i className="bi bi-person-circle me-1"></i>
                {session.user.email}
              </span>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => supabase.auth.signOut()}
              >
                Logout
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="flex-grow-1 d-flex p-0">
        <Row className="flex-grow-1 g-0">
          <Col md={3} className="sidebar p-3 border-end">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>
                {activeTab === 'documents' && 'My Documents'}
                {activeTab === 'upload' && 'File Manager'}
                {activeTab === 'editor' && 'Document Editor'}
              </h5>
              
              {activeTab === 'documents' && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleNewDocument}
                >
                  <i className="bi bi-plus-lg me-1"></i> New
                </Button>
              )}
            </div>
            
            <div className="flex-grow-1">
              {activeTab === 'documents' && (
                <DocumentList 
                  userId={session.user.id} 
                  onSelectDocument={handleDocumentSelect}
                />
              )}
              
              {activeTab === 'upload' && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Use the main panel to manage files
                </div>
              )}
              
              {activeTab === 'editor' && !currentDocument && (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Create a new document or select one from your documents list
                </div>
              )}
            </div>
          </Col>
          
          <Col md={9} className="main-content p-4">
            {activeTab === 'editor' ? (
              <DocumentEditor 
                userId={session.user.id} 
                document={currentDocument}
                onSave={() => {
                  setCurrentDocument(null);
                  setActiveTab('documents');
                }}
              />
            ) : activeTab === 'upload' ? (
              <FileUploader userId={session.user.id} />
            ) : activeTab === 'documents' ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <div className="text-center mb-4">
                  <i className="bi bi-files" style={{ fontSize: '5rem', color: '#e9ecef' }}></i>
                </div>
                <h3 className="text-muted">Document Manager</h3>
                <p className="text-center text-muted">
                  Select a document to edit or create a new one
                </p>
              </div>
            ) : null}
          </Col>
        </Row>
      </Container>

      <footer className="footer py-3 bg-light border-top">
        <Container>
          <Row>
            <Col className="text-center text-muted">
              <small>
                Document Manager &copy; {new Date().getFullYear()} | 
                Powered by Supabase | 
                User: {session.user.email}
              </small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default App;