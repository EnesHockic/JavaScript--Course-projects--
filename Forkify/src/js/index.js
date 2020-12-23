import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './models/Recipe';
import List from './models/List';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';
/*Global state
--Search object
--Current recipe object
--Shoping list object
--Liked recipes */
const state = {

};
window.state = state;
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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id));
        } catch (error) {
            alert('Error processing recipe!');
        }
    }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/*LIST CONTROLLER */
const controlList = () => {
    //Create a new list IF there is none yet
    if (!state.list) state.list = new List();

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
};
//Handle delete and update list item events
elements.shoping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if (e.target.matches('.shopping__delete,.shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);

        //Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});
/*
LIKE CONTROLLER
*/
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has not liked current recipe
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to the UI list
        likesView.renderLike(newLike);
        //User has liked current recipe
    } else {
        //Remove like to the state
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like to the UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore likes recipes
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage();

    //Toggle like menu
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
})

//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches(`.btn-decrease, .btn-decrease *`)) {
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if (e.target.matches(`.btn-increase, .btn-increase *`)) {
        //Increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches(`.recipe__btn--add, .recipe__btn--add *`)) {
        //add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__likes,.recipe__likes *')) {
        controlLike();
    }
})














