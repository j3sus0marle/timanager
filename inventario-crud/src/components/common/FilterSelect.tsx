import React from "react";
import { Form } from "react-bootstrap";

interface FilterSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ options, value, onChange, placeholder, className }) => (
  <Form.Select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={className}
  >
    <option value="">{placeholder || "Filtrar..."}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </Form.Select>
);

export default FilterSelect;
