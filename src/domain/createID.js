import { randomBytes, randomUUID } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createNewId(){
    return randomUUID();
}

export function referenceCode(length = 9){
    const numbers =  randomBytes(length);
    let refCode = '';
    for(const number of numbers){
        refCode += ALPHABET[number % ALPHABET.length]
    }

    return refCode;
}

console.log('ID: ',createNewId());
console.log('Reference Code : ',referenceCode());
console.log('9 character code : ', referenceCode(9));
