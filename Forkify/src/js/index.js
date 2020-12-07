import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader } from './views/base';
/*Global state
--Search object
--Current recipe object
--Shoping list object
--Liked recipes */
const state = {

};
/*SEARCH CONSTROLLER*/
const controlSearch = async () => {
    //(1) Get query from the view
    const query = searchView.getInput()//TODO
    if (query) {
        //(2) New search object and add state
        state.search = new Search(query);

        //(3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResDiv);
        try {
            //(4) search for recipes
            await state.search.getResults();

            //(5) render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Error processing search!');
            clearLoader();
        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); //Prevents reloading page on button click 
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});



/*RECIPE CONTROLLER*/
const controlRecipe = async () => { //kada se promijeni hash u linku
    //Get ID from Url
    const id = window.location.hash.replace('#', '');//kako bi mogli poukupiti ispravan id, ukljanjamo #
    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected recipe from the list
        if (state.search)
            searchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);


        //testing
        try {
            //Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (error) {
            alert('Error processing recipe!');
        }
    }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches(`.btn-decrease, .btn-decrease *`)) {
        //Decrease button is clicked
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    if (e.target.matches(`.btn-increase, .btn-increase *`)) {
        //Increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe);
    }
    console.log(state.recipe);
})














