export const UPLOAD_SELECTORS = {
  PAGE_HEADING: 'h1:has-text("Upload your audio files.")',
  DROPZONE:
    '[role="button"][aria-label="Drag and drop audio files or click to choose files"]',
  FILE_INPUT: 'input[type="file"]',
  TRACK_INFO_HEADING: 'text=Track Info',
  TITLE_INPUT: 'input[placeholder="Track title"]',
  ARTIST_INPUT: 'input[placeholder="Artist name"]',
  GENRE_SELECT: 'select',
  TAGS_INPUT: 'input[placeholder="Add styles, moods, tempo."]',
  DESCRIPTION_INPUT:
    'textarea[placeholder="Tracks with descriptions tend to get more plays and engagements."]',
  UPLOAD_BUTTON: 'button:has-text("Upload")',
  TITLE_REQUIRED_ERROR: 'text=Track title is required.',
  SUCCESS_HEADING: 'h1:has-text("Saved to SoundCloud.")',
  SUCCESS_CTA: 'button:has-text("View track")',
  SUCCESS_TEXT: 'text=Congratulations! Your tracks are now on SoundCloud.',
} as const;
