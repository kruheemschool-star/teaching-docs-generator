
const apiKey = "AIzaSyCIWg1ypEmkkvTre_zoacOL82QO0dK8_FQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching models from:", url.replace(apiKey, "HIDDEN_KEY"));

fetch(url)
    .then(res => res.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => console.error(err));
