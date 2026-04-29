import { render, screen, fireEvent } from "@testing-library/react";
import Toggle from "@/components/Toggle/Toggle";

describe("Toggle Component", () => {
  it("renders without crashing", () => {
    render(<Toggle value={false} onChange={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with value=false — background should be #444", () => {
    render(<Toggle value={false} onChange={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "#444" });
  });

  it("renders with value=true — background should be #ff5500", () => {
    render(<Toggle value={true} onChange={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "#ff5500" });
  });

  it("calls onChange when clicked", () => {
    const handleChange = jest.fn();
    render(<Toggle value={false} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});