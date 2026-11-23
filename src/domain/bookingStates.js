import { DomainError } from './errors.js';


export const booking_states = Object.freeze([
    'pending',
    'paid',
    'cancelled',
    'refunded',
    'checkedIn'
])

export const transistions = {
    pending: Object.freeze(['paid', 'cancelled']),
    paid: Object.freeze(['checkedIn','cancelled', 'refunded']),
    cancelled: Object.freeze([]),
    checkedIn: Object.freeze([]),
    refunded: Object.freeze([]),
}

export function canTransistion(from, to){
    return Object.hasOwn(transistions, from) && transistions[from].includes(to);
}

export function assertTransistion(from, to){
    if(!canTransistion(from, to)){
        throw new DomainError('INVALID_TRANSISTION_REQUEST', `Can not Transistion booking state from ${from} to${to}`);
    }
    return true
}