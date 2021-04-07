let apiKey = "3ac0d8db34de82819d13a9167239acc1";
let searchBtn = $(".searchBtn");
let searchInput = $(".searchInput");

//* Create a current date variable
var today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();
var today = mm + '/' + dd + '/' + yyyy;

//* Right column locations
let tempEl = $(".temp");
let humidityEl = $(".humidity");
let windSpeedEl = $(".windSpeed");
let uvIndexEl = $(".uvIndex");
let cardRow = $(".card-row");

//* Left column locations
let cityNameEl = $(".cityName");
let currentDateEl = $(".currentDate");
let weatherIconEl = $(".weatherIcon");
let searchHistory = $(".historySearch");

if (JSON.parse(localStorage.getItem("searchHistory")) === null) {
    console.log("searchHistory not found")
} else {
    console.log("searchHistory loaded into searchHistoryArr");
    renderSearchHistory();
}

searchBtn.on("click", function (e) {
    e.preventDefault();
    if (searchInput.val() === "") {
        alert("You must enter the name of a city!");
        return;
    }
    console.log("clicked button")
    getWeather(searchInput.val());
});

$(document).on("click", ".historyEntry", function () {
    console.log("clicked history item")
    let thisElement = $(this);
    getWeather(thisElement.text());
})


function renderSearchHistory(cityName) {
    searchHistoryEl.empty();
    let searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
    for (let i = 0; i < searchHistoryArr.length; i++) {
        let newListItem = $("<li>").attr("class", "historyEntry");
        newListItem.text(searchHistoryArr[i]);
        searchHistoryEl.prepend(newListItem);
    }
}

function renderWeatherData(cityName, cityHumidity, cityWindSpeed, cityWeatherIcon, uvVal) {
    cityNameEl.text(cityName)
    currentDateEl.text(`(${today})`)
    tempEl.text(`Temperature: ${cityTemp} °F`);
    humidityEl.text(`Humidity: ${cityHumidity} %`);
    windSpeedEl.text(`Wind Speed: ${cityWindSpeed} MPH`);
    uvIndexEl.text(`UV Index: ${uvVal}`);
    weatherIconEl.attr("src", cityWeatherIcon);
}

function getWeather(desiredCity) {
    let queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${desiredCity}&APPID=${apiKey}&units=imperial`;
    $.ajax({
        url: queryUrl,
        method: "GET"
    })
        .then(function (weatherData) {
            let cityObj = {
                cityName: weatherData.name,
                cityTemp: weatherData.main.temp,
                cityHumidity: weatherData.main.humidity,
                cityWindSpeed: weatherData.wind.speed,
                cityUVIndex: weatherData.weather[0].icon
            }
            let queryUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityObj.cityUVIndex.lat}&lon=${cityObj.cityUVIndex.lon}&APPID=${apiKey}&units=imperial`;
            $.ajax({
                url: queryUrl,
                method: "GET"
            })
                .then(function (uvData) {
                    if (JSON.parse(localStorage.getItem("searchHistory")) === null) {
                        let searchHistoryArr = [];

                        if (searchHistoryArr.indexOf(cityObj.cityName) === -1) {
                            searchHistoryArr.push(cityObj.cityName);

                            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                            renderSearchHistory(cityObj.cityName);
                        } else {
                            console.log("City is already in the search history!")
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                        } 
                    
                    }else{
                        let searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
                        
                        if (searchHistoryArr.indexOf(cityObj.cityName) === -1) {
                            searchHistoryArr.push(cityObj.cityName);
                             
                            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                            renderSearchHistory(cityObj.cityName);
                        } else {
                            console.log("City already in searchHistory. Not adding to history list")
                            let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                            renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                        }
                    }
                })

        });

        getFiveDayForecast() {
            cardRow.empty();
            let queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${desiredCity}&APPID=${apiKey}&units=imperial`;
            $.ajax({
                url: queryUrl,
                method: "GET"
            })
            .then(function(fiveDayResponse) {
                for (let i=0; i != fiveDayResponse.list.length; i+=8 ) {
                    let cityObj = {
                        date: fiveDayResponse.list[i].dt_txt,
                        icon: fiveDayResponse.list[i].weather[0].icon,
                        temp: fiveDayResponse.list[i].main.temp,
                        humidity: fiveDayResponse.list[i].main.humidity
                    }
                    let dateStr = cityObj.date;
                    let trimmedDate = dateStr.substring(0, 10);
                    let weatherIcon = `https:///openweathermap.org/img/w/${cityObj.icon}.png`;
                    createForecastCard(trimmedDate, weatherIcon, cityObj.temp, cityObj.humidity);
                }
            })
        }
}

function createForecastCard(date, icon, temp, humidity) {

    let fiveDayCardEl = $("<div>").attr("class", "five-day-card");
    let cardDate = $("<h3").attr("class", "card-text");
    let cardIcon = $("<img>").attr("class", "weatherIcon");
    let cardTemp = $("<p>").attr("class", "card-text");
    let cardHumidity = $("<p>").attr("class", "card-text");

    cardRow.append(fiveDayCardEl);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temp: ${temp} °F`);
    cardHumidity.text(`Humidity: ${humidity} %`);
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity);

}