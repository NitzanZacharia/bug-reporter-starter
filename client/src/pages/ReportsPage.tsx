import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

interface Report {
  id: string;
  issueType: string; 
  description: string;
  contactName: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); 
  useEffect(() => { 
    const fetchReports = async () => {
      const userStatus = localStorage.getItem('userStatus');    
      if (userStatus !== 'admin') {
        navigate('/report');
        return;
      }
      try {
        const response = await fetch('http://localhost:4000/api/reports');
        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError('Failed to fetch reports.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [navigate]);

  const handleStatusChange = async (reportId: string, newStatus: 'approve' | 'resolve') => {
    try {
      const response = await fetch(`http://localhost:4000/api/reports/${reportId}/${newStatus}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to update report status.');
      }
      const updatedReport = await response.json();
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? updatedReport : report
        )
      );
    } catch (err) {
      setError('Failed to update report status.');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
  if (isLoading) {
    return (
      <div className="page">
        <h1>Reports List</h1>
        <p>Loading reports...</p>
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
        <strong>You're signed in as Admin.</strong> 
      </p>

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (

      
      <div className="placeholder-box">
        <table style={{width: '100%'}}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc'}}>
            <th>Reporter</th>
            <th>Issue</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            <th>Attachment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.contactName}</td>
              <td>{report.issueType}</td>
              <td>{report.description}</td>
              <td>{report.status}</td>
              <td style={{ padding: '0.5rem'}}>
                <div>Created: {formatDate(report.createdAt)}</div>
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
                  <button
                    className="btn btn-success"
                    onClick={() => handleStatusChange(report.id, 'approve')}
                  >
                    Approve
                  </button>
                )}
                {report.status === 'APPROVED' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(report.id, 'resolve')}
                  >
                    Resolve
                  </button>
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
