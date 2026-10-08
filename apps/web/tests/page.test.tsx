import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import Home from "../app/page";
import { AppShell } from "../components/shell";
import { Button } from "../components/ui";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(cleanup);
function home() {
  render(
    <AppShell>
      <Home />
    </AppShell>,
  );
}

test("homepage retains honest provenance and links to working preview destinations", () => {
  home();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "One universe. Your own path.",
    }),
  ).toBeVisible();
  expect(screen.getByText(/Curated content remains seed-review/)).toBeVisible();
  expect(
    screen.getByText(/Not affiliated with or endorsed by Microsoft/),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: /Explore the Universe/ }),
  ).toHaveAttribute("href", "/explore");
  expect(screen.getByRole("link", { name: /Find My Path/ })).toHaveAttribute(
    "href",
    "/learn/agent-builder",
  );
});

test("all lenses change authored guidance and status without locking information", () => {
  home();
  fireEvent.click(screen.getByRole("radio", { name: "Builder" }));
  expect(
    screen.getByRole("heading", {
      name: "Connect what you know to what you can build.",
    }),
  ).toBeVisible();
  expect(screen.getByText("Builder lens")).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "Architect" }));
  expect(
    screen.getByRole("heading", {
      name: "See the decisions behind the solution.",
    }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "Explorer" }));
  expect(screen.getByRole("radio", { name: "Explorer" })).toBeChecked();
  expect(
    screen.getByRole("heading", {
      name: "You don’t need to know where to begin.",
    }),
  ).toBeVisible();
});

test("preview window collapses and restores its content", () => {
  home();
  const illustration = screen.getByRole("img", {
    name: /Illustrated learning universe/,
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Hide universe preview" }),
  );
  expect(illustration).not.toBeVisible();
  expect(
    screen.getByRole("button", { name: "Show universe preview" }),
  ).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(
    screen.getByRole("button", { name: "Show universe preview" }),
  );
  expect(illustration).toBeVisible();
});

test("launcher exposes navigation, closes on Escape, and restores focus", () => {
  home();
  const trigger = screen.getByRole("button", { name: /Start exploring/ });
  fireEvent.click(trigger);
  expect(
    screen.getByRole("navigation", { name: "Compass launcher" }),
  ).toBeVisible();
  const destination = screen.getByRole("link", {
    name: /Universe Explorer Step inside/,
  });
  destination.focus();
  fireEvent.keyDown(destination, { key: "Escape" });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(
    screen.queryByRole("navigation", { name: "Compass launcher" }),
  ).not.toBeInTheDocument();
});

test("launcher dismisses on outside pointer and destination activation", () => {
  home();
  const trigger = screen.getByRole("button", { name: /Start exploring/ });
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("link", { name: /Welcome home/ }));
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("reusable button invokes its action", () => {
  const action = vi.fn();
  render(<Button onClick={action}>Choose a direction</Button>);
  fireEvent.click(screen.getByRole("button", { name: "Choose a direction" }));
  expect(action).toHaveBeenCalledOnce();
});
