import axios from 'axios';

const KEY = 'AIzaSyBLSCj-HzdlrCOLcBdi_N27PB72N8P87VQ'

const api_google = axios.create({
  baseUrl: 'https://maps.googleapis.com/maps/api/directions'
})

export default api_google
