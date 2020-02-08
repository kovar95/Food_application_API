
var appId = "135f0ff9";
var appKey = "82ad2952dd6bf76333298a0399ff63d8";

var loader = document.querySelector(".loader");

var diet = document.querySelector(".diet");
var health = document.querySelector(".health");
var searchFood = document.querySelector(".keyword-input");
var recipesSection = document.querySelector("#recipes");
var calValues = document.querySelectorAll(".cal");

var dietValue = '';
var healthValue = '';
var calMinValue = '';
var calMaxValue = '';

function loading(){
	loader.style.visibility = "visible";
}

function loaded() {
	loader.style.visibility = "hidden";
}

function getRecipes(searchValue, from) {
	var request = new XMLHttpRequest();
	if(from === undefined) {
		from = 0;
	}

	var requestURL = 'https://api.edamam.com/search?q=' + searchValue + '&app_id='
	+ appId + '&app_key=' + appKey + '&from=' + from;

	requestURL = checkPaprameters(requestURL);

	request.open("GET", requestURL);

	request.onload = function(){
		listRecipes(JSON.parse(request.responseText).hits); 
		var count = document.querySelector(".recipe-count-number");
		JSON.parse(request.responseText).count === 0 ? 
		alert("No results found - change parameters") : 
		count.textContent = JSON.parse(request.responseText).count;
		var numberOfPages = Math.ceil(JSON.parse(request.responseText).count/10);
		if (numberOfPages > 10) {
			numberOfPages = 10;
		}
		pagination(from/10 + 1, numberOfPages);
		loaded();
	}

	request.send();
	loading();
}


function checkPaprameters(someURL) {
	var caloriesValue = '';

	if (dietValue) {
		someURL = someURL + '&diet=' + dietValue;
	}

	if (healthValue) {
		someURL = someURL + '&health=' + healthValue;
	}

	if (calMinValue) {
		caloriesValue = calMinValue + '-';
		if (calMaxValue) {
			caloriesValue += calMaxValue;
		}
	} else if (calMaxValue) {
		caloriesValue = calMaxValue;
	}

	if (caloriesValue) {
		someURL = someURL + '&calories=' + caloriesValue;
	}
	return someURL;
}

function listRecipes(recipes) {
	recipesSection.innerHTML = "";

	recipes.forEach(function(recipe) {
		addRecipe(recipe);
	})
	loaded();
}

function addRecipe(recipeData) {	
	var recipeElement = document.createElement("div");
	recipeElement.classList.add("recipe-element");
	recipesSection.appendChild(recipeElement);

	var img = '<img src="' + recipeData.recipe.image +'">';
	var title = '<h3>' + recipeData.recipe.label + '</h3>';
	var calories = '<div class="calories">' +
	Math.round(recipeData.recipe.calories/recipeData.recipe.yield) + '</div>';

	recipeElement.innerHTML = img + title + calories;

	var labels = document.createElement("div");
	labels.classList.add("labels");
	recipeElement.appendChild(labels);

	var myLabels = recipeData.recipe.healthLabels;
	myLabels.forEach((element)=> {
		var label = document.createElement("div");
		label.classList.add("label");
		label.textContent = element;
		labels.appendChild(label);
	})
}

function pagination(current, last) {
	var delta = 3;
	var range = 7;
	var pages = [];

	var left = current - delta;
	var right = current + delta;

	if (range >= last) {
		range = last;
	}

	if (current < 4) {
		left = 1;
		right = range;
	}

	if (last - current < 3) {
		right = last;
	}

	range = right - left + 1;
	
	for (var i = 0; i < range; i++) {
		pages[i] = left;
		left ++;
	}
	addPagination(pages, current);
	createArrows(current, last);
}

function addPagination(someArrayOfPages, currentPage) {
	var mainPagination = document.querySelector(".pagination");
	mainPagination.style.display = "flex";
	mainPagination.innerHTML = "";

	var listPages = document.createElement("div");
	listPages.classList.add("pages");
	mainPagination.appendChild(listPages);

	for (var i = 0; i <= someArrayOfPages.length -1; i++) {
		var page = document.createElement("span");
		page.textContent = someArrayOfPages[i];
		
		if (someArrayOfPages[i] === currentPage) {
			page.classList.add("selected");
		}
		listPages.appendChild(page);	
	}

	var mySpans = document.querySelectorAll(".pages span");
	mySpans.forEach((element)=> {
		element.addEventListener("click", ()=> {
			getRecipes(foodValue, (element.textContent - 1)*10);
		})
	})
}

function createArrows(myCurrentPage, myLastPage) {
	var previousPage = createArrow("previous-page");
	var firstPage = createArrow("first-page");
	var nextPage = createArrow("next-page");
	var lastPage = createArrow("last-page");
	
	if (myCurrentPage === 1) {
		var previous = 1
	} else {
		var previous = myCurrentPage - 1;
	}

	if (myCurrentPage === myLastPage) {
		var next = myCurrentPage;
	} else {
		var next = myCurrentPage + 1;
	}

	addListener(firstPage, 1);
	addListener(lastPage, myLastPage);
	addListener(previousPage, previous);
	addListener(nextPage, next);
}

function addListener(element, number){
	element.addEventListener("click", ()=> {
		getRecipes(foodValue, (number - 1)*10);
	});
}

function createArrow(someClass) {
	var mainPagination = document.querySelector(".pagination");
	var someArrow = document.createElement("div");
	var someSpan = document.createElement("span");
	someArrow.classList.add(someClass);
	someArrow.appendChild(someSpan);

	if (someClass === "first-page") {
		someSpan.textContent = "<<";
		mainPagination.prepend(someArrow);
	} else if (someClass === "previous-page") {
		someSpan.textContent = "<";
		mainPagination.prepend(someArrow);
	} else if (someClass === "next-page") {
		someSpan.textContent = ">";
		mainPagination.appendChild(someArrow);
	} else if (someClass === "last-page") {
		someSpan.textContent = ">>";
		mainPagination.appendChild(someArrow);
	}

	return someArrow;
}

// init 

var button = document.querySelector(".search-button");

calValues[0].onkeyup = function() {
	calMinValue = calValues[0].value;
}

calValues[1].onkeyup = function() {
	calMaxValue = calValues[1].value;
}

searchFood.onkeyup = function() {
	button.removeAttribute("disabled");
	if (searchFood.value === "") {
		button.setAttribute("disabled", true);
	}
	window.foodValue = searchFood.value;
}

diet.onchange = function() {
	dietValue = diet.value;
}

health.onchange = function() {
	healthValue = health.value;
}

button.addEventListener("click", e=> {
	getRecipes(foodValue);
})
