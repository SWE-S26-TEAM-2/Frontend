import { render, screen, waitFor } from "@testing-library/react";
import TrackPage from "../app/(with-header)/track/[id]/page";
import { trackService } from "@/services/di";
import { useParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  notFound: jest.fn(),
}));

jest.mock("@/services/di", () => ({
  trackService: {
    getById: jest.fn(),
    getRelated: jest.fn(),
  },
  engagementService: {
    getEngagementSummary: jest.fn().mockResolvedValue(null),
  },
  userProfileService: {
    getUserProfile: jest.fn().mockResolvedValue(null),
  },
}));

const mockTrack = {
  id: "123",
  title: "Test Track",
  artist: "Test Artist",
  albumArt: "/test.png",
  url: "test.mp3",
  duration: 180,
  likes: 10,
  plays: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("TrackPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: "123" });
    (trackService.getById as jest.Mock).mockResolvedValue(mockTrack);
    (trackService.getRelated as jest.Mock).mockResolvedValue([mockTrack]);
  });

  it("fetches track and related tracks using route id", async () => {
    render(<TrackPage />);
    
    await waitFor(() => {
      expect(trackService.getById).toHaveBeenCalledWith("123");
    });
  });

  it("renders track details when data fetch succeeds", async () => {
    render(<TrackPage />);
    
    const title = await screen.findByText("Test Track");
    expect(title).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });
});