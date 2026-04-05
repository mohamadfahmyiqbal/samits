import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import './DashboardScreen.css';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import DashboardHeader from './components/DashboardHeader';
import DashboardFilter from './components/DashboardFilter';
import DashboardTable from './components/DashboardTable';
import { useDashboardScreen } from './hooks/useDashboardScreen';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

console.log('📊 DashboardScreen component loaded!');

export default function DashboardScreen() {
 console.log('📊 DashboardScreen component rendering');

 const {
  socket,
  isConnected,
  loading,
  filterStatus,
  setFilterStatus,
  pieStatusData,
  pieCategoryData,
  currentAlerts,
  indexOfFirst,
  currentPage,
  totalPages,
  paginate,
  goToSummary,
 } = useDashboardScreen();

 // Mock data ITAM+ITSM+CMMS metrics
 const metrics = {
  totalAssets: 1245,
  openWorkOrders: 23,
  activeTickets: 17,
  lowStock: 8,
  depreciationThisMonth: 45,
  depreciationNextMonth: 67,
 };


 // Mock priority data
 const priorityData = {
  labels: ['Critical', 'High', 'Medium', 'Low'],
  datasets: [{
   label: 'Work Order Priority',
   data: [3, 7, 8, 5],
   backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745'],
  }],
 };

 return (
  <Container fluid className='page-wrapper'>
   <DashboardHeader socket={socket} isConnected={isConnected} />

   {/* ASSET Section - First Section */}
   <div className="mb-5">
    <h4 className="mb-3">Asset Management</h4>
    <Row className="g-3">
     <Col md={3} sm={6}>
      <Card className="metric-card h-100">
       <Card.Body className="text-center">
        <h3 className="text-primary mb-1">{metrics.totalAssets.toLocaleString()}</h3>
        <h6 className="text-muted">Total Assets</h6>
       </Card.Body>
      </Card>
     </Col>

      {/* Depreciation Cards - Bulan Ini (Merah) */}
     <Col md={3} sm={6}>
      <Card className="metric-card h-100 bg-danger text-white">
       <Card.Body className="text-center">
        <h3 className="mb-1">{metrics.depreciationThisMonth}</h3>
        <small>Dispose Bulan Ini</small>
       </Card.Body>
      </Card>
     </Col>

     {/* Depreciation Cards - Bulan Depan (Kuning) */}
     <Col md={3} sm={6}>
      <Card className="metric-card h-100 bg-warning text-dark">
       <Card.Body className="text-center">
        <h3 className="mb-1">{metrics.depreciationNextMonth}</h3>
        <small>DisposeBulan Depan</small>
       </Card.Body>
      </Card>
     </Col>    
    </Row>
   </div>

   {/* PREVENTIVE MAINTENANCE Section - WITH Weekly Schedule */}
   <div className="mb-5">
    <Row>
     <Col md={12}>
      <h4 className="mb-3">Preventive Maintenance</h4>
      <Row className="g-3">
       <Col md={3} sm={6}>
        <Card className="metric-card h-100">
         <Card.Body className="text-center">
          <h3 className="text-success mb-1">156</h3>
          <h6 className="text-muted">Total PM Schedule</h6>
         </Card.Body>
        </Card>
       </Col>
       <Col md={3} sm={6}>
        <Card className="metric-card h-100">
         <Card.Body className="text-center">
          <h3 className="text-info mb-1">23</h3>
          <h6 className="text-muted">Due This Week</h6>
         </Card.Body>
        </Card>
       </Col>
       <Col md={3} sm={6}>
        <Card className="metric-card h-100 bg-info text-white">
         <Card.Body className="text-center">
          <h3 className="mb-1">89%</h3>
          <small>Compliance Rate</small>
         </Card.Body>
        </Card>
       </Col>
       <Col md={3} sm={6}>
        <Card className="metric-card h-100">
         <Card.Body className="text-center">
          <h3 className="text-warning mb-1">12</h3>
          <h6 className="text-muted">Overdue PM</h6>
         </Card.Body>
        </Card>
       </Col>
      </Row>
     </Col>
     {/* Gantt Chart Weekly Schedule */}
     <div className="gantt-chart-container">
      <h6 className="mb-2">Weekly Gantt Schedule</h6>
      <div className="gantt-wrapper">
        <div className="gantt-header">
          <div className="gantt-cell">Task</div>
          <div className="gantt-cell">Mon</div>
          <div className="gantt-cell">Tue</div>
          <div className="gantt-cell">Wed</div>
          <div className="gantt-cell">Thu</div>
          <div className="gantt-cell">Fri</div>
        </div>
        <div className="gantt-row">
          <div className="gantt-label">Server-DC01</div>
          <div className="gantt-bar success-bar full-width"></div>
        </div>
        <div className="gantt-row">
          <div className="gantt-label">SW-01</div>
          <div className="gantt-bar info-bar two-days"></div>
        </div>
        <div className="gantt-row">
          <div className="gantt-label">Laptop-XYZ</div>
          <div className="gantt-bar warning-bar three-days"></div>
        </div>
        <div className="gantt-row critical-row">
          <div className="gantt-label">Printer-ABC</div>
          <div className="gantt-bar danger-bar overdue"></div>
        </div>
        <div className="gantt-row">
          <div className="gantt-label">UPS-01</div>
          <div className="gantt-bar success-bar single-day"></div>
        </div>
      </div>
      <small className="text-muted mt-2 d-block">Hover untuk detail • Click untuk edit</small>
     </div>

    </Row>
   </div>

  

  </Container>
 );
}

