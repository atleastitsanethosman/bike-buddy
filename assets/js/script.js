function searchApi(query) {
    // This function takes the city name as the input and 
    // calls the openweathermap API to get today's data
    // API Documentation:
    // api.openweathermap.org/data/2.5/weather?q={city name}&appid=ae645017a7275733894562a7a4d6f737
  
    // Start to building the URL shown above
    var locQueryUrl = 'https://api.openweathermap.org/data/2.5/weather';
  
    // This is Barry's appid, please don' share it.  
    //It includes a request for Imperial units
    var apiKey = '&units=imperial&appid=ae645017a7275733894562a7a4d6f737';
  
    // defining an object named city to hold the city name and location
    // This info is necessary if you want to have multiday forecast
    var city = {
      name: "",
      lat: "",
      lon: ""
    };
  
    // This combines the start of the URL from above with the 
    // city name that the function receives in 'query' and 
    // appends the apiKey (which includes a request for Imperial units)
    locQueryUrl = locQueryUrl + '?q=' + query + apiKey;
  
    //The fetch function calls the API with the URL that was built above
    fetch(locQueryUrl)
      .then(function (response) {
        if (!response.ok) {
          throw response.json();
        }
  
        return response.json();
      })
      .then(function (locRes) {
        // The if statement checks to see if a city name has been returned
        // If not, it prints a message to the log and can add a message to a page if you set that up.
        if (!locRes.name.length) {
          console.log('No results found!');
          //resultContentEl.innerHTML = '<h3>No results found, search again!</h3>';
        } else {
          //If a result was returned, the result can be passed to a function to print the results to the page
          
          //printWeather(locRes);
            return locRes;
  
       }
      })
      .catch(function (error) {
        console.error(error);
      });
  }