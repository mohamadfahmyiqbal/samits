import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

export default function DashboardFilter({ value, onChange }) {
  return (
    <Form.Select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="all">All</option>
      <option value="normal">Normal</option>
      <option value="abnormal">Abnormal</option>
    </Form.Select>
  );
}

DashboardFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
