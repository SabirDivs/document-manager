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
  const [currentDoc, setCurrentDoc] = useState(null);
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

  const handleSelectDocument = (doc) => {
    setCurrentDoc(doc);
    setActiveTab('editor');
  };

  const handleNewDocument = () => {
    setCurrentDoc(null);
    setActiveTab('editor');
  };

  const handleDocumentSaved = () => {
    setCurrentDoc(null);
    setActiveTab('documents');
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
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <i className="bi bi-files me-2"></i>
            <span>Document Manager Pro</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Nav.Link 
                active={activeTab === 'documents'} 
                onClick={() => setActiveTab('documents')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-folder me-1"></i> Documents
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'editor'} 
                onClick={() => {
                  setCurrentDoc(null);
                  setActiveTab('editor');
                }}
                className="d-flex align-items-center"
              >
                <i className="bi bi-pencil me-1"></i> Editor
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'upload'} 
                onClick={() => setActiveTab('upload')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-upload me-1"></i> Upload
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
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="flex-grow-1 d-flex p-0">
        <Row className="flex-grow-1 g-0">
          {/* Sidebar */}
          <Col md={3} className="sidebar p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>
                {activeTab === 'documents' && 'My Documents'}
                {activeTab === 'upload' && 'File Upload'}
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
                  onSelectDocument={handleSelectDocument}
                />
              )}
              
              {activeTab === 'upload' && (
                <FileUploader userId={session.user.id} />
              )}
              
              {activeTab === 'editor' && !currentDoc && (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Create a new document or select one from your documents list
                </div>
              )}
            </div>
          </Col>
          
          {/* Main Content Area */}
          <Col md={9} className="main-content p-4">
            {activeTab === 'editor' ? (
              <div className="h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>
                    {currentDoc ? `Editing: ${currentDoc.title || 'Untitled Document'}` : 'Create New Document'}
                  </h4>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setActiveTab('documents')}
                  >
                    <i className="bi bi-arrow-left me-1"></i> Back to List
                  </Button>
                </div>
                
                <div className="flex-grow-1">
                  <DocumentEditor 
                    userId={session.user.id} 
                    document={currentDoc}
                    onSave={handleDocumentSaved}
                  />
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center h-100">
                <div className="text-center mb-4">
                  <i className="bi bi-files" style={{ fontSize: '5rem', color: '#e9ecef' }}></i>
                </div>
                <h3 className="text-muted">Document Manager Pro</h3>
                <p className="text-center text-muted">
                  {activeTab === 'documents' 
                    ? 'Select a document to edit or create a new one' 
                    : 'Upload files to your document storage'}
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="footer py-3">
        <Container>
          <Row>
            <Col className="text-center text-muted">
              <small>
                Document Manager Pro &copy; {new Date().getFullYear()} | 
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