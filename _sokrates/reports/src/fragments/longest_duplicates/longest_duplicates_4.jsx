frontend/src/components/mealPlan/SavedPlanDetails.jsx [335:346]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              <div className="action-buttons">
                {isOwner() && (
                  <button onClick={startEdit} className="edit-btn">
                    Edit
                  </button>
                )}
                <button onClick={() => navigate(-1)} className="back-btn">
                  Back
                </button>
              </div>
            </>
          ) : (
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/recipe/SavedRecipeDetails.jsx [430:441]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          <div className="action-buttons">
            {isOwner() && (
              <button onClick={startEdit} className="edit-btn">
                Edit
              </button>
            )}
            <button onClick={() => navigate(-1)} className="back-btn">
              Back
            </button>
          </div>
        </div>
      ) : (
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



