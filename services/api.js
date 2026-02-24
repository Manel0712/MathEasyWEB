import fetch from 'node-fetch';

const token = "Ap3wO8b4mJzkap05MbNMzgtaBxqTUyYHuYbmQDxH7f9f5913";

export const crearInforme = (report) => {
    fetch('http://matheasyapi.test/api/informes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(report)
    })
    .then(res => res.json())
    .then(data => {
        console.log(`Informe guardado para alumno ${report.alumne_id}:`, data);
    })
    .catch(err => {
        console.error(`Error guardando informe para alumno ${report.alumne_id}:`, err);
        return null;
    });
}