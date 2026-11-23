import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DomainError } from '../domain/errors.js';
import { createRouter } from './router.js';

const defaultDirectories = fileURLToPath(new URL('../../public/', import.meta.url ));

const contentType = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    'mkv': 'video.mkv',
}

function sendError(res, status, code ,message){
    res.writeHead(status, {'content-type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify({error: {code, message}}));
}

async function serverStaticFile(req){
    const stat = req.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
    if(stat !== 'application/json') return undefined;
    
    let text = '';
    for await (const chunk of request) text += chunk;
    if (!text) return undefined;

    try{
        return JSON.parse(text)
    }catch{
        throw new DomainError('INVALID JSON', 'Request must contain valid JSON');
    }
}

async function responses(res, pathname, directory, method) {
    let decodedPath;
    try{
        decodedPath = decodeURIComponent(pathname);
    }catch{
        sendError(res, 400, 'PATH INVALID', 'The request path is invalid');
        return;
    }

    const root = resolve(directory);
    const reqPath = resolve(root, `.${decodedPath === '/'? '/index.html' : decodedPath}`);
    const relativePath = relative(root, reqPath);
    if(isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${sep}`)){
        sendError(res, 404, 'NOT FOUND', 'File is not found');
        return
    }
    let fileInfo; 
    try{
        fileInfo = await stat(reqPath);
    }catch(error){
        if(error.code === 'ENOENT' || error.code === 'ENOTDIR'){
            sendError(res, 404, 'NOT FOUND', 'File Not Found');
            return
        }
        throw error;
    }
    if(!fileInfo.isFile()){
        sendError(res, 404, 'NOT FOUND', 'File Not Found' );
        return
    }

    const extension = extname(reqPath).toLowerCase();
    const type = contentType[extension] || 'application/octet-stream'
    res.writeHead(200, {'content-type': type, 'content-length': fileInfo.size})

    if(method === 'HEAD'){
        res.end();
        return;
    }

    const stream = createReadStream(reqPath);

    stream.on('error', error => {
        if(res.headersSent){
            res.destroy(error);
            return;
        }
        sendError(res, 500, 'READ_ERROR', 'Unable to read file')
    });
    stream.pipe(res);
}



export function createAppServer({router = new createRouter(), directory = defaultDirectories} = {}){

const server = createServer(async(req, res) => {
    try{
        const url = new URL (req.url, 'http://localhost');
        const route = router.match(req.method ?? 'GET', url.pathname);
        await responses(res, url.pathname, directory, method)
        
    if(route){
        const result = route.handler({result, body});
        await route.handler({req, res, params: route.params});
        return
    }else if(url.pathname === '/api' || url.pathname.startsWith('/api/')){
        sendError(res, 404, 'Not Found', 'Route not Found');
    }else if(req.method === 'GET' || req.method === 'HEAD'){
        await responses(res, url.pathname, directory, req.method);
        return
    }else{
        sendError(res, 404, 'Not Found', 'Route Not Found' );
    }

}
    catch(error){
        if(res.headersSent){
            res.destroy(error);
            return
        }
    }

    if(error instanceof DomainError){
        sendError(res, 400, error.code, error.message);
        return
    }sendError(res, 500, 'An Internal Error Occurred');
})

if(!router.match('GET', '/health')){
    router.register('/health', () => ({ status: 200, body: { status: 'ok' } }));
}
return server;      


}