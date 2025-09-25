import "./MonthlyJournal.css";

export default function MonthlyJournal() {
  return (
    <section>
      <h1>Monthly Journal: September</h1>
      <article style={{ marginBottom: "2rem" }}>
        <h2>Nutrition Tip: Starting the School Year Right</h2>
        <p>
          September marks the back-to-school season! It's the perfect time to
          get back into good eating habits. Prioritize seasonal fruits and
          vegetables like apples, pears, carrots, and squash. Remember to stay
          well-hydrated and plan your meals to maintain your rhythm.
        </p>
      </article>

      <article>
        <h2>Healthy Recipe: Homemade Apple and Pear Compote</h2>
        <a
          href="https://www.mesrecettesfaciles.fr/recipe/compote-de-pommes-et-poires-maison?diaporama=9526"
          target="_blank"
          rel="noopener noreferrer"
        >
          <picture>
            <source
              type="image/webp"
              srcSet="https://img.mesrecettesfaciles.fr/2025-01/compote-de-pommes-et-poires-maison-t6s-1200.webp"
              media="(min-width: 769px)"
            />
            <source
              type="image/webp"
              srcSet="https://img.mesrecettesfaciles.fr/2025-01/compote-de-pommes-et-poires-maison-t6s-800.webp"
              media="(min-width: 480px) and (max-width: 768px)"
            />
            <source
              type="image/webp"
              srcSet="https://img.mesrecettesfaciles.fr/2025-01/compote-de-pommes-et-poires-maison-t6s-400.webp"
              media="(max-width: 479px)"
            />
            <img
              src="https://img.mesrecettesfaciles.fr/2025-01/compote-de-pommes-et-poires-maison-t6s-800.webp"
              alt="Homemade apple and pear compote"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "10px",
                margin: "1rem auto",
                display: "block",
                boxShadow: "0 2px 8px rgba(176,0,32,0.10)",
              }}
            />
          </picture>
        </a>
        <ul>
          <li>4 apples</li>
          <li>4 pears</li>
          <li>1 packet of vanilla sugar</li>
          <li>1 tablespoon of lemon juice</li>
          <li>1 to 2 tablespoons of water</li>
        </ul>
        <p>
          Peel and cut the apples and pears into small pieces. Place them in a
          saucepan with the vanilla sugar, lemon juice, and water. Cook over low
          heat for 20 to 25 minutes, stirring occasionally, until the fruits are
          tender. Blend or mash according to desired texture. Let cool before
          enjoying!
        </p>
        <p style={{ fontSize: "0.95rem", color: "#888" }}>
          Source:{" "}
          <a
            href="https://www.mesrecettesfaciles.fr/recipe/compote-de-pommes-et-poires-maison?diaporama=9526"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#b00020" }}
          >
            mesrecettesfaciles.fr
          </a>
        </p>
      </article>
    </section>
  );
}
