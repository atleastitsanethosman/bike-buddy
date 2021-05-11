var weatherEl = document.querySelector(".weather");
var recentEl = document.querySelector(".recent-searches");
var searchBarEl = document.querySelector(".findBtn");
var myLocationEl = document.querySelector(".NearMe");
var cityList = [];
// Set the number of recent searches to keep
var historyLength = 8;

function publishWeather(weatherObj){
// Function to parse the weather object and publish the data to the page
// Needs styling classes defined and added to the <div> tags to implement the styling

  // Fill in the date in the header
  var todayDate = moment.unix(weatherObj.dt + weatherObj.timezone).format("MMM D, YYYY");
  dateEl = document.querySelector("header");
  dateEl.children[1].textContent = todayDate;
  // Clear old previous weather
  while (weatherEl.firstChild) {
    weatherEl.removeChild(weatherEl.firstChild);
  }
  // Get the element for the weather section
  // Change the header text
  var weatherHeadingEl = document.createElement('h5')
  weatherHeadingEl.classList.add('center-align', 'subCat');
  weatherHeadingEl.textContent = "Today's Weather";
  weatherEl.append(weatherHeadingEl);

  // Get the relavent data from the weather object
  var weatherIcon = weatherObj.weather[0].icon;
  var weatherTemp = weatherObj.main.temp;
  var weatherHumid = weatherObj.main.humidity;

  // Build the weather icon element (<img> tag inside a <div> tag)
  iconEl = document.createElement('img');
  iconEl.src = "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
  iconDiv = document.createElement('div');
  iconDiv.classList.add('center-align');
  iconDiv.classList.add("icon");
  iconDiv.append(iconEl);
  
  // Build the temperature element (<div> tag)
  tempEl = document.createElement('div');
  tempEl.classList.add("temp");
  tempEl.classList.add("center-align");
  tempEl.textContent = Math.round(weatherTemp) + " °F";

  // Build the humidity element (<div> tag)
  humidEl = document.createElement('div');
  humidEl.classList.add("humid");
  humidEl.classList.add("center-align");
  humidEl.textContent = weatherHumid + " %";

  // Append the three elements defined above to the weather element
  weatherEl.append(iconDiv, tempEl, humidEl);

}

function searchApi(query) {
    // This function takes the city name as the input and 
    // calls the openweathermap API to get today's data
    // API Documentation:
    // api.openweathermap.org/data/2.5/weather?q={city name}&appid=ae645017a7275733894562a7a4d6f737
  
    // Start to building the URL shown above
    var locQueryUrl = 'https://api.openweathermap.org/data/2.5/';
  
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

    console.log("query = ", query);
  
    if (query.name.length){

      // This combines the start of the URL from above with the 
      // city name that the function receives in 'query' and 
      // appends the apiKey (which includes a request for Imperial units)
      locQueryUrl = locQueryUrl + 'weather?q=' + query.name + apiKey;
      console.log(locQueryUrl);

    } else if (query.lat) {
      // This query is for the case taht we have latitude and longitude but not a city name
      locQueryUrl = locQueryUrl + 'weather?lat=' + query.lat + '&lon=' + query.lon + apiKey;
      console.log(locQueryUrl);
    }
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
          console.log(locRes.name);
          city.name = locRes.name;
          city.lon = locRes.coord.lon;
          city.lat = locRes.coord.lat;
          console.log(city);
          handleSaveData(city.name);
          publishWeather(locRes);
          bikeWise(city);
       }
      })
      .catch (function (error) {
        console.error(error);
      });
  }

  // function to pull incidents from bikewise API, takes Lat and Lon from Weatherwise call.
