import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    tipo: 'ingreso',
    fecha: '',
    chofer: '',
    patente: '',
    campo_origen: '',
    km: '',
    cereal: '',
    kilos: '',
    humedad: '',
    silo: ''
  });

  useEffect(() => {
    axios.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error('Error fetching tickets:', err));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/tickets', form)
      .then(() => {
        alert('Ticket agregado!');
        setForm({
          tipo: 'ingreso',
          fecha: '',
          chofer: '',
          patente: '',
          campo_origen: '',
          km: '',
          cereal: '',
          kilos: '',
          humedad: '',
          silo: ''
        });
        axios.get('/tickets').then(res => setTickets(res.data));
      })
      .catch(err => console.error('Error:', err));
  };

  return (
    <div className="p-6 bg-green-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">ERP Agro - MVP Total</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-4">
        {Object.keys(form).map(k => (
          <input
            key={k}
            name={k}
            value={form[k]}
            onChange={handleChange}
            placeholder={k}
            className="border p-2 rounded"
          />
        ))}
        <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded">
          Agregar Ticket
        </button>
      </form>
      <h2 className="text-2xl font-bold mb-2">Tickets</h2>
      <table className="bg-white rounded shadow w-full">
        <thead>
          <tr className="bg-green-300">
            {Object.keys(form).map(k => (
              <th key={k} className="p-2">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              {Object.keys(form).map(k => (
                <td key={k} className="border p-2">{t[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;