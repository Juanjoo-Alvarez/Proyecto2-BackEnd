export default function backendUrl(apiEndpoint) {
  const baseUrl = "http://127.0.0.1:5000/api";
  
  const cleanEndpoint = apiEndpoint.startsWith('/') 
    ? apiEndpoint.slice(1) 
    : apiEndpoint;
  
  return `${baseUrl}/${cleanEndpoint}`;
}