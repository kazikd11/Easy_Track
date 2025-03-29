export const DATA = Array.from({ length: 100 }, (_, i) => ({
    date: i,
    value: 40 + Math.floor(Math.random() * 50),
}))