const es = true

const global_es = {

    text: {

        title: {
            login: 'Iniciar Sesión',
            register: 'Registro de Usuario',
            restoreKey: 'Restaurar Clave'
        },
        button: {
            enter: 'Entrar',
            restore: 'Restaurar',
            save: 'Guardar'
        },
        input: {
            username: 'Usuario',
            password: 'Contraseña',
            name: 'Nombre',
            nit: 'Numero de Identificación',
            email: 'Correo Electronico'
        }

    },

    success: {
        'S001': 'El Usuario ha sido creado con exito'
    },

    warn: {

    },

    error: {
        'E001': 'El Numero de Identificación que introdujo, ya está registrado',
        'E002': 'El Correo Electronico que introdujo, ya está registrado',
        'E003': 'El Usuario que introdujo, ya está registrado',
        'E004': 'El Usuario que introdujo no existe, verique por favor',
        'E005': '¡Usuario bloqueado!',
        'E006': '¡Contraseña incorrecta!'
    }

}

const global_en = {

    text: {

        title: {
            login: 'Login',
            register: 'User Register',
            restoreKey: 'Restore Key'
        },
        button: {
            enter: 'Enter',
            restore: 'Restore',
            save: 'Save'
        },
        input: {
            username: 'Username',
            password: 'Password',
            name: 'Name',
            nit: 'NIT',
            email: 'Email'
        }

    }
}

export default es ? global_es : global_en;