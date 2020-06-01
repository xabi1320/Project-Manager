eventListeners();

function eventListeners() {
    document.querySelector('#formulario').addEventListener('submit', validarRegistro);
}

function validarRegistro(e) {
    e.preventDefault();

    var usuario = document.querySelector('#usuario').value,
        password = document.querySelector('#password').value,
        tipo = document.querySelector('#tipo').value;

    if (usuario === '' || password === '') {
        // la validacion fallo
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: '¡Ambos campos son obligatorios!'
        });
    } else {
        //Ambos campos son correctos, mandar ejecutar ajax

        //datos que se envian al servidor
        var datos = new FormData();
        datos.append('usuario', usuario);
        datos.append('password', password);
        datos.append('accion', tipo);

        // crear el llamado a ajax

        var xhr = new XMLHttpRequest();

        //Abrir la Conexion
        xhr.open('POST', 'inc/modelos/modelo-admin.php', true);

        //Retorno de datos
        xhr.onload = function() {
            if (this.status === 200) {
                var respuesta = JSON.parse(xhr.responseText);

                console.log(respuesta);
                //si la respuesta es correcta
                if (respuesta.respuesta === 'correcto') {
                    //si es un nuevo usuario
                    if (respuesta.tipo === 'crear') {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Usuario Creado!',
                            text: '¡El usuario  se creó correctamente!'
                        });
                    } else if (respuesta.tipo === 'login') {
                        Swal.fire({
                                icon: 'success',
                                title: 'Login Correcto',
                                text: 'Presiona "OK" para abrir el dashboard'
                            })
                            .then(resultado => {
                                if (resultado.value) {
                                    window.location.href = 'index.php'
                                }
                            });
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
        }

        //Enviar peticion
        xhr.send(datos);

    }
}