let recipeUrl = 'https://api.edamam.com/search'
let appId = '4368d7f2'
let apiKey = '05ecbbc4506fdc8681ed7f7c905b3064'
let totalResults = 10
let beerUrl = 'https://api.punkapi.com/v2/beers?'

function getRecipes(query, dietFilter) {
    let params = {
        q: query,
        app_id: appId,
        app_key: apiKey,
        to: totalResults,

    };

    if (dietFilter) {
        params.health = dietFilter

    }
    let queryString = formatQuery(params)
    let url = recipeUrl + '?' + queryString;
    console.log(url);

    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json()
            }
            throw new Error(response.statusText)
        })
        .then(responseJson => displayRecipes(responseJson))
        .catch(err => alert(`Something went wrong`));
}


function formatQuery(params) {
    let queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&')

}

function displayRecipes(responseJson) {
    console.log(responseJson)
    for (let i = 0; i < responseJson.hits.length; i++) {
        let ingredients = responseJson.hits[i].recipe.ingredientLines.map((a) => {
            return `<li>${a}</li>`
        });
        $('#js-results').append(`<div class="recipe"><h3>${responseJson.hits[i].recipe.label}</h3>
        <img src="${responseJson.hits[i].recipe.image}" class="child"> 
          <ul>
          <li>Serving Size:</li>
          <li>Diet Labels:${responseJson.hits[i].recipe.healthLabels}</li>
          </ul>
        <hr>
        <h4>Ingredients</h4>
        <ul id="js-ingredients">
        ${ingredients.join('')}
        </ul>
        <a href="${responseJson.hits[i].recipe.url}" class="button" target="_blank">View Instructions</a>
        <button id="js-beer-results">Click for Beer Recs</button> 
            <div class="js-beer-results-list hidden"></div>
        </div>`
        )
    };
    $('#js-results').removeClass('hidden');
}


function getBeerRec() {
    $('main').on('click', '#js-beer-results', (event) => {
        let targetedDiv = $(event.target).siblings(".js-beer-results-list");
        console.log(targetedDiv)
        let query = $(event.target).closest(".recipe").children("h3").text();
        query = query.replace(/[^a-zA-Z ]/g, "").replace('and','').split(" ").filter(item => item)
        console.log(query)
        const requests = query.map(q => fetch(beerUrl + `food=${q}&per_page=3`))
        Promise.all(requests).then(responses => {
            return Promise.all(responses.map(res => res.json()));
        })
            .then(responsesJSON => {
                displayBeers(responsesJSON.flat(), targetedDiv);
            })
    })
}

function displayBeers(responseJson, targetedDiv) {
    for (let i = 0; i < 3; i++) {
        $(targetedDiv).append(`<div class="beers"><h3>Beer Recomendations based of your recipe....</h3>
          <h4>${responseJson[i].name}</h4>
          <img src="${responseJson[i].image_url}" alt="" width="20%">
          <p>${responseJson[i].description}</p></div>`)
    }
    $(targetedDiv).removeClass('hidden');
}

function initialize() {
    watchForm();
    getBeerRec();
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        $('#js-results').empty();
        let keywordSearchTerm = $('#js-keyword-search').val();
        let dietFilter = $('input[type="checkbox"]:checked').val();
        console.log("Searching for " + keywordSearchTerm);
        getRecipes(keywordSearchTerm, dietFilter);
    })
}


  
$(initialize)