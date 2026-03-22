import { useState, FormEvent } from 'react';
import { apiClient } from '../api/client';
import { CreateReportPayload } from '../types/Report';

function validateField(value: string): string[] {
  const issues: string[] = [];

  
  if (value.length < 3) {
    issues.push('Must be at least 3 characters');
  }

  return issues;
}

export function ReportPage() {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState(localStorage.getItem('userEmail') || '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  // file upload and validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
 

  if( !validTypes.includes(selectedFile.type) ) {
    setError('Invalid file type: Only PNG, JPG, and PDF are allowed.');
    setFile(null);
    return;
  }
    if (selectedFile.size > maxFileSize) {
      setError('File size exceeds 5MB limit.');
      setFile(null);
      return;
    }
  setFile(selectedFile);
  };
  const descriptionValidation = validateField(description);
  const nameValidation = validateField(contactName);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    // inline validation for required fields
    if (!issueType) {
      setError('Please select an issue type.');
      setIsSubmitting(false);
      return;
    }

    const descriptionIssues = validateField(description);
    if (descriptionIssues.length > 0) {
      setError('Description error: ' + descriptionIssues.join(', '));
      setIsSubmitting(false);
      return;
    }

    const nameIssues = validateField(contactName);
    if (nameIssues.length > 0) {
      setError('Name error: ' + nameIssues.join(', '));
      setIsSubmitting(false);
      return;
    }

    const isValidEmail = contactEmail && /^\S+@\S+\.\S+$/.test(contactEmail);
    if (!isValidEmail) {
      setError('Invalid email format.');
      setIsSubmitting(false);
      return;
    }
  try {
    const payload: CreateReportPayload = {
      issueType,
      description,
      contactName,
      contactEmail,
      attachment: file ? file.name : null
    };

    await apiClient.createReport(payload);
    setSuccessMessage('Report submitted successfully!');
    // Clear form fields
    setIssueType('');
    setDescription('');
    setContactName('');
    setContactEmail('');
    setFile(null);
  } catch (err) {
    setError('Failed to submit report. Please try again later.');
  } finally {
    setIsSubmitting(false);
  };
  }
  const handleCaptureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      
      video.srcObject = stream;
      await video.play(); 
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach(track => track.stop());
      canvas.toBlob((blob) => {
        if (blob) {
          const screenshotFile = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
          setFile(screenshotFile);
          setError(''); 
        }
      }, 'image/png');

    } catch (err) {
      console.log('Screenshot cancelled or failed', err);
    }
  };
  return (
    <div className="page">
      <h1>Report a Bug</h1>
      {error && <div className="error">{error}</div>}
      {successMessage && <div style={{ color: 'green', backgroundColor: '#dcfce7', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>{successMessage}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="issueType">Issue Type</label>
          <select
            id="issueType"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
            > 
            <option value="" disabled>Select an issue type</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Improvement">Improvement</option>
            <option value="Documentation">Documentation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            rows={5}
            required
          />
          {descriptionValidation.length > 0 && (
            <span className="validation-hint">
              {descriptionValidation.length} validation checks
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactName">Your Name</label>
          <input
            type="text"
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Enter your name"
            required
          />
          {nameValidation.length > 0 && (
            <span className="validation-hint">
              {nameValidation.length} validation checks
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Your Email</label>
          <input
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="attachment">Attachment (optional: PNG, JPG, or PDF, max 5MB)</label>
          <input
            type="file"
            id="attachment"
            accept=".png, .jpg, .jpeg, .pdf"
            onChange={handleFileChange}
            key={file ? file.name : 'empty'}
          />
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>OR</span>
            
            <button 
              type="button" 
              onClick={handleCaptureScreen}
              style={{ 
                backgroundColor: '#efefef', 
                color: '#000', 
                border: '1px solid #767676', 
                padding: '2px 6px', 
                borderRadius: '3px', 
                fontSize: '15.33px', 
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                width: 'fit-content',
                whiteSpace: 'nowrap',
                flex: 'none'
              }}
            >
              Capture Screen
            </button>
          </div>
          
          {file && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#059669' }}>
            Attached: {file.name}
          </div>}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );

  }
