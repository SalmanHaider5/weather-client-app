import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import Cookies from 'js-cookie'

const App = () => {

  const [weatherData, setWeatherData] = useState({})
  const [city, setCity] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searchResult, setSearchResult] = useState({weather: {}})
  
  const [user, setUser] = useState({})

  useEffect(() => {
    if(!navigator.geolocation){
      console.log('Browser not supported')
    }else{
      navigator.geolocation.getCurrentPosition((position) => {
        const data = {}
        data.lat = position.coords.latitude;
        data.long = position.coords.longitude;
        const socket = socketIOClient('http://localhost:3000/')
        data.key = Cookies.get('key')
        console.log('Data', data)
        socket.emit('user_info', data);
        socket.on('new_user', response => {
          const { data = {} } = response || {}
          Cookies.set('key', data.key)
        })
        socket.on('weather_update', response => {
          setWeatherData(response)
        })
      }, () => console.log('Unable to retrieve location'))
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`http://localhost:3000/weather/${city}`)
      .then(res => res.json())
      .then(data => {
        if(data.status === 404){
          setSearchError('Name not found')
        }else{
          setSearchResult(data)
        }
      })
      .catch(err => console.log(err))
    }, 3000);
    return () => clearTimeout(timeout)
  }, [city])

  return (
    <div>
      <h3>
        Weather Update:
      </h3>
      {weatherData === {} ? <>
        <b>City Name:</b> {weatherData.cityName} <br />
        <b>Temperature: </b> {weatherData.weather.temp} <br />
        <b>Minimum Temperature: </b> {weatherData.weather.temp_min} <br />
        <b>Maximum Temperature: </b> {weatherData.weather.temp_max} <br />
        <b>Humidity: </b> {weatherData.weather.humidity} <br />
      </> : ''}
      <label>Search City</label>
      <input type="text" value={city} onChange={e => setCity(e.target.value)}/><br/>
      {searchError}
      {
        searchResult === {weather: {}} ?
        <>
          <b>City Name:</b> {searchResult.cityName} <br />
          <b>Temperature: </b> {searchResult.weather.temp} <br />
          <b>Minimum Temperature: </b> {searchResult.weather.temp_min} <br />
          <b>Maximum Temperature: </b> {searchResult.weather.temp_max} <br />
          <b>Humidity: </b> {searchResult.weather.humidity} <br />
        </> : ''
      }
      
    </div>
  );
}

export default App;
