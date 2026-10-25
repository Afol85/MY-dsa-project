import { 
    createStore, 
    createEvent,
    addTiers,
    seatsLeft,
    booking,
    bookingByReference,
    cancelBooking,
    joinWaitlist,
    offerNextOnWaitlist 
} from "../domain/inventory.js";
import { DomainError } from "../domain/errors.js";

const store = createStore();

const event = createEvent(store, {
    title: 'LAUTECH Technology Summit',
    description: 'A day of showcasing innovative technology',
    date: '30-10-2026',
    venue: 'Senate Building'
})

console.log('created event: ', event);

const tier = addTiers(store, event.Id, {tierRank: 'Regular', priceKobo: 200_000, capacity: 5});
console.log(`Created ${event.title} ${tier.capacity} seats in ${tier.tierRank}.\n`);

function attempt(label, action){
    try{
    const result = action();
    console.log(`OK    ${label}`);
    return result;
    }catch(error){
        if(!(error instanceof DomainError)) throw error;
        console.log(`FAIL ${label} -> ${error.code}: ${error.message}`);
        return undefined
    }
}

const fola = attempt('fola books 4 tickets', () => booking(store, tier.Id, 'fola', 4));
attempt('Bayo books 2 tickets (only 1 left)', () => booking(store, tier.Id, 'bayo', 2));
attempt('Bayo books 1 ticket', () => booking(store, tier.Id, 'bayo', 1));
console.log(`\nSeats left: ${seatsLeft(tier)}\n`);

attempt('Chidi joins the waitlist for 2 seats', () => joinWaitlist(store, tier.Id, 'chidi', 3));
attempt('Dayo joins the waitlist for 1 seat', () => joinWaitlist(store, tier.Id, 'dayo', 2));

console.log(`\nLooking fola's booking up by reference ${fola.reference}:`);
console.log(bookingByReference(store, fola.reference));

console.log();
attempt('fola cancels', () => cancelBooking(store, fola.reference));
console.log(`Seats left: ${seatsLeft(tier)}`);

const offer = offerNextOnWaitlist(store, tier.Id);
console.log('Next on the waitlist:', offer);
