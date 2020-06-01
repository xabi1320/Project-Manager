eventListeners();
//Lista de proyectos
var listaProyectos = document.querySelector('ul#proyectos');

function eventListeners() {

    //Document Ready
    document.addEventListener('DOMContentLoaded', function() {
        actualizarProgreso();
    });

    //boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    //Boton para una nueva tarea
    document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);

    //Botones para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
}

function nuevoProyecto(e) {
    e.preventDefault();
    console.log('Presionaste en nuevo proyecto');

    var listaProyectos = document.querySelector('ul#proyectos');
    //crear un <input> para el nombre del proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    //Seleccionar el ID con el nuevoProyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    //Al Presionar enter crear el proyecto
    inputNuevoProyecto.addEventListener('keypress', function(e) {
        var tecla = e.which || e.keycode;

        if (tecla === 13) {
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
}

function guardarProyectoDB(nombreProyecto) {
    //Crear llamado a ajax
    var xhr = new XMLHttpRequest();

    //Enviar datos FormData
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');

    //Abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true);

    //En la carga
    xhr.onload = function() {
        if (this.status === 200) {
            //obtener datos de la respuesta
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;

            //comprobar insercion
            if (resultado === 'correcto') {
                //fue exitoso
                if (tipo === 'crear') {
                    //se reco un nuevo proyecto
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                            ${proyecto}
                        </a>
                    `;

                    //Agregar al html
                    listaProyectos.appendChild(nuevoProyecto);

                    //enviar alerta
                    Swal.fire({
                            icon: 'success',
                            title: 'Proyecto Creado',
                            text: 'El proyecto: ' + proyecto + ' se creo correctamente'
                        })
                        .then(resultado => {
                            //Redireccionar a la nueva URL
                            if (resultado.value) {
                                window.location.href = 'index.php?id_proyecto=' + id_proyecto;
                            }
                        });

                } else {
                    //Se actualizo o se elimino
                }
            } else {
                //hubo un error
                Swal.fire({
                    icon: 'error',
                    title: '¡Hubo Error!',
                    text: '¡Error!'
                });
            }

        }
    }

    //Enviar el Request
    xhr.send(datos);
}

//Agregar una nueva tarea al proyecto actual
function agregarTarea(e) {
    e.preventDefault();

    var nombreTarea = document.querySelector('.nombre-tarea').value;
    //Validar que el campo tenga algo escrito

    if (nombreTarea === '') {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Una tarea no puede ir vacia'
        });
    } else {
        //la tarea tiene algo, insertar en php

        //Crear llamado a AJAX
        var xhr = new XMLHttpRequest();

        //Crear FormData
        var datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);

        //  Abrir conexion
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

        //Ejecutarlo y respuesta
        xhr.onload = function() {
            if (this.status === 200) {
                //todo correcto
                var respuesta = JSON.parse(xhr.responseText);
                //Asignar valores
                var resultado = respuesta.respuesta,
                    tarea = respuesta.tarea,
                    id_insertado = respuesta.id_insertado,
                    tipo = respuesta.tipo;

                if (resultado === 'correcto') {
                    //Se agrego correctamente
                    if (tipo === 'crear') {
                        //Lanzar la alerta
                        Swal.fire({
                            icon: 'success',
                            title: 'Tarea Creada',
                            text: 'La tarea: ' + tarea + ' se creó correctamente'
                        });

                        //Seleccionar le parrafo  con la lista vacia
                        var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                        if (parrafoListaVacia.length > 0) {
                            document.querySelector('.lista-vacia').remove();
                        }

                        //Construir el template
                        var nuevaTarea = document.createElement('li');

                        //Agregamos el ID
                        nuevaTarea.id = 'tarea:' + id_insertado;

                        //Agregar la clase tarea
                        nuevaTarea.classList.add('tarea');

                        //Construir HTML
                        nuevaTarea.innerHTML = `
                            <p>${tarea}</p>
                            <div class="acciones">
                                <i class="far fa-check-circle"></i>
                                <i class="fas fa-trash"></i>
                            </div>
                        `;

                        //Agregarlo al HTML
                        var listado = document.querySelector('.listado-pendientes ul');
                        listado.appendChild(nuevaTarea);

                        //Limpiar el formulario
                        document.querySelector('.agregar-tarea').reset();

                        //Actualziar Progreso
                        actualizarProgreso();
                    }
                }
            } else {
                //Hubo un error
                Swal.fire({
                    icon: 'error',
                    title: '¡Hubo Error!',
                    text: '¡Error!'
                });
            }
        }

        //Enviar consulta
        xhr.send(datos);
    }
}

//Cambia el estado de las tareas  o las elimina

function accionesTareas(e) {
    e.preventDefault();

    if (e.target.classList.contains('fa-check-circle')) {
        if (e.target.classList.contains('completo')) {
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    }

    if (e.target.classList.contains('fa-trash')) {
        Swal.fire({
            title: '¿Seguro(a)?',
            text: "Esta acción no se peude deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {

                var tareaEliminar = e.target.parentElement.parentElement;
                //Borrar de la BD
                eliminarTareaBD(tareaEliminar);

                //Borrar del HTML
                tareaEliminar.remove();
                Swal.fire(
                    '¡Eliminado!',
                    'La tarea fue eliminada.',
                    'success'
                )
            }
        })
    }
}

//completa o descompleta la tarea
function cambiarEstadoTarea(tarea, estado) {
    var idTarea = tarea.parentElement.parentElement.id.split(':');

    //Crear llamado a ajax
    var xhr = new XMLHttpRequest();

    //informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);

    //Abrir conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    //on load
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            //Actualziar Progreso
            actualizarProgreso();
        }
    }

    //Enviar  la peticion
    xhr.send(datos);
}

//Elimina las tareas de la base de datos
function eliminarTareaBD(tarea) {
    var idTarea = tarea.id.split(':');

    //Crear llamado a ajax
    var xhr = new XMLHttpRequest();

    //informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');

    //Abrir conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    //on load
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));

            //comprobar que haya tareas restantes
            var listaTareasRestantes = document.querySelectorAll('li.tarea');
            if (listaTareasRestantes.length === 0) {
                document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No hay tareas en este proyecto</p>";
            }

            //Actualziar Progreso
            actualizarProgreso();
        }
    }

    //Enviar  la peticion
    xhr.send(datos);
}

//actualiza el avance del proyecto
function actualizarProgreso() {
    //Obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');

    //Obtener tareas completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');

    //Determinar el avance
    const avance = Math.round((tareasCompletadas.length / tareas.length) * 100);

    //Asignar avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.style.width = avance + '%';

    //Mostrar una alerta al terminar proyecto
    if (avance === 100) {
        Swal.fire({
            icon: 'success',
            title: 'Poryecto Terminado',
            text: 'Ya no tienes tareas pendientes'
        });
    }
}