function bikeWise(city) {
  // data from weatherwise call
  var proximity = city.lat + "," + city.lon;
  // URL inputting lattitude and Longitude from Query above, 25 at end of URL is max of results.
  var bikeWiseURL = "https://bikewise.org:443/api/v2/incidents?page=1&per_page=25&proximity=" + proximity + "&proximity_square=5";
  // fetch command to get data from bikewise API
  fetch (bikeWiseURL)
  .then(function (response) {
    console.log(response);
    return response.json();
  })
  .then (function (data){
    // empty area of previous incidents to reset list.
    $('#bikeIncidents').empty();
    console.log(data);
    // code to create a series of cards for the incidents from bikewise.
    for (var i = 0; i< data.incidents.length; i++) {
    var incident = $('<div>').addClass('card');
    var incidentContent = $('<div>').addClass('card-content');
    // add title to card consisting of incident type and title of report.
    var title = $('<span>').addClass('card-title');
    title.text(data.incidents[i].type + ": " + data.incidents[i].title);
    incidentContent.append(title);
    incident.append(incidentContent);
    // add description from bikewise incident to card.
    var description = $('<p>').text(data.incidents[i].description);
    incident.append(description);
    // add date incident occurred to footer of card.
    var date = $('<div>').addClass('card-action');
    date.text('occurred: ' + moment.unix(data.incidents[i].occurred_at).format('l'))
    incident.append(date);
    // add data about address this occurred at to footer of card.
    var address = $('<div>').addClass('card-action');
    address.text('Address: ' + data.incidents[i].address);
    incident.append(address);
    // append cards to page.
    $('#bikeIncidents').append(incident);
    };
  })
}

function getLocalStorage(){
  // We want to get a list of cities from local storage
  var cityList = JSON.parse(localStorage.getItem("cityList"));
  if (cityList !== null) {
    var recentEl = document.querySelector('.recent-searches');

    // Remove current buttons
    while (recentEl.firstChild){
      recentEl.removeChild(recentEl.firstChild);
    }

    var cityEl = [];
    for (var i = 0; i < cityList.length; i++) {
      // The children of these particular divs need to be clickable elements
      cityEl[i] = document.createElement('button');
      cityEl[i].classList.add('btn-small', 'waves-effect', 'waves-light');
      cityEl[i].setAttribute('data-name', cityList[i]);
      cityEl[i].textContent = cityList[i];
      recentEl.append(cityEl[i]);

    }
  }
 
}

function handleSaveData(city) {
  var cityList = JSON.parse(localStorage.getItem("cityList"));
  if (cityList !== null) {

    console.log("CityList = ", cityList);
    console.log("Save Data = ", city);
    if (!cityList.includes(city)) {
      // Add city to the top of the list
      cityList.unshift(city);
    } else {
      pos = cityList.indexOf(city);
      cityList.splice(pos, 1);
      cityList.unshift(city);
    }

    cityList.splice(historyLength, cityList.length - historyLength);
  }
  // Store the list
  localStorage.setItem("cityList", JSON.stringify(cityList));

  getLocalStorage();

}

function handleSearchFormSubmit(event) {
  event.preventDefault();
  inputValue = document.querySelector('#city');
  var cityName = inputValue.value;

  if (!cityName){
    console.error('You need a search input value!');
    return;
  }
  
  inputValue.value = "";  
  var city = {name: cityName, lat: "", lon: ""};
  console.log(city);
  searchApi(city);
}

function handleSearchHistorySubmit(event) {
  event.preventDefault();

  var element = event.target;

  if (element.matches("button")) {
    var cityName = element.getAttribute("data-name");
  }
  var city = {name: cityName, lat: "", lon: ""};
  searchApi(city);
}

function myLocation(event) {
  event.preventDefault();

  var element = event.target;
  
  var cityEl = document.querySelector("#city");

  function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    city = {name: "", lat: lat, lon: lon};

    searchApi(city);
  }

  function error() {
    cityEl.textContent = "Location unavailable, please enter a city name";
  }

  if (!navigator.geolocation) {
    cityEl.textContent = "Geolocation not supported, please enter a city name";
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}


getLocalStorage();

searchBarEl.addEventListener('click', handleSearchFormSubmit);

recentEl.addEventListener('click', handleSearchHistorySubmit);

myLocationEl.addEventListener('click', myLocation);

