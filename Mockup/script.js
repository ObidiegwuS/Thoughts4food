const fileInput = document.querySelector('input[type="file"]');
const imageFrame = document.querySelector('.image-frame');
const scanLabel = document.querySelector('.scan-label');
const resultTitle = document.querySelector('.result-top h3');
const confidenceBadge = document.querySelector('.confidence-badge');
const caloriesValue = document.querySelector('.macro-card.calories strong');
const proteinValue = document.querySelector('.macro-card.protein strong');
const carbsValue = document.querySelector('.macro-card.carbs strong');
const fatValue = document.querySelector('.macro-card.fat strong');
const nutrientItems = document.querySelectorAll('.nutrient-list li');
const statusDot = document.querySelector('.status-dot');

const mealProfiles = {
  salmon: {
    title: 'Salmon grain bowl',
    calories: '548',
    protein: '36g',
    carbs: '42g',
    fat: '22g',
    confidence: '92% match',
    vitamins: ['Vitamin D', 'Omega-3', 'Iron', 'Potassium'],
    values: ['72%', '68%', '31%', '54%'],
    tags: ['fiber boost', 'high protein', 'low sugar'],
    background: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    status: 'AI ready'
  },
  avocado: {
    title: 'Avocado power salad',
    calories: '482',
    protein: '28g',
    carbs: '36g',
    fat: '19g',
    confidence: '89% match',
    vitamins: ['Vitamin C', 'Potassium', 'Folate', 'Magnesium'],
    values: ['81%', '66%', '38%', '27%'],
    tags: ['clean energy', 'plant fuel', 'gut health'],
    background: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    status: 'Fresh scan'
  },
  smoothie: {
    title: 'Green smoothie bowl',
    calories: '410',
    protein: '24g',
    carbs: '39g',
    fat: '16g',
    confidence: '94% match',
    vitamins: ['Vitamin A', 'Vitamin C', 'Calcium', 'Fiber'],
    values: ['89%', '76%', '22%', '58%'],
    tags: ['hydration', 'vegan fuel', 'antioxidants'],
    background: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    status: 'Boost mode'
  }
};

if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result === 'string') {
        imageFrame.style.background = `linear-gradient(180deg, rgba(25, 35, 40, 0.15), rgba(0, 0, 0, 0.2)), url('${result}') center/cover no-repeat`;
      }

      const profileKey = Object.keys(mealProfiles)[Math.floor(Math.random() * Object.keys(mealProfiles).length)];
      const profile = mealProfiles[profileKey];

      resultTitle.textContent = profile.title;
      confidenceBadge.textContent = profile.confidence;
      caloriesValue.textContent = profile.calories;
      proteinValue.textContent = profile.protein;
      carbsValue.textContent = profile.carbs;
      fatValue.textContent = profile.fat;
      scanLabel.textContent = 'meal recognized';
      statusDot.textContent = profile.status;

      nutrientItems.forEach((item, index) => {
        const label = item.querySelector('span');
        const value = item.querySelector('strong');
        if (label) label.textContent = profile.vitamins[index] || profile.vitamins[0];
        if (value) value.textContent = profile.values[index] || profile.values[0];
      });

      const tagContainer = document.querySelector('.meal-tags');
      if (tagContainer) {
        tagContainer.innerHTML = profile.tags.map(tag => `<span>${tag}</span>`).join('');
      }
    };

    reader.readAsDataURL(file);
  });
}
