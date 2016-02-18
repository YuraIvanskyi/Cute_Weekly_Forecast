$(function(){
    var location = $('p.location'),
        DAY = $('ul.Week');
    var grad = '*';
    var DEG = 'C';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }
    else{
        showError("Your browser does not support Geolocation!");
    }
    function locationSuccess(position) {
        try{
            var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);
            var d = new Date();
            if(cache && cache.timestamp && cache.timestamp > d.getTime() - 30*60*1000){
                var offset = d.getTimezoneOffset()*60*1000;
                var city = cache.data.city.name;
                var country = cache.data.city.country;
                $.each(cache.data.list, function(){
                    var localTime = new Date(this.dt*1000 + offset);
                    addWeather(
                        this.weather[0].icon,
                        moment(localTime).calendar(),
                        this.weather[0].main +', Temperature: min '+ convertTemperature(this.temp.min) + grad + DEG +
                        ' / ' +'max ' +convertTemperature(this.temp.max) + grad + DEG+' Wind speed '+this.speed+'m/sec'
                    );
                });
                //show location
                location.html(city+', <b>'+country+'</b>');
                DAY.addClass('loaded');
            }
            else{
                var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + position.coords.latitude +
                    '&lon=' + position.coords.longitude + '&cnt=7&callback=?&APPID=7a177fccca75ea145c8241ef607ddefc';
                $.getJSON(weatherAPI, function(response){
                    localStorage.weatherCache = JSON.stringify({
                        timestamp:(new Date()).getTime(),
                        data: response
                    });
                    locationSuccess(position);
                });
            }
        }
        catch(e){
            showError("We can't find information about your city!");
            window.console && console.error(e);
        }
    }
    function addWeather(icon, day, condition,wind_speed){
        var markup = '<li>'+
            '<img src="icons/'+ icon +'.png" />'+
            ' <p class="day">'+ day +'</p> <span class="cond">'+ condition +
            '</span></li>';
        DAY.append(markup);
    }
    function locationError(error){
        switch(error.code) {
            case error.TIMEOUT:
                showError("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                showError('We can\'t detect your location. Sorry!');
                break;
            case error.PERMISSION_DENIED:
                showError('Please allow geolocation access for this to work.');
                break;
            case error.UNKNOWN_ERROR:
                showError('An unknown error occured!');
                break;
        }
    }
    function convertTemperature(kelvin){
        return Math.round(DEG == 'C' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
    }
    function showError(msg){
        DAY.addClass('error').html(msg);
    }
});
