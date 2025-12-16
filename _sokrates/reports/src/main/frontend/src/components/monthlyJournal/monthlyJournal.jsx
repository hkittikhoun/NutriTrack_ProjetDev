import "./MonthlyJournal.css";

export default function MonthlyJournal() {
  return (
    <section>
      <h1>Monthly Journal: October</h1>
      <article style={{ marginBottom: "2rem" }}>
        <h2>Nutrition Tip: Embrace Fall Flavors</h2>
        <p>
          October brings cooler weather and harvest season! It&apos;s time to
          incorporate warming, nutrient-rich foods. Focus on seasonal vegetables
          like pumpkin, sweet potatoes, Brussels sprouts, and mushrooms. These
          are packed with vitamins A and C, perfect for boosting your immune
          system as winter approaches. Don&apos;t forget to add warming spices
          like cinnamon, ginger, and nutmeg to your meals!
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
            href="https://www.salutbonjour.ca/cuisine/recettes/puree-de-citrouille-facile-et-rapide"
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0 }}
          >
            <img
              srcSet="https://m1.quebecormedia.com/emp/emp/recette_puree_citrouille43a0fbff-2c57-41d9-83ae-d6d2884ba402_ORIGINAL.jpg?impolicy=crop-resize&x=0&y=0&w=0&h=0&width=480 1x, https://m1.quebecormedia.com/emp/emp/recette_puree_citrouille43a0fbff-2c57-41d9-83ae-d6d2884ba402_ORIGINAL.jpg?impolicy=crop-resize&x=0&y=0&w=0&h=0&width=960 2x"
              src="https://m1.quebecormedia.com/emp/emp/recette_puree_citrouille43a0fbff-2c57-41d9-83ae-d6d2884ba402_ORIGINAL.jpg?impolicy=crop-resize&x=0&y=0&w=0&h=0&width=925"
              alt="Easy and quick homemade pumpkin puree"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(176,0,32,0.10)",
              }}
            />
          </a>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h2 style={{ marginTop: 0 }}>
              Easy and Quick Homemade Pumpkin Puree
            </h2>
            <p style={{ color: "#666", fontSize: "0.95rem" }}>
              Perfect for pies or as a base for soups, this pumpkin puree recipe
              is as easy as it is quick to prepare. An essential fall recipe to
              use however you like!
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Prep time:</strong> 25 min | <strong>Cook time:</strong> 2h
        </div>

        <h3 style={{ color: "#b00020", marginTop: "1.5rem" }}>Ingredients</h3>
        <ul>
          <li>2 pumpkins, 3.5 lbs (1.75 kg) each</li>
          <li>Canola oil for cooking</li>
        </ul>

        <h3 style={{ color: "#b00020", marginTop: "1.5rem" }}>Preparation</h3>
        <ol style={{ lineHeight: "1.8" }}>
          <li>Preheat oven to 300°F (150°C).</li>
          <li>Cut around the stem. Remove and discard the flesh.</li>
          <li>Cut the pumpkins into six or eight equal sections.</li>
          <li>
            Remove the inner flesh. Reserve the seeds to roast them, if desired.
          </li>
          <li>
            Cut the pumpkin quarters in the middle to obtain triangular pieces
            of identical size.
          </li>
          <li>
            Place the pumpkin pieces in a baking dish. Drizzle with a little oil
            and bake in the center of the oven for 2 hours or until a knife tip
            inserted into the flesh comes out easily.
          </li>
          <li>
            After 2 hours of cooking, the pumpkin will be soft and have a
            beautiful orange color.
          </li>
          <li>Cut the ends of each piece of pumpkin. Detach the flesh.</li>
          <li>
            Cut into quarters and place in a large bowl. The pumpkin flesh will
            be tender and easy to cut.
          </li>
          <li>Using a hand mixer or food processor, puree until smooth.</li>
          <li>Season to taste and follow the desired recipe.</li>
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
          <strong>Good to know:</strong> Use this puree in your fall pumpkin
          latte, cookie, pie and muffin recipes.
        </div>

        <p style={{ fontSize: "0.95rem", color: "#888", marginTop: "1.5rem" }}>
          Source:{" "}
          <a
            href="https://www.salutbonjour.ca/cuisine/recettes/puree-de-citrouille-facile-et-rapide"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#b00020" }}
          >
            salutbonjour.ca
          </a>
        </p>
      </article>
    </section>
  );
}
