import { DomainError } from '../domain/errors.js';

export function createRouter(){
    const routes = [];

    return {register(method, path, handler){
        if(typeof method !== 'string' || typeof path !== 'string'||  typeof handler !== 'function'){
            throw new DomainError('VALIDATION', 'Invalid route registeration');
        }

        routes.push({
            method: method.toUpperCase(),
            path,
            handler
        })},

        
    match(method, requestPath ){
        const segment = method.toUpperCase()

        for(const route of routes){
            if(route.method !== segment){continue};

            const params = matchPath(
                route.path,
                requestPath
            );

            if(params !== null){
                return {
                    handler: route.handler, params
                }
            }
        }
        return null
    }
   
}};


function matchPath(routePath, requestPath){
    const routePart = routePath.split('/');
    const requestPart = requestPath.split('/');

    if(routePart.length !== requestPart.length){
        return null
    }

    const params = {};

    for(let i = 0; i < routePart.length; i++ ){
        if(routePart[i].startsWith(':')){
            const paramName = routePart[i].slice(1);
            params[paramName] = requestPart[i];
        }else if(routePart[i] !== requestPart[i]){
            return null
        }
    }

    return params;
}