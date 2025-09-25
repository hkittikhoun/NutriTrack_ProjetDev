import "./FoodCard.css";

export default function FoodCard({ food }) {
  const { FoodDescription, nutrients } = food;

  return (
    <div className="food-card">
      <h3 className="food-title">{FoodDescription}</h3>
      <div className="nutrients">
        {nutrients && nutrients.length > 0 ? (
          nutrients.map((nutrient, index) => (
            <div key={index} className="nutrient">
              <span className="nutrient-symbol">{nutrient.NutrientSymbol}</span>
              <span className="nutrient-value">
                {nutrient.NutrientValue} {nutrient.NutrientUnit}
              </span>
            </div>
          ))
        ) : (
          <div className="nutrient">
            <span className="nutrient-symbol">N/A</span>
            <span className="nutrient-value">No data</span>
          </div>
        )}
      </div>
    </div>
  );
}
