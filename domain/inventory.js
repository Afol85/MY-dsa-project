import { createNewId, referenceCode } from "./createID.js";
import { DomainError } from "./errors.js";
import { Queue } from './waitlistQueue.js';

const Maximum_Tickets_Per_Booking = 8;
const HOLDS_SEATS = new Set(['pending', 'paid']);

export function createStore(){
    return{
        events:new Map(),
        tiers:new Map(),
        booking: new Map(),
        bookingByReference: new Map(),
        waitlist: new Map()
    }
}

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new DomainError('VALIDATION', `${field} is required`);
  }
  return value.trim();
}

function requireWholeNumber(value, field, min) {
  if (!Number.isInteger(value) || value < min) {
    throw new DomainError('VALIDATION', `${field} must be a whole number of at least ${min}`);
  }
  return value;
}

export function createEvent(store, {title, description, date, venue }){

     if(!store || !(store.events instanceof Map)){
        throw new DomainError('VALIDATION', 'A Valid Store Required');
     }

     if (typeof title!== 'string' || !title.trim()
         ||typeof description !== 'string' || !description.trim() ||
         typeof venue !== 'string' || !venue.trim()||
         typeof date !== 'string' || !date.trim()){
        throw new DomainError('VALIDATION', 'Title, Description and venue are required')
     }

    const event ={
    Id: createNewId(),
    tierIds : [],
    title: title.trim(),
    description: description.trim(),
    date: date.trim(),
    venue: venue.trim()
};

store.events.set(event.Id, event);
return event;
}

function getTier(store, tierId) {
  const tier = store.tiers.get(tierId);
  if (!tier) throw new DomainError('NOT_FOUND', 'Ticket tier not found');
  return tier;
}



export function addTiers(store, eventId, {tierRank, priceKobo, capacity}) {
    const event = store.events.get(eventId);
    if (!event) throw new DomainError('NOT_FOUND', 'Event not found');

    const tier = {
        Id: createNewId(),
        tierRank : requireText(tierRank, 'rank' ),
        priceKobo: requireWholeNumber(priceKobo, 'price'),
        capacity: requireWholeNumber(capacity, 'capacity', 1),
        sold: 0
    }
    store.tiers.set(tier.Id, tier);
    store.waitlist.set(tier.Id, new Queue());
    event.tierIds.push(tier.Id);
    return tier;

}

export function seatsLeft(tier) {
  return tier.capacity - tier.sold;
}

export function booking(store, tierId, userId, quantity){
    const tier = getTier(store, tierId);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > Maximum_Tickets_Per_Booking) {
    throw new DomainError('VALIDATION', `quantity must be between 1 and ${Maximum_Tickets_Per_Booking}`);
  }

    const seats = seatsLeft(tier);
    if(seats < quantity){
        const message = seats === 0 ? `${tier.name} is sold out` : `Only ${seatsLeft} ticket(s) left in ${tier.name}`;
        throw new DomainError(`SOLD OUT`, message, {seatsLeft: seats})
  }

  tier.sold += quantity; 

  let reference;
  do{reference = referenceCode();}while(store.bookingByReference.has(reference));

  const booking = {
    id: createNewId(),
    reference,
    userId,
    tierId,
    quantity,
    amountKobo: tier.priceKobo * quantity,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  store.booking.set(booking.id, booking);
  store.bookingByReference.set(reference, booking);
  return booking;

}
export function bookingByReference(store, reference){
    return store.bookingByReference.get(reference)
};

export function cancelBooking(store, reference) {
  const booking = bookingByReference(store, reference);
  if (!booking) throw new DomainError('NOT_FOUND', 'Booking not found');
  if (!HOLDS_SEATS.has(booking.status)) {
    throw new DomainError('INVALID_STATE', `A ${booking.status} booking cannot be cancelled`);
  }
  getTier(store, booking.tierId).sold -= booking.quantity;
  booking.status = 'cancelled';
  return booking;
}

export function joinWaitlist(store, tierId, userId, quantity) {
  const tier = getTier(store, tierId);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > Maximum_Tickets_Per_Booking) {
    throw new DomainError('VALIDATION', `quantity must be between 1 and ${Maximum_Tickets_Per_Booking}`);
  }
  if (seatsLeft(tier) >= quantity) {
    throw new DomainError('NOT_SOLD_OUT', 'Seats are available, so book them instead');
  }
  const queue = store.waitlist.get(tierId);
  queue.enqueue({ userId, quantity });
  return { position: queue.size };
}

export function offerNextOnWaitlist(store, tierId) {
  const tier = getTier(store, tierId);
  const queue = store.waitlist.get(tierId);
  const head = queue.peek();
  if (!head || seatsLeft(tier) < head.quantity) return undefined;
  return queue.dequeue();
}
