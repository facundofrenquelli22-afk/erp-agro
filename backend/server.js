const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        tipo TEXT, fecha TEXT, chofer TEXT, patente TEXT,
        campo_origen TEXT, km REAL, cereal TEXT, kilos REAL,
        humedad REAL, silo TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_cereal (
        id SERIAL PRIMARY KEY,
        silo TEXT, cereal TEXT, toneladas REAL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        corredor TEXT, cereal TEXT,
        toneladas_totales REAL, toneladas_aplicadas REAL,
        precio REAL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS cartas_porte (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER, contrato_id INTEGER,
        cuit_origen TEXT, cuit_destino TEXT, cereal TEXT,
        kilos REAL, chofer TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS liquidaciones (
        id SERIAL PRIMARY KEY,
        contrato_id INTEGER, toneladas REAL,
        precio REAL, comision REAL, sellado REAL, gastos REAL,
        neto REAL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        liquidacion_id INTEGER, fecha TEXT,
        monto REAL, medio_pago TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS cuentas_corrientes (
        id SERIAL PRIMARY KEY,
        tipo TEXT, nombre TEXT, cuit TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS movimientos_cuenta (
        id SERIAL PRIMARY KEY,
        cuenta_id INTEGER, fecha TEXT,
        tipo TEXT, monto REAL, concepto TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedlot (
        id SERIAL PRIMARY KEY,
        corral TEXT, animal TEXT, kilos REAL, fecha_ingreso TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS consumo_alimento (
        id SERIAL PRIMARY KEY,
        feedlot_id INTEGER, cereal TEXT, kilos REAL, fecha TEXT
      )
    `);
    console.log('Tablas creadas');
  } finally {
    client.release();
  }
};

initDB();

app.get('/tickets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tickets', async (req, res) => {
  const t = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tickets(tipo, fecha, chofer, patente, campo_origen, km, cereal, kilos, humedad, silo)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [t.tipo, t.fecha, t.chofer, t.patente, t.campo_origen, t.km, t.cereal, t.kilos, t.humedad, t.silo]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Backend corriendo en puerto', PORT));