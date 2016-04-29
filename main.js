function format(string) {
    for (var i = 1; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi')
        string = string.replace(regexp, arguments[i])
    }
    return string;
}

function run(location) {
    request.open('GET', format(query, location), true)

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            var data = JSON.parse(this.response);
            yqlCallback(data.query);
        } else {
            // We reached our target server, but it returned an error
            console.log('error')
        }
    }

    request.onerror = function() {
        // There was a connection error of some sort
        console.log('error')
    }

    request.send()

}

function updateCurrent (location, wind, condition, atmosphere, astronomy, units) {
  var loc = location.city + ', ' + location.region
  document.getElementById('location').textContent = loc;

  document.getElementById('time').textContent = moment(condition.data).format('LLL')

  var currentImg = document.getElementById('currentImg')
  currentImg.alt = condition.text
  currentImg.src = format('//icons.wxug.com/i/c/v4/{0}.svg', condition.text.toLowerCase().replace(/ |hunder/gi, ''))

  document.getElementById('currentCondition').textContent = condition.text
  document.getElementById('currentTemp').textContent = condition.temp
  document.getElementById('currentUnitTemp').textContent = units.temperature
  document.getElementById('windArrow').style.transform = 'rotate(' + wind.direction + 'deg)'
  document.getElementById('windSpeed').textContent = wind.speed
  document.getElementById('windUnit').textContent = units.speed

  document.getElementById('humidity').textContent = atmosphere.humidity
  document.getElementById('pressure').textContent = atmosphere.pressure
  document.getElementById('sunrise').textContent = astronomy.sunrise
  document.getElementById('sunset').textContent = astronomy.sunset
}

function genTiles (forecast, unitTemperature) {
  var html = ''
  var day

  for (var i = 0; i < forecast.length; i++) {
    day = forecast[i]

    html += format(template, day.day, day.text, day.high, day.low, unitTemperature, day.text.toLowerCase().replace(/ |hunder/gi, ''))
  }
  return html
}

var request = new XMLHttpRequest()
var query = 'https://query.yahooapis.com/v1/public/yql?format=json&callback=&q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22{0}%22)'
var template = document.getElementById('weatherTile').innerHTML.trim()
var weather10day = document.getElementById('weather10day')
var search = document.getElementById('search')

search.addEventListener('input', function (e) {
  var place = e.target.value.trim()
  sessionStorage.setItem('location', place)

  if (search.value.length > 2) {
    run(place)
  }
})

function yqlCallback (data) {
    var result
    var html = ''
    if (data.count) {
        result = data.results.channel
        updateCurrent(result.location, result.wind, result.item.condition, result.atmosphere, result.astronomy, result.units)
        var forecast = result.item

        weather10day.innerHTML = genTiles(forecast.forecast, result.units.temperature)
    }
}

search.value = sessionStorage.getItem('location') || ''
run(search.value.trim() || search.placeholder)
