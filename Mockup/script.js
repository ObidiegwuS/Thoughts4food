const form = document.querySelector('.ingredient-form');
const ingredientInput = document.querySelector('#ingredient-input');
const chipsList = document.querySelector('.ingredient-chips');
const message = document.querySelector('.form-message');
const addButton = document.querySelector('.add-ingredient');
const submitButton = document.querySelector('.find-recipes');
const statusDot = document.querySelector('.status-dot');
let ingredients = [];
let isSearching = false;

function normalizeIngredients(values) {
  const seen = new Set();
  return values
    .flatMap((value) => value.split(/[,;\n]+/))
    .map((value) => value.trim().replace(/\s+/g, ' '))
    .filter((value) => {
      const key = value.toLocaleLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function renderIngredients() {
  chipsList.replaceChildren();
  chipsList.hidden = ingredients.length === 0;

  ingredients.forEach((ingredient) => {
    const chip = document.createElement('li');
    const label = document.createElement('span');
    const removeButton = document.createElement('button');
    label.textContent = ingredient;
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `Remove ${ingredient}`);
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
      ingredients = ingredients.filter((item) => item !== ingredient);
      renderIngredients();
    });
    chip.append(label, removeButton);
    chipsList.append(chip);
  });
}

function addDraftIngredients() {
  ingredients = normalizeIngredients([...ingredients, ingredientInput.value]);
  ingredientInput.value = '';
  message.hidden = true;
  renderIngredients();
}

addButton.addEventListener('click', addDraftIngredients);

ingredientInput.addEventListener('input', () => {
  message.hidden = true;
  addButton.disabled = !ingredientInput.value.trim() || isSearching;
});

ingredientInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (isSearching) return;

  ingredients = normalizeIngredients([...ingredients, ingredientInput.value]);
  ingredientInput.value = '';
  renderIngredients();
  if (ingredients.length === 0) {
    message.textContent = 'Add at least one ingredient before searching.';
    message.hidden = false;
    ingredientInput.focus();
    return;
  }

  isSearching = true;
  submitButton.disabled = true;
  addButton.disabled = true;
  ingredientInput.disabled = true;
  submitButton.textContent = 'Searching...';
  statusDot.textContent = 'Searching';
  message.textContent = `Searching with: ${ingredients.join(', ')}`;
  message.hidden = false;

  window.setTimeout(() => {
    isSearching = false;
    submitButton.disabled = false;
    addButton.disabled = !ingredientInput.value.trim();
    ingredientInput.disabled = false;
    submitButton.textContent = 'Find Recipes';
    statusDot.textContent = 'Ingredients ready';
    message.textContent = `Your ingredient list is ready: ${ingredients.join(', ')}.`;
    ingredientInput.focus();
  }, 450);
});
