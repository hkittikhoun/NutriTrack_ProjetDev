import "./MonthlyJournal.css";

export default function MonthlyJournal() {
  return (
    <section>
      <h1>Monthly Journal: December</h1>
      <article style={{ marginBottom: "2rem" }}>
        <h2>Nutrition Tip: Use Your Holiday Leftovers!</h2>
        <p>
          December brings colder nights and the perfect opportunity to use up
          leftover vegetables from your holiday meals. Try this hearty, healthy
          soup for a warming winter dinner!
        </p>
      </article>

      <article>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://www.powershealth.org/newsletter/articles/2025/11/december-recipe"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0 }}
          >
            <img
              srcSet="https://www.powershealth.org/-/media/images/community-healthcare-only/newsletter/2025/garden-harvest-soup-515x275.ashx?h=320&w=600&la=en&hash=ABB77AFE3FED5D048BFBFED0FCAC3A25"
              src="https://www.powershealth.org/-/media/images/community-healthcare-only/newsletter/2025/garden-harvest-soup-515x275.ashx?h=320&w=600&la=en&hash=ABB77AFE3FED5D048BFBFED0FCAC3A25"
              alt="Garden Harvest Soup"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(176,0,32,0.10)",
              }}
            />
          </a>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h2 style={{ marginTop: 0 }}>Garden Harvest Soup</h2>
            <p style={{ color: "#666", fontSize: "0.95rem" }}>
              This American Diabetes Association recipe is great for a cold
              winter night with warm bread. Easy to make using your leftover
              vegetables from a holiday meal!
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Prep time:</strong> ~10 min | <strong>Cook time:</strong> ~25
          min
        </div>

        <h3 style={{ color: "#b00020", marginTop: "1.5rem" }}>Ingredients</h3>
        <ul>
          <li>1 tsp olive oil</li>
          <li>
            2 cups vegetables (uncooked, chopped, e.g. bell peppers, carrots,
            green beans, yellow squash, zucchini)
          </li>
          <li>1/4 cup onion, finely chopped</li>
          <li>1 tsp Italian seasoning blend (crumbled)</li>
          <li>2 cups low-sodium chicken broth (or vegetable broth)</li>
          <li>1 cup fresh spinach leaves (loosely packed, coarsely chopped)</li>
          <li>1 tbsp Parmesan cheese (shredded or grated)</li>
        </ul>

        <h3 style={{ color: "#b00020", marginTop: "1.5rem" }}>Preparation</h3>
        <ol style={{ lineHeight: "1.8" }}>
          <li>
            In a medium saucepan, heat the oil over medium heat, swirling to
            coat the bottom.
          </li>
          <li>
            Cook the 2 cups chopped vegetables, onion, and seasoning blend for 8
            to 10 minutes, or until tender-crisp, stirring occasionally. (If the
            vegetables get dry or start to scorch, add a little water to the
            saucepan.)
          </li>
          <li>
            Stir in the broth. Increase the heat to medium high and bring to a
            boil. Reduce the heat and simmer for 15 minutes so the flavors
            blend, stirring occasionally.
          </li>
          <li>
            Stir in the spinach. Sprinkle each serving with Parmesan cheese.
          </li>
        </ol>

        <div
          style={{
            background: "#fff8f8",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "1.5rem",
            borderLeft: "4px solid #b00020",
          }}
        >
          <strong>Good to know:</strong> Chop firmer vegetables, such as
          carrots, into smaller pieces than more tender vegetables, such as
          zucchini, so all the vegetables will cook at about the same rate. For
          a vegetarian dish, use vegetable broth.
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <strong>
            Nutrition per serving (1 1/4 cups, recipe makes 2 servings):
          </strong>
          <ul>
            <li>Calories: 95</li>
            <li>Total Fat: 3.5g (Saturated Fat: 0.9g)</li>
            <li>Cholesterol: 5mg</li>
            <li>Sodium: 200mg</li>
            <li>
              Total Carbohydrate: 13g (Dietary Fiber: 4g, Total Sugars: 6g)
            </li>
            <li>Protein: 3g</li>
          </ul>
        </div>

        <p style={{ fontSize: "0.95rem", color: "#888", marginTop: "1.5rem" }}>
          Source:{" "}
          <a
            href="https://www.powershealth.org/newsletter/articles/2025/11/december-recipe"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#b00020" }}
          >
            powershealth.org
          </a>
        </p>
      </article>
    </section>
  );
}
