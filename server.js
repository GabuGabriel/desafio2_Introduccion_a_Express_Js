const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

const repertorioPath = path.join(__dirname, 'repertorio.json');

if (!fs.existsSync(repertorioPath)) {
  fs.writeFileSync(repertorioPath, JSON.stringify([]));
}

const leerRepertorio = () => {
  const data = fs.readFileSync(repertorioPath, 'utf-8');
  return JSON.parse(data);
};

const escribirRepertorio = (data) => {
  fs.writeFileSync(repertorioPath, JSON.stringify(data, null, 2));
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/canciones', (req, res) => {
  try {
    const canciones = leerRepertorio();
    res.json(canciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el repertorio' });
  }
});

app.post('/canciones', (req, res) => {
  try {
    const canciones = leerRepertorio();
    const nuevaCancion = req.body;
    canciones.push(nuevaCancion);
    escribirRepertorio(canciones);
    res.status(201).json(nuevaCancion);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar la canción' });
  }
});

app.put('/canciones/:id', (req, res) => {
  try {
    const id = req.params.id;
    const canciones = leerRepertorio();
    const index = canciones.findIndex(c => c.id.toString() === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    canciones[index] = { ...req.body };
    escribirRepertorio(canciones);
    res.json(canciones[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la canción' });
  }
});

app.delete('/canciones/:id', (req, res) => {
  try {
    const id = req.params.id;
    const canciones = leerRepertorio();
    const cancionesFiltradas = canciones.filter(c => c.id.toString() !== id);

    if (canciones.length === cancionesFiltradas.length) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    escribirRepertorio(cancionesFiltradas);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la canción' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});