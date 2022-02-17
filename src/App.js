import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'
import Cookies from 'js-cookie'
import { searchCity } from './actions'

const App = () => {

  const [weatherData, setWeatherData] = useState({weather: {}})
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

  const setSearchData = data => {
    if(data.status === 404){
      setSearchError('Name not found')
    }else{
      setSearchResult(data)
    }
  }

  useEffect(() => {
    if(city.length > 0){
      const timeout = setTimeout(() => {
        searchCity(city, setSearchData)
      }, 3000);
      return () => clearTimeout(timeout)
    }

  }, [city])

  console.log('weatherData', searchResult)

  return (
    <div>
      <h3>
        Weather Update:
      </h3>
      {weatherData === {} ? '' : <>
        <b>City Name:</b> {weatherData.cityName} <br />
        <b>Temperature: </b> {weatherData.weather.temp || ''} <br />
        <b>Minimum Temperature: </b> {weatherData.weather.temp_min || ''} <br />
        <b>Maximum Temperature: </b> {weatherData.weather.temp_max || ''} <br />
        <b>Humidity: </b> {weatherData.weather.humidity} <br />
      </>}
      <br/><br/>
      <label>Search City</label>
      <input type="text" value={city} onChange={e => setCity(e.target.value)}/><br/>
      {searchError}
      {
        searchResult === {weather: {}} ? '' :
        <>
          <b>City Name:</b> {searchResult.cityName} <br />
          <b>Temperature: </b> {searchResult.weather.temp} <br />
          <b>Minimum Temperature: </b> {searchResult.weather.temp_min} <br />
          <b>Maximum Temperature: </b> {searchResult.weather.temp_max} <br />
          <b>Humidity: </b> {searchResult.weather.humidity} <br />
        </>
      }
      
    </div>
  );
}

export default App;
