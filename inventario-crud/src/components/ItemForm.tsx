import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { IItem } from "../types";

interface Props {
  fetchItems: () => void;
}

const ItemForm: React.FC<Props> = ({ fetchItems }) => {
  const [item, setItem] = useState<IItem>({
    descripcion: "",
    marca: "",
    modelo: "",
    proveedor: "",
    unidad: "",
    cantidad: 0,
    precioUnitario: 0,
    categoria: [""],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: name === "cantidad" || name === "precioUnitario" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.post("http://192.168.100.25:6051/api/items", item);
    fetchItems();
    setItem({
      descripcion: "",
      marca: "",
      modelo: "",
      proveedor: "",
      unidad: "",
      cantidad: 0,
      precioUnitario: 0,
      categoria: [""],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
      <input name="descripcion" value={item.descripcion} onChange={handleChange} placeholder="Descripción" className="form-control mb-2" />
      <input name="marca" value={item.marca} onChange={handleChange} placeholder="Marca" className="form-control mb-2" />
      <input name="modelo" value={item.modelo} onChange={handleChange} placeholder="Modelo" className="form-control mb-2" />
      <input name="proveedor" value={item.proveedor} onChange={handleChange} placeholder="Proveedor" className="form-control mb-2" />
      <input name="unidad" value={item.unidad} onChange={handleChange} placeholder="Unidad" className="form-control mb-2" />
      <input name="cantidad" type="number" value={item.cantidad} onChange={handleChange} placeholder="Cantidad" className="form-control mb-2" />
      <input name="precioUnitario" type="number" value={item.precioUnitario} onChange={handleChange} placeholder="Precio Unitario" className="form-control mb-2" />
      <input name="categoria" value={item.categoria} onChange={handleChange} placeholder="Categoría" className="form-control mb-2" />
      <button type="submit" className="btn btn-primary w-100">Agregar</button>
    </form>
  );
};

export default ItemForm;
