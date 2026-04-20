const token = "Ap3wO8b4mJzkap05MbNMzgtaBxqTUyYHuYbmQDxH7f9f5913";
const LOCAL_SERVER = "http://127.0.0.1:8000";
const LAN_SERVER   = "http://192.168.1.44:8000";
const baseURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? LOCAL_SERVER
    : LAN_SERVER;

export const registrarProfessor = (professor) => {
    return fetch(`${baseURL}/api/professors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(professor)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
    .catch(err => {
        console.error("Error al registrar el professor:", err);
        return null;
    });
}

export const loggin = (professor) => {
    return fetch(`${baseURL}/api/professorsLoggin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(professor)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
}

export const demanarCodiVerificacio = (email) => {
    return fetch(`${baseURL}/api/send-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(email)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
    .catch(err => {
        console.error("Error al registrar el professor:", err);
        return null;
    });
}

export const verificarCodi = (email) => {
    return fetch(`${baseURL}/api/verify-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(email)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json();
    })
}

export const informes = () => {
    return fetch(`${baseURL}/api/informes`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json();
    })
}

export const Alumnes = () => {
    return fetch(`${baseURL}/api/alumnes`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json();
    })
}

export const Temes = () => {
    return fetch(`${baseURL}/api/temes`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json();
    })
}

export const crearTema = (tema) => {
    return fetch(`${baseURL}/api/temes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tema)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
}

export const crearTasca = (tasca) => {
    return fetch(`${baseURL}/api/tasques`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tasca)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
}

export const assignarTasca = (tasca) => {
    return fetch(`${baseURL}/api/assignarTascaAlumne`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tasca)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
}

export const obtenirAssignacions = (tasca) => {
    return fetch(`${baseURL}/api/obtenirAssignacionsTasca/${tasca}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json();
    })
}

export const eliminarAssignacio = (tasca) => {
    return fetch(`${baseURL}/api/eliminarAssignacio`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tasca)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        if (response.status === 204) return null;
        return response.json()
    })
}

export const assignarOperacio = (operacio) => {
    return fetch(`${baseURL}/api/assignarOperacions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(operacio)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
}

export const qualificarTasca = (alumneTasca, qualificacio) => {
    return fetch(`${baseURL}/api/respostesOperacions/${alumneTasca}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(qualificacio)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error desconocido'); });
        }
        return response.json()
    })
}