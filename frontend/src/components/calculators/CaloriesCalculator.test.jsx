import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CaloriesCalculator from "./CaloriesCalculator";

const fillForm = async ({
  age = "30",
  gender = "male",
  weight = "70",
  height = "175",
  activityLevel = "moderate",
} = {}) => {
  const user = userEvent.setup();
  if (age !== undefined) await user.type(screen.getByLabelText(/age/i), age);
  if (gender !== undefined)
    await user.selectOptions(screen.getByLabelText(/gender/i), gender);
  if (weight !== undefined)
    await user.type(screen.getByLabelText(/weight/i), weight);
  if (height !== undefined)
    await user.type(screen.getByLabelText(/height/i), height);
  if (activityLevel !== undefined)
    await user.selectOptions(
      screen.getByLabelText(/activity level/i),
      activityLevel
    );
  return user;
};

describe("CaloriesCalculator", () => {
  beforeEach(() => {
    render(<CaloriesCalculator />);
  });

  it("renders form fields", () => {
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/activity level/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculate/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("shows validation error when fields are missing", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /calculate/i }));
    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
  });

  it("validates age, weight, and height ranges", async () => {
    const user = userEvent.setup();

    // Age too low
    await user.type(screen.getByLabelText(/age/i), "0");
    await user.selectOptions(screen.getByLabelText(/gender/i), "male");
    await user.type(screen.getByLabelText(/weight/i), "70");
    await user.type(screen.getByLabelText(/height/i), "175");
    await user.selectOptions(
      screen.getByLabelText(/activity level/i),
      "moderate"
    );
    await user.click(screen.getByRole("button", { name: /calculate/i }));
    await waitFor(() => {
      expect(screen.queryByText(/your results/i)).not.toBeInTheDocument();
    });

    // Weight too low
    await user.clear(screen.getByLabelText(/age/i));
    await user.type(screen.getByLabelText(/age/i), "25");
    await user.clear(screen.getByLabelText(/weight/i));
    await user.type(screen.getByLabelText(/weight/i), "10");
    await user.click(screen.getByRole("button", { name: /calculate/i }));
    await waitFor(() => {
      expect(screen.queryByText(/your results/i)).not.toBeInTheDocument();
    });

    // Height too high
    await user.clear(screen.getByLabelText(/weight/i));
    await user.type(screen.getByLabelText(/weight/i), "80");
    await user.clear(screen.getByLabelText(/height/i));
    await user.type(screen.getByLabelText(/height/i), "300");
    await user.click(screen.getByRole("button", { name: /calculate/i }));
    await waitFor(() => {
      expect(screen.queryByText(/your results/i)).not.toBeInTheDocument();
    });
  });

  it("calculates results for a valid male profile", async () => {
    await fillForm({
      age: "30",
      gender: "male",
      weight: "70",
      height: "175",
      activityLevel: "moderate",
    });

    await userEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/your results/i)).toBeInTheDocument();
      expect(screen.getByText(/1649 cal\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/2556 cal\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/2056 cal\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/3056 cal\/day/i)).toBeInTheDocument();
    });
  });

  it("calculates results for a valid female profile", async () => {
    await fillForm({
      age: "28",
      gender: "female",
      weight: "60",
      height: "165",
      activityLevel: "light",
    });

    await userEvent.click(screen.getByRole("button", { name: /calculate/i }));

    // Female BMR: 10*60 + 6.25*165 - 5*28 - 161 = 1330.25 -> 1330
    // Activity light (1.375): 1828
    await waitFor(() => {
      expect(screen.getByText(/1330 cal\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/1829 cal\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/1329 cal\/day/i)).toBeInTheDocument();
      expect(screen.getByText(/2329 cal\/day/i)).toBeInTheDocument();
    });
  });

  it("clears error when typing after validation", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /calculate/i }));
    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/age/i), "25");
    expect(
      screen.queryByText(/please fill in all fields/i)
    ).not.toBeInTheDocument();
  });

  it("resets form and clears results", async () => {
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/your results/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.queryByText(/your results/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toHaveValue(null);
    expect(screen.getByLabelText(/gender/i)).toHaveValue("");
    expect(screen.getByLabelText(/weight/i)).toHaveValue(null);
    expect(screen.getByLabelText(/height/i)).toHaveValue(null);
    expect(screen.getByLabelText(/activity level/i)).toHaveValue("");
  });
});
