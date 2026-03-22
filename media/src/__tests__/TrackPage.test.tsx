import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import TrackPage from "@/app/(with-header)/track/[id]/page";
import { trackService } from "@/services";
import { notFound } from "next/navigation";
import { ITrack } from "@/types/track.types";

jest.mock("@/services", () => ({
  trackService: {
    getById: jest.fn(),
    getRelated: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/components/Track/TrackPlayer", () => {
  function DummyTrackPlayer({ track }: { track: ITrack }) {
    return <div data-testid="track-player">{track.title}</div>;
  }
  DummyTrackPlayer.displayName = "DummyTrackPlayer";
  return DummyTrackPlayer;
});

jest.mock("@/components/Track/TrackActions", () => {
  function DummyTrackActions({ track }: { track: ITrack }) {
    return <div data-testid="track-actions">{track.id}</div>;
  }
  DummyTrackActions.displayName = "DummyTrackActions";
  return DummyTrackActions;
});

jest.mock("@/components/Track/RelatedTracks", () => {
  function DummyRelatedTracks({ tracks }: { tracks: ITrack[] }) {
    return <div data-testid="related-tracks">{tracks.length}</div>;
  }
  DummyRelatedTracks.displayName = "DummyRelatedTracks";
  return DummyRelatedTracks;
});

const mockedTrackService = trackService as jest.Mocked<typeof trackService>;
const mockedNotFound = notFound as jest.MockedFunction<typeof notFound>;

const track: ITrack = {
  id: "123",
  title: "Test Track",
  artist: "Test Artist",
  albumArt: "https://example.com/cover.jpg",
  url: "https://example.com/test.mp3",
  duration: 180,
  likes: 100,
  plays: 1000,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("TrackPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNotFound.mockImplementation(() => null as never);
  });

  it("fetches track and related tracks using route id", async () => {
    mockedTrackService.getById.mockResolvedValue(track);
    mockedTrackService.getRelated.mockResolvedValue([]);

    await TrackPage({ params: Promise.resolve({ id: "123" }) });

    expect(mockedTrackService.getById).toHaveBeenCalledWith("123");
    expect(mockedTrackService.getRelated).toHaveBeenCalledWith("123");
  });

  it("renders child sections when data fetch succeeds", async () => {
    mockedTrackService.getById.mockResolvedValue(track);
    mockedTrackService.getRelated.mockResolvedValue([track]);

    const page = await TrackPage({ params: Promise.resolve({ id: "123" }) });
    render(page);

    expect(screen.getByTestId("track-player")).toHaveTextContent("Test Track");
    expect(screen.getByTestId("track-actions")).toHaveTextContent("123");
    expect(screen.getByTestId("related-tracks")).toHaveTextContent("1");
  });

  it("calls notFound when track does not exist", async () => {
    mockedTrackService.getById.mockResolvedValue(null as unknown as ITrack);
    mockedTrackService.getRelated.mockResolvedValue([]);

    await TrackPage({ params: Promise.resolve({ id: "missing" }) });

    expect(mockedNotFound).toHaveBeenCalled();
  });

  it("calls notFound when service throws", async () => {
    mockedTrackService.getById.mockRejectedValue(new Error("network"));

    await TrackPage({ params: Promise.resolve({ id: "123" }) });

    expect(mockedNotFound).toHaveBeenCalled();
  });
});
