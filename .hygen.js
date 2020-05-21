const YAML = require('yaml')
const fs = require('fs')

const genStateDoc = (path) => {
    const swagger = YAML.parse(fs.readFileSync(path, 'utf8'))

    const processed = []
    const components = []

    Object.values(swagger.paths).filter(
        path => path.hasOwnProperty("post")).forEach(value => {
            const schema = value.post.requestBody.content[`application/json`].schema
            if(schema.hasOwnProperty('$ref')) {
                const parts = schema.$ref.split("/")
                const name = parts[parts.length - 1]
                if(components.findIndex(component => component.name === name) === -1) {
                    components.push({name, value: swagger.components.schemas[name]})
                }
            }
        })

    components.push({name: 'State', value: swagger.components.schemas.State})

    let typings = ""

    while (components.length !== 0) {

        const {name, value} = components.pop()
        switch (value.type) {
            case 'object':
                const str = Object.entries(value.properties).map(entry => {
                    const [name, value] = entry
                    const getType = () => {
                        if(value.hasOwnProperty("type")) {
                            switch (value.type) {
                                case "integer":
                                    return "Number"
                                case "string":
                                    return "String"
                            }
                            return value.type
                        } else if (value.hasOwnProperty("$ref")) {
                            const parts = value.$ref.split("/")
                            const name = parts[parts.length - 1]
                            if(processed.findIndex(name) === -1)
                                if(swagger.components.schemas[name].type !== 'object') {
                                    switch (swagger.components.schemas[name].type) {
                                        case "integer":
                                            return "Number"
                                        case "string":
                                            return "String"
                                    }
                                }
                                components.push({name, value: swagger.components.schemas[name]})
                            return name
                        }
                    }
                    return ` * @property {${getType()}} ${name}`
                }).join("\n")

                typings = `
                
/**            
 * @typedef {Object} ${name === "State"? `${swagger.info.title}State`: name}
${str}
 */` + typings
                processed.push(name)
        }
    }
    return typings
}

const getInitialValue = (path) => {
    const swagger = YAML.parse(fs.readFileSync(path, 'ascii'))
    return JSON.stringify(
        swagger.components.schemas.State.example)
}

const getName = (path) => {
    const swagger = YAML.parse(fs.readFileSync(path, 'ascii'))
    return swagger.info.title
}

const getActions = (path) => {
    const swagger = YAML.parse(fs.readFileSync(path, 'ascii'))
    const actions = Object.entries(swagger.paths).filter(
        entry => entry[1].hasOwnProperty("post"))

    let actionsBodies = `
/**            
 * @typedef {Object} ${swagger.info.title}Actions`

    actions.forEach(entry => {
        const [name, value] = entry
        const actionName = name.split("/")[1]

        const schema = value.post.requestBody.content["application/json"].schema
        const getType = () => {
            if(schema.hasOwnProperty("type")) {
                switch (schema.type) {
                    case "integer":
                        return "Number"
                    case "string":
                        return "String"
                }
                return schema.type
            } else if (schema.hasOwnProperty("$ref")) {
                const parts = schema.$ref.split("/")
                const name = parts[parts.length - 1]
                if(swagger.components.schemas[name].type !== 'object') {
                    switch (swagger.components.schemas[name].type) {
                        case "integer":
                            return "Number"
                        case "string":
                            return "String"
                    }
                }
                return name
            }
        }

        actionsBodies += `
 * @property {function(${getType()})} ${actionName}`
    })

    return actionsBodies + `
 */`
}

const getReducers = (path) => {
    const swagger = YAML.parse(fs.readFileSync(path, 'ascii'))
    const actions = Object.entries(swagger.paths).filter(
        entry => entry[1].hasOwnProperty("post"))

    let actionsBodies = ""

    actions.forEach(entry => {
        const [name, value] = entry
        const actionName = name.split("/")[1]

        const schema = value.post.requestBody.content["application/json"].schema
        const getType = () => {
            if(schema.hasOwnProperty("type")) {
                switch (schema.type) {
                    case "integer":
                        return "Number"
                    case "string":
                        return "String"
                }
                return schema.type
            } else if (schema.hasOwnProperty("$ref")) {
                const parts = schema.$ref.split("/")
                const name = parts[parts.length - 1]
                if(swagger.components.schemas[name].type !== 'object') {
                    switch (swagger.components.schemas[name].type) {
                        case "integer":
                            return "Number"
                        case "string":
                            return "String"
                    }
                }
                return name
            }
        }

        actionsBodies = `
                /**
                * @param {${swagger.info.title}State} state
                * @param {PayloadAction<${getType()}>} action
                */
                ${actionName}: (state, action) => {
                
                },
        ` + actionsBodies
    })

    return actionsBodies
}

module.exports = {
    templates: `${__dirname}/_templates`,
    helpers: {
        relative: (from, to) => path.relative(from, to),
        src: ()=> __dirname,
        load: (path) => YAML.parse(fs.readFileSync(path, 'utf8')),
        genStateDoc, getInitialValue, getActions, getReducers, getName
    }
}