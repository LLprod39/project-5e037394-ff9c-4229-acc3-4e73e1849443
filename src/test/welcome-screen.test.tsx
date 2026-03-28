import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import WelcomeScreen from "@/pages/WelcomeScreen";

describe("WelcomeScreen", () => {
  it("renders the main CTA and navigates to the quiz route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/quiz" element={<div>Quiz route</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: /главная страница центра, где родителю сразу понятно/i,
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^пройти тест$/i }));

    expect(screen.getByText("Quiz route")).toBeInTheDocument();
  });
});
