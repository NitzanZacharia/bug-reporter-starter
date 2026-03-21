import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

interface Report {
  id: string;
  issueType: string; 
  description: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
}

export function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); 
  useEffect(() => { 
    const fetchMyReports = async () => {
      const userEmail = localStorage.getItem('userEmail');
       const userStatus = localStorage.getItem('userStatus');    
      if (!userEmail || userStatus === 'blacklisted') {
        navigate('/login');
        return;
      }  
     
      
      try {
        const response = await fetch('http://localhost:4000/api/reports?email=' + encodeURIComponent(userEmail));
        if (!response.ok) {
          throw new Error('Failed to fetch reports.');
        }
        const data = await response.json();
        const sortedData = data.sort((a: Report, b: Report) => b.createdAt - a.createdAt);
        setReports(sortedData);
      } catch (err) {
        setError('Failed to fetch your reports.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyReports();
  }, [navigate]);
  
  
  

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
  if (isLoading) {
    return (
      <div className="page">
        <h1>Reports List</h1>
        <p>Loading your reports...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="page">  
        <h1>Reports List</h1>
        <p className="error">{error}</p>
      </div>
    );
  }
  return (
    <div className="page">
      <h1>Reports List</h1>

      <p className="placeholder-text">
        <strong>My Submitted Reports:</strong> 
      </p>

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (

      
      <div className="placeholder-box">
        <table style={{width: '100%'}}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc'}}>
            
            <th>Issue</th>
            <th>Description</th>
            <th>Date</th>
            <th>Attachment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.issueType}</td>
              <td>{report.description}</td>
              <td style={{ padding: '0.5rem'}}>
                <div>Submitted: {formatDate(report.createdAt)}</div>
                {report.approvedAt && (
                  <div>Approved: {formatDate(report.approvedAt)}</div>
                )}
              </td>
              <td style={{ padding: '0.5rem'}}>
                {report.attachmentUrl ? (
                  <a href={'http://localhost:4000' + report.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                ) : (
                  'No attachment'
                )}
              </td>
             
              <td>
                {report.status === 'NEW' && (
                    <span style={{ color: 'orange', fontWeight: 'bold' }}>Pending Approval</span>
                )}
                {report.status === 'APPROVED' && (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Approved</span>
                )}
                {report.status === 'RESOLVED' && (
                    <span style={{ color: 'blue', fontWeight: 'bold' }}>Resolved</span>
                  
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

     )}
    </div>
  );
}
