export const searchCity = (city, setSearchData) => {
    return fetch(`http://localhost:3000/api/weather/${city}`)
    .then(res => res.json())
    .then(data => setSearchData(data))
    .catch(err => console.log(err))
}