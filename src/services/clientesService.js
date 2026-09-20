import axios from "axios";

const URL = "https://fakestoreapi.com/users";

const obtenerClientes = async () => {
    const respuesta = await axios.get(URL);
    return respuesta.data;
};

const obtenerCliente = async (id) => {
    const respuesta = await axios.get(`${URL}/${id}`);
    return respuesta.data;
};

const crearCliente = async (cliente) => {
    const respuesta = await axios.post(URL, cliente);
    return respuesta.data;
};

const eliminarCliente = async (id) => {
    const respuesta = await axios.delete(`${URL}/${id}`);
    return respuesta.data;
};

export default {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    eliminarCliente
};