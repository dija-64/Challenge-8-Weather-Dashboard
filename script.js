var citySearch = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var cityTemp = $("#temperature");
var cityHumid = $("#humidity");
var cityWind = $("#wind-speed");
var cityUV = $("#uv-index");
var sCity = [];

const APIKey = "95ded46496c80b8160db1b87c71937ca";
const iconBaseURL = "https://openweathermap.org/img/wn/";

function find(c) {
    return sCity.findIndex(city => city.toUpperCase() === c.toUpperCase());
}

function displayWeather(event) {
    event.preventDefault();
    const city = citySearch.val().trim();
    if (city !== "") {
        currentWeather(city);
    }
}

function currentWeather(city) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${APIKey}`;

    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);

        const weathericon = response.weather[0].icon;
        const iconurl = `${iconBaseURL}${weathericon}@2x.png`;

        const date = new Date(response.dt * 1000).toLocaleDateString();

        currentCity.html(`${response.name} (${date}) <img src="${iconurl}">`);

        const tempC = response.main.temp - 273.15;
        cityTemp.html(`${tempC.toFixed(1)} &#8451`);

        cityHumid.html(`${response.main.humidity}%`);

        const windsmph = (response.wind.speed * 2.237).toFixed(1);
        cityWind.html(`${windsmph} MPH`);

        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);

        if (response.cod === 200) {
            sCity = JSON.parse(localStorage.getItem("cityname")) || [];
            console.log(sCity);
            if (!sCity.includes(city.toUpperCase())) {
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            }
        }
    });
}

function UVIndex(ln, lt) {
    const uvqURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${APIKey}&lat=${lt}&lon=${ln}`;

    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        cityUV.html(response.value);
    });
}

function forecast(cityid) {
    const queryforcastURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityid}&appid=${APIKey}`;

    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {
        for (let i = 0; i < 5; i++) {
            const date = new Date(response.list[((i + 1) * 8) - 1].dt * 1000).toLocaleDateString();
            const iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            const iconurl = `${iconBaseURL}${iconcode}.png`;
            const tempK = response.list[((i + 1) * 8) - 1].main.temp;
            const tempC = tempK - 273.15;
            const humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $(`#fDate${i}`).html(date);
            $(`#fImg${i}`).html(`<img src="${iconurl}">`);
            $(`#fTemp${i}`).html(`${tempC.toFixed(1)} &#8451`);
            $(`#fHumidity${i}`).html(`${humidity}%`);
        }
    });
}

function addToList(c) {
    const listEl = $("<li>").text(c.toUpperCase()).addClass("list-group-item").attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}

function invokePastSearch(event) {
    const liEl = event.target;
    if (liEl.matches("li")) {
        const city = liEl.textContent.trim();
        currentWeather(city);
    }
}

function loadlastCity() {
    $("ul").empty();
    const sCity = JSON.parse(localStorage.getItem("cityname")) || [];
    for (let i = 0; i < sCity.length; i++) {
        addToList(sCity[i]);
    }
    const city = sCity[sCity.length - 1];
    currentWeather(city);
}

function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}

searchButton.on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
clearButton.on("click", clearHistory);
