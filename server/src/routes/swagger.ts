
/**
 * This file is used as a base for the swagger complition in the index.js file of routes.
 */

export const definition = {
    openapi: '3.0.1',
    info: {
        version: '1.0.0',
        title: 'APIs Document',
        description: 'Documentation of Aalto Grades Backend API',
        termsOfService: '',
        license: {
            name: 'MIT',
            url: 'https://github.com/aalto-grades/base-repository/blob/main/LICENSE'
        }
    },
    tags:[
        {
            name: 'SISU'
        },
        {
            name: "Course"
        },
        {
            name: 'Session'
        }
    ]
}


