
import { Badge, Button, Card, Pagination, Table } from "react-bootstrap";
import PropTypes from "prop-types";

export default function DashboardTable({
  loading,
  alerts,
  indexOfFirst,
  currentPage,
  totalPages,
  onPaginate,
  onDetail,
}) {
  return (
    <Card className="mt-2">
      <Card.Header className="bg-primary text-white">Alert Maintenance</Card.Header>
      <Card.Body>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Asset Name</th>
                  <th>PIC</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length > 0 ? (
                  alerts.map((item, index) => (
                    <tr key={item.assetId || index}>
                      <td>{indexOfFirst + index + 1}</td>
                      <td>{item.assetId}</td>
                      <td>{item.pic}</td>
                      <td>{item.category}</td>
                      <td>
                        <Badge bg={item.result === "Abnormal" ? "danger" : "success"}>{item.result || "Normal"}</Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={onDetail}>
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Tidak ada alert maintenance saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="justify-content-center">
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => onPaginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

DashboardTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  alerts: PropTypes.arrayOf(PropTypes.object).isRequired,
  indexOfFirst: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPaginate: PropTypes.func.isRequired,
  onDetail: PropTypes.func.isRequired,
};
