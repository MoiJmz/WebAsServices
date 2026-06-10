// app.js
const lista = document.getElementById('listaTareas');
const input = document.getElementById('nuevaTarea');

// Función auxiliar para pintar en el HTML
function renderizarTareas(tareas) {
    lista.innerHTML = '';
    tareas.forEach(t => {
        // Estilo tachado si está completada
        const textStyle = t.completada ? 'text-decoration: line-through; color: gray;' : '';
        
        lista.innerHTML += `
            <li>
                <span style="${textStyle}">${t.id} - ${t.titulo}</span>
                <div style="margin-top: 5px;">
                    <button onclick="completarTareaREST(${t.id}, ${t.completada ? 0 : 1})"> completada</button>
                    <button onclick="editarTareaREST(${t.id}, prompt('Nuevo título:', '${t.titulo}'))"> Editar</button>
                    <button onclick="borrarTareaREST(${t.id})"> Borrar</button>
                </div>
            </li>
        `;
    });
}

// ==========================================
// INTERACCIONES RESTful
// ==========================================

function cargarTareasREST() {
    fetch('api.php')
        .then(res => res.json())
        .then(data => renderizarTareas(data));
}

function crearTareaREST() {
    const titulo = input.value;
    if (!titulo) return;
    fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: titulo })
    }).then(() => {
        input.value = '';
        cargarTareasREST();
    });
}

function borrarTareaREST(id) {
    fetch('api.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    }).then(() => cargarTareasREST());
}

function editarTareaREST(id, nuevoTitulo) {
    if (!nuevoTitulo) return; // Si cancela el prompt
    fetch('api.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, titulo: nuevoTitulo })
    }).then(() => cargarTareasREST());
}

function completarTareaREST(id, estado) {
    fetch('api.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, completada: estado })
    }).then(() => cargarTareasREST());
}

// ==========================================
// INTERACCIONES GRAPHQL
// ==========================================

function cargarTareasGraphQL() {
    const query = `
        query {
            tareas {
                id
                titulo
                completada
            }
        }
    `;
    fetch('graphql.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
    })
    .then(res => res.json())
    .then(response => {
        renderizarTareas(response.data.tareas);
    });
}

function crearTareaGraphQL() {
    const titulo = input.value;
    if (!titulo) return;
    const mutation = `
        mutation($tituloStr: String!) {
            crearTarea(titulo: $tituloStr)
        }
    `;
    fetch('graphql.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            query: mutation,
            variables: { tituloStr: titulo }
        })
    }).then(() => {
        input.value = '';
        cargarTareasGraphQL();
    });
}