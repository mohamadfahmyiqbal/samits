import { Badge, Button } from "react-bootstrap";
import PropTypes from "prop-types";

export default function DashboardHeader({ socket, isConnected }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4>Dashboard Maintenance</h4>
      <div>
        <Badge bg={isConnected ? "success" : "danger"} className="me-2">
          Socket: {isConnected ? "Connected" : "Disconnected"}
        </Badge>
        <Button variant="outline-primary" size="sm" onClick={() => socket.ping()} disabled={!isConnected}>
          Test Socket
        </Button>
      </div>
    </div>
  );
}

DashboardHeader.propTypes = {
  socket: PropTypes.shape({
    ping: PropTypes.func.isRequired,
  }).isRequired,
  isConnected: PropTypes.bool.isRequired,
};
