import { useState } from "react";
import "./CaloriesCalculator.css";

export default function CaloriesCalculator() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const calculateCalories = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.age ||
      !formData.gender ||
      !formData.weight ||
      !formData.height ||
      !formData.activityLevel
    ) {
      setError("Please fill in all fields");
      return;
    }

    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (age < 1 || age > 120) {
      setError("Age must be between 1 and 120 years");
      return;
    }

    if (weight < 20 || weight > 300) {
      setError("Weight must be between 20 and 300 kg");
      return;
    }

    if (height < 100 || height > 250) {
      setError("Height must be between 100 and 250 cm");
      return;
    }

    // Calcul du métabolisme de base (BMR) avec la formule de Mifflin-St Jeor
    let bmr;
    if (formData.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Facteurs d'activité
    const activityFactors = {
      sedentary: 1.2, // Sédentaire (peu ou pas d'exercice)
      light: 1.375, // Activité légère (exercice léger 1-3 jours/semaine)
      moderate: 1.55, // Activité modérée (exercice modéré 3-5 jours/semaine)
      active: 1.725, // Actif (exercice intense 6-7 jours/semaine)
      veryActive: 1.9, // Très actif (exercice très intense, travail physique)
    };

    // Calcul des calories totales
    const totalCalories = Math.round(
      bmr * activityFactors[formData.activityLevel]
    );

    setResult({
      bmr: Math.round(bmr),
      totalCalories: totalCalories,
      weightLoss: Math.round(totalCalories - 500), // -500 cal pour perdre ~0.5kg/semaine
      weightGain: Math.round(totalCalories + 500), // +500 cal pour prendre ~0.5kg/semaine
    });
  };

  const resetForm = () => {
    setFormData({
      age: "",
      gender: "",
      weight: "",
      height: "",
      activityLevel: "",
    });
    setResult(null);
    setError("");
  };

  return (
    <div className="calculator-container">
      <h1>Calories Calculator</h1>
      <p className="calculator-description">
        Calculate your daily caloric needs based on your profile and activity
        level
      </p>

      <form onSubmit={calculateCalories} className="calculator-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age (years)</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="1"
              max="120"
              placeholder="Ex: 25"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">-- Choose --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="20"
              max="300"
              step="0.1"
              placeholder="Ex: 70.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              min="100"
              max="250"
              placeholder="Ex: 175"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="activityLevel">Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleInputChange}
          >
            <option value="">-- Choose your activity level --</option>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (light exercise 1-3 days/week)</option>
            <option value="moderate">
              Moderate (moderate exercise 3-5 days/week)
            </option>
            <option value="active">
              Active (intense exercise 6-7 days/week)
            </option>
            <option value="veryActive">
              Very Active (very intense exercise, physical work)
            </option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="calculate-btn">
            Calculate
          </button>
          <button type="button" onClick={resetForm} className="reset-btn">
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="results-container">
          <h2>Your Results</h2>
          <div className="results-grid">
            <div className="result-card primary">
              <h3>Basal Metabolic Rate (BMR)</h3>
              <p className="result-value">{result.bmr} cal/day</p>
              <p className="result-description">Calories burned at rest</p>
            </div>

            <div className="result-card maintenance">
              <h3>Maintenance Calories</h3>
              <p className="result-value">{result.totalCalories} cal/day</p>
              <p className="result-description">
                To maintain your current weight
              </p>
            </div>

            <div className="result-card loss">
              <h3>Weight Loss</h3>
              <p className="result-value">{result.weightLoss} cal/day</p>
              <p className="result-description">To lose ~0.5kg per week</p>
            </div>

            <div className="result-card gain">
              <h3>Weight Gain</h3>
              <p className="result-value">{result.weightGain} cal/day</p>
              <p className="result-description">To gain ~0.5kg per week</p>
            </div>
          </div>

          <div className="disclaimer">
            <p>
              <strong>Important:</strong> These calculations are estimates based
              on formulas by Mifflin-St Jeor. Consult a healthcare professional
              for personalized advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
