import { Container, Row, Col, Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import DashboardHeader from "./components/DashboardHeader";
import DashboardFilter from "./components/DashboardFilter";
import DashboardTable from "./components/DashboardTable";
import { useDashboardScreen } from "./hooks/useDashboardScreen";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardScreen() {
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

  return (
    <Container fluid className="page-wrapper">
      <DashboardHeader socket={socket} isConnected={isConnected} />

      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3 chart-card">
            <h6>Status Maintenance</h6>
            {pieStatusData.labels.length > 0 && <Pie data={pieStatusData} />}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 chart-card">
            <h6>Distribusi Kategori Asset</h6>
            {pieCategoryData.labels.length > 0 && <Pie data={pieCategoryData} />}
          </Card>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md={3}>
          <DashboardFilter value={filterStatus} onChange={setFilterStatus} />
        </Col>
      </Row>

      <DashboardTable
        loading={loading}
        alerts={currentAlerts}
        indexOfFirst={indexOfFirst}
        currentPage={currentPage}
        totalPages={totalPages}
        onPaginate={paginate}
        onDetail={goToSummary}
      />
    </Container>
  );
}
