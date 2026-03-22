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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'APPROVED' | 'RESOLVED'>('NEW');
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

  const displayReports = reports.filter(report => statusFilter === 'ALL' || report.status === statusFilter).sort((a, b) => {
    if (a.issueType == 'Bug' && b.issueType != 'Bug') return -1;
    if (a.issueType != 'Bug' && b.issueType == 'Bug') return 1;
    return a.createdAt - b.createdAt;
  });
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
      <div className="filter-container">
        <label htmlFor="statusFilter">Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="ALL">All</option>
          <option value="NEW">New</option>
          <option value="APPROVED">Approved</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {displayReports.length === 0 ? (
        <p>No reports found.</p>
      ) : (

      
      <div className="placeholder-box">
        <table className="simple-table">
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
          {displayReports.map(report => (
            <tr key={report.id}>
              <td>{report.contactName}</td>
              <td>{report.issueType}</td>
              <td>{report.description}</td>
              <td>
                <span className={`status-badge badge-${report.status.toLowerCase()}`}>{report.status}</span>
              </td>
              <td style={{ padding: '0.5rem'}}>
                <div>{formatDate(report.createdAt)}</div>
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
                  'None'
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
