
import * as imported from './modules.js'
const {appId, appKey, Image, Title, Calories, Label, Recipe, Labels} = imported;

const loader = document.querySelector(".loader");
const diet = document.querySelector(".diet");
const health = document.querySelector(".health");
const searchFood = document.querySelector(".keyword-input");
const recipesSection = document.querySelector("#recipes");
const calValues = document.querySelectorAll(".cal");

let dietValue = '';
let healthValue = '';
let calMinValue = '';
let calMaxValue = '';
let caloriesValue = '';

class Url{

	constructor(adress){
		this.adress = adress;
	}

	checkDiet(){
		if (dietValue) {
			this.adress += `&diet=${dietValue}`;
		}
	}

	checkHealth(){
		if (healthValue) {
			this.adress += `&health=${healthValue}`;
		}
	}

	checkCalories(){
		if (calMinValue) {
			caloriesValue = calMinValue + '-';
			if (calMaxValue) {
				caloriesValue += calMaxValue;
			}
		} else if (calMaxValue) {
			caloriesValue = calMaxValue;
		}

		if (caloriesValue) {
			this.adress += `&calories=${caloriesValue}`;
		}
	}

	checkPaprameters(){
		this.checkDiet();
		this.checkHealth();
		this.checkCalories();
	}
}

const  loading = ()=> loader.style.visibility = "visible";
const  loaded = ()=> loader.style.visibility = "hidden";

const getRecipes = (searchValue, from) => {
	loading();

	if(from === undefined) {
		from = 0;
	}
	
	let requestURL = new Url (`https://api.edamam.com/search?q=${searchValue}&app_id=${appId}&app_key=${appKey}&from=${from}`);
	requestURL.checkPaprameters();

	fetch(requestURL.adress)
  	.then((response) => {
    	return response.json();
  	})
  	.then((myJson) => {
    	listRecipes(myJson.hits);
    	let count = document.querySelector(".recipe-count-number");
		myJson.count === 0 ? 
		alert("No results found - change parameters") : 
		count.textContent = myJson.count;
		let numberOfPages = Math.ceil(myJson.count/10);
		if (numberOfPages > 10) {
			numberOfPages = 10;
		}
		pagination(from/10 + 1, numberOfPages);
		loaded();
  	})
  	.catch((error) => {
	  alert(`Error: ${error}`);
	});

}

const listRecipes = recipes => {
	recipesSection.innerHTML = "";
	recipes.forEach(recipe => addRecipe(recipe));
	loaded();
}

const addRecipe = recipeData => {	
	let {image, label, calories, healthLabels} = recipeData.recipe;

	let img = new Image(image);
	let title = new Title(label)
	let cals = new Calories(Math.round(calories/recipeData.recipe.yield));
	let labels = new Labels();

	healthLabels.forEach(element => {
		let label = new Label(element);
		labels.addLabel(label.content);
	})
	let recipeElement = new Recipe(img.content + title.content + cals.content + labels.content);
	recipesSection.innerHTML += recipeElement.content;
}

const pagination = (current, last) => {
	let delta = 3;
	let range = 7;
	let pages = [];

	let left = current - delta;
	let right = current + delta;

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
	
	for (let i = 0; i < range; i++) {
		pages[i] = left;
		left ++;
	}
	addPagination(pages, current);
	createArrows(current, last);
}

const addPagination = (someArrayOfPages, currentPage) => {
	let mainPagination = document.querySelector(".pagination");
	mainPagination.style.display = "flex";
	mainPagination.innerHTML = "";

	let listPages = document.createElement("div");
	listPages.classList.add("pages");
	mainPagination.appendChild(listPages);

	for (let i = 0; i <= someArrayOfPages.length -1; i++) {
		let page = document.createElement("span");
		page.textContent = someArrayOfPages[i];
		
		if (someArrayOfPages[i] === currentPage) {
			page.classList.add("selected");
		}
		listPages.appendChild(page);	
	}

	let mySpans = document.querySelectorAll(".pages span");
	mySpans.forEach(element => element.addEventListener("click", ()=> getRecipes(foodValue, (element.textContent - 1)*10)));
}

const createArrows = (myCurrentPage, myLastPage) => {
	let previousPage = createArrow("previous-page");
	let firstPage = createArrow("first-page");
	let nextPage = createArrow("next-page");
	let lastPage = createArrow("last-page");

	let previous = myCurrentPage - 1;
	if (myCurrentPage === 1) {
		previous = 1;
	} 

	let next = myCurrentPage + 1;
	if (myCurrentPage === myLastPage) {
		next = myCurrentPage;
	}

	addListener(firstPage, 1);
	addListener(lastPage, myLastPage);
	addListener(previousPage, previous);
	addListener(nextPage, next);
}

const addListener = (element, number) => element.addEventListener("click", ()=> getRecipes(foodValue, (number - 1)*10));

const createArrow = someClass => {
	let mainPagination = document.querySelector(".pagination");
	let someArrow = document.createElement("div");
	let someSpan = document.createElement("span");
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

const button = document.querySelector(".search-button");

calValues[0].onkeyup = () => calMinValue = calValues[0].value;
calValues[1].onkeyup = () => calMaxValue = calValues[1].value;
diet.onchange = () => dietValue = diet.value;
health.onchange = () => healthValue = health.value;

searchFood.onkeyup = () => {
	button.removeAttribute("disabled");
	if (searchFood.value === "") {
		button.setAttribute("disabled", true);
	}
	window.foodValue = searchFood.value;
}

button.addEventListener("click", () => getRecipes(foodValue));
