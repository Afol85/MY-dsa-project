import { mergeSort } from "./sort.js";
import { DomainError } from "./errors.js";
import  dayjs  from "dayjs";
import  customParseFormat  from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat)

function summariseEvent(event, tiers){
    return{
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        venue: event.venue,
        city: event.city,
        status: event.status,
        tierCount: tiers.length,
        minimumPriceKobo: tiers.length ? Math.min(...tiers.map((t) => t.priceKobo)) : null,
        seatsLeft: tiers.reduce((total, t) => total + (t.capacity - t.sold), 0)
    }
}
function parseDate(value, field, {endOfDay = false} = {}){
    if (typeof value !== "string" || !value.trim()){
        throw new DomainError('VALIDATION', `${field} must be a valid date or time`);
    }
    const formats = [
        'YYYY-MM-DD',
        'YYYY-MM-DDTHH:mm',
        'YYYY-MM-DDTHH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss,SS'
    ];

    let parsedDate = null;
    let isDateOnly = false;

    for(const format of formats ){
        const user = dayjs(value, format, true);
    

    if (user.isValid()){
        parsedDate = user;
        isDateOnly = formats === "YYYY-MM-DD";

        break;
    }

}
    if (!parsedDate){
        throw new DomainError('VALIDATION', `${field} must be a valid date or time`);
    }

    if (endOfDay && isDateOnly){
        parsedDate = parsedDate.endOf('day');
    }
    return parsedDate.valueOf();
}
export function filterEvents(summaries, {q = '', city = '', from, to, maxPriceKobo, onlyAvailable = false} = {}){
    const text = q.trim().toLowerCase();
    const theCity = city.trim().toLowerCase();
    const fromWhatTime = from ? parseDate(from, 'from') : undefined;
    const toWhatTime = to ? parseDate(to, 'to', {endOfDay: true}) : undefined;

    if (maxPriceKobo !== undefined && (!Number.isInteger(maxPriceKobo) || maxPriceKobo < 0)) {
    throw new DomainError('VALIDATION', 'maxPriceKobo must be a whole number of kobo');
  }

  return summaries.filter((event) => {
    if (text && !`${event.title} ${event.venue}`.toLowerCase().includes(text)) {return false;}
    if (theCity && event.city.toLowerCase() !== theCity) return false;

    const eventTime =  parseDate(event.date, 'event.date'); 

    if (fromWhatTime !== undefined && eventTime > toWhatTime){return false;}
    
    if (maxPriceKobo !== undefined && (event.minimumPriceKobo === null || event.minimumPriceKobo > maxPriceKobo)) {
      return false;
    }
    if (onlyAvailable && event.seatsLeft <= 0) return false;
    return true;
    
  })

}

const compareText = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

const byTitleThenId = (x, y) =>
  compareText(x.title.toLowerCase(), y.title.toLowerCase()) || compareText(x.id, y.id);

const sorter = {
    date: (x, y) => compareText(x, y) || byTitleThenId(x, y),

    price: (x, y) => {
    const priceA = x.minimumPriceKobo ?? Infinity;
    const priceB = y.minimumPriceKobo ?? Infinity;
    return (priceA === priceB ? 0 : priceA < priceB ? -1 : 1) || byTitleThenId(x, y);
  },

  availability: (x, y) => y.seatsLeft - x.seatsLeft || byTitleThenId(x, y),
}

export const sortOption = Object.keys(sorter);

export function sortEvents(summaries, sortBy = 'date') {
  if (!Object.hasOwn(sorter, sortBy)) {
    throw new DomainError('VALIDATION', `sort must be one of: ${sortOption.join(', ')}`);
  }
  return mergeSort(summaries, sorter[sortBy]);
}

export function searchEvents(summaries, criteria = {}, sortBy = 'date') {
  return sortEvents(filterEvents(summaries, criteria), sortBy);
}