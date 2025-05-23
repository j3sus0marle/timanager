import React from "react";
import { Form } from "react-bootstrap";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, className }) => (
  <Form.Control
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder || "Buscar..."}
    className={className}
  />
);

export default SearchBar;
