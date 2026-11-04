const defaultCompare = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

export function mergeSort(items, compare = defaultCompare){
  if (items.length <= 1) return [...items];

    const middle = Math.floor(items.length / 2);
    const left = mergeSort(items.slice(0, middle), compare);
    const right = mergeSort(items.slice(middle), compare);
    return merge (left, right, compare);
}

function merge(left, right, compare){
    const merged = [];

    let a = 0;
    let b = 0;

    while(a < left.length && b < right.length ){  
        if (compare(left[a], right[b]) <= 0) {
            merged.push(left[a]);
            a += 1;
        } else {
            merged.push(right[b]);
            b += 1;
    }
    }

    while(a < left.length) merged.push(left[a++]);
    while(b < right.length) merged.push(right[b++]);
    return merged;
}