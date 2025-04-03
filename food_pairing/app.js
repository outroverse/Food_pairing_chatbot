const apiKey = "2ccfadacdb104e29a1bc9fa8d8d9d9d7"; // Replace with your Spoonacular API key
const chatbox = document.getElementById("chatbox");

// Handle user input on Enter key
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Send user message to chatbot
function sendMessage() {
  const userInput = document.getElementById("userInput").value.trim().toLowerCase();

  if (userInput === "") return;

  addMessage(userInput, "user");
  getPairings(userInput);
  document.getElementById("userInput").value = "";
}

// Add messages to chatbox
function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
  messageDiv.innerHTML = text; // Allows rendering HTML lists
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Get pairings from API
function getPairings(ingredient) {
  const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${ingredient}&number=5&apiKey=${apiKey}`;

  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("🔍 Ingredient Search Response:", data);

      if (data.results.length === 0) {
        addMessage(`❌ No ingredients found for "${ingredient}". Try something else!`, "bot");
        return;
      }

      // Find best match that exactly matches user input or closely resembles it
      let bestMatch = data.results.find((item) => 
        item.name.toLowerCase() === ingredient.toLowerCase() || 
        item.name.toLowerCase().includes(ingredient.toLowerCase())
      );

      if (!bestMatch) {
        bestMatch = data.results[0]; // Fallback to first result if no close match
      }

      const ingredientId = bestMatch.id;
      const ingredientName = bestMatch.name;
      console.log(`✅ Best Match: ID=${ingredientId}, Name="${ingredientName}"`);

      getIngredientPairings(ingredientId, ingredientName);
    })
    .catch((error) => {
      console.error("❌ Error fetching ingredient:", error);
      addMessage("⚠️ Oops! Something went wrong. Please try again.", "bot");
    });
}

// Get Ingredient Pairings by ID
function getIngredientPairings(ingredientId, ingredientName) {
  const url = `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&apiKey=${apiKey}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch ingredient information.");
      }
      return response.json();
    })
    .then((data) => {
      let message = `🍽️ **Results for "${ingredientName}":**\n\n`;

      // ✅ Show Pairings if available
      if (data.pairings && data.pairings.length > 0) {
        message += `🥗 **Best Pairings:**\n${data.pairings.map((pair) => `- ${pair}`).join("\n")}\n\n`;
      }

      // ✅ Fetch & Show Recipe Ideas
      fetchRecipes(ingredientName, message);
    })
    .catch((error) => {
      console.error("Error:", error);
      addMessage("Error fetching pairings. Please try again.", "bot");
    });
}

// Fetch Recipes for the Ingredient
function fetchRecipes(ingredientName, existingMessage) {
  const recipeUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientName}&number=3&apiKey=${apiKey}`;

  fetch(recipeUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }
      return response.json();
    })
    .then((recipes) => {
      let message = `🍽️Results for "${ingredientName}"<br><br>`;

      if (recipes.length > 0) {
        message += `👨‍🍳 Try these Recipes:<br><br>`;
        recipes.forEach((recipe) => {
          // Add each recipe as a clickable link with a line break after each
          message += `- 🔗 <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">${recipe.title}</a><br>`;
        });
      } else {
        message += `😞 No recipes found for "${ingredientName}". Try something else! 🤔<br>`;
      }

      addMessage(message, "bot");
    })
    .catch((error) => {
      console.error("Error:", error);
      addMessage(existingMessage, "bot");
    });
}

// Add messages to chatbox
function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = sender === "bot" ? "bot-message" : "user-message";
  messageDiv.innerHTML = text;  // Use innerHTML to render HTML properly
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

