import { searchEvents, filterEvents, sortEvents } from "../src/domain/eventSearches.js";

const events = [{
    id: '001',
    title: 'Tech Conference',
    description: 'a technology event',
    date: '2026-11-12',
    venue: 'Hamphi theatre',
    city: 'Ibadan',
    status: 'pending,',
    tierCount: 2,
    minimumPriceKobo: 500_000,
    seatsLeft: 50,
},{
    id: '002',
    title: 'Drama Night',
    description: 'Drama Club Night',
    date: '2026-11-14',
    venue: 'Drama Studio',
    city: 'Ogbomosho',
    status: 'pending,',
    tierCount: 1,
    minimumPriceKobo: 300_000,
    seatsLeft: 0,
},{
    id: '003',
    title: 'Business Summit',
    description: 'Business Lectures and Networking',
    date: '2026-11-20',
    venue: 'The Assembly',
    city: 'Ikeja',
    status: 'pending,',
    tierCount: 3,
    minimumPriceKobo: 1000_000,
    seatsLeft: 45,
}]

console.log('test1 : city');
console.log(filterEvents(events,{city: 'ogbomosho'}));

console.log('test2 : title');
console.log(filterEvents(events,{q: 'tech'}));

console.log('test3 : date');
console.log(filterEvents(events,{from: '2026-11-12', to: '2026-11-15'}));

console.log('test4 : max price');
console.log(filterEvents(events,{maxPriceKobo: 500_000}));

console.log('test5 : events available');
console.log(filterEvents(events,{onlyAvailable: true}));