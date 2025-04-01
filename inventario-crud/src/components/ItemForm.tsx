import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { IItem } from "../types";

interface Props {
  fetchItems: () => void;
}

const ItemForm: React.FC<Props> = ({ fetchItems }) => {
  const [item, setItem] = useState<IItem>({ nombre: "", descripcion: "", cantidad: 0, precio: 0 });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/items", item);
    fetchItems();
    setItem({ nombre: "", descripcion: "", cantidad: 0, precio: 0 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" value={item.nombre} onChange={handleChange} placeholder="Nombre" />
      <input name="cantidad" type="number" value={item.cantidad} onChange={handleChange} placeholder="Cantidad" />
      <input name="precio" type="number" value={item.precio} onChange={handleChange} placeholder="Precio" />
      <button type="submit">Agregar</button>
    </form>
  );
};

export default ItemForm;
