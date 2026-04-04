import { expect, test, type Page } from '@playwright/test';
import { gotoHome } from '../helpers/navigation';

const UPLOAD_ROUTE = '/creator/upload';

function audioFile(name: string, mimeType: string = 'audio/mpeg') {
  return {
    name,
    mimeType,
    buffer: Buffer.from(`fake-audio-${name}`),
  };
}

async function gotoUpload(page: Page) {
  await page.goto(UPLOAD_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(
    page.getByRole('heading', { name: 'Upload your audio files.' })
  ).toBeVisible();
}

async function selectAudio(page: Page, name: string) {
  await page.locator('input[type="file"]').first().setInputFiles(audioFile(name));
}

async function gotoMetadataStep(page: Page, name: string = 'draft-track.mp3') {
  await gotoUpload(page);
  await selectAudio(page, name);
  await expect(page.getByText('Track Info', { exact: true })).toBeVisible();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

test.describe('@high Upload Negative And Stability', () => {
  test('repeated submit clicks trigger only one upload', async ({ page }) => {
    const uploadCalls: string[] = [];
    page.on('console', (message) => {
      if (message.text().includes('[MOCK] uploadTrack called')) {
        uploadCalls.push(message.text());
      }
    });

    await gotoMetadataStep(page, 'duplicate-guard.mp3');

    const uploadButton = page.getByRole('button', { name: 'Upload', exact: true });
    await Promise.allSettled([
      uploadButton.click(),
      uploadButton.click(),
      uploadButton.click(),
    ]);

    await expect(page.getByRole('button', { name: /\d+%/ })).toBeDisabled();
    await expect(
      page.getByRole('heading', { name: 'Saved to SoundCloud.' })
    ).toBeVisible();
    expect(uploadCalls).toHaveLength(1);
  });

  test('blank title with other metadata filled still blocks submission', async ({
    page,
  }) => {
    await gotoMetadataStep(page, 'needs-title.mp3');

    await page.getByPlaceholder('Track title').fill('   ');
    await page.locator('select').first().selectOption('Electronic');
    await page.getByPlaceholder('Artist name').fill('QA Artist');
    await page.getByPlaceholder('Add styles, moods, tempo.').fill('night, test');
    await page
      .getByPlaceholder(
        'Tracks with descriptions tend to get more plays and engagements.'
      )
      .fill('This description should not bypass the required title.');

    await page.getByRole('button', { name: 'Upload', exact: true }).click();

    await expect(page.getByText('Track title is required.')).toBeVisible();
    await expect(page.getByText('Track Info', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Saved to SoundCloud.' })
    ).toHaveCount(0);
  });

  test('refresh resets unsaved upload metadata back to the select step', async ({
    page,
  }) => {
    await gotoMetadataStep(page, 'refresh-reset.mp3');
    await page.getByPlaceholder('Track title').fill('Edited Before Refresh');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(
      page.getByRole('heading', { name: 'Upload your audio files.' })
    ).toBeVisible();
    await expect(page.getByText('Track Info', { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('button', {
        name: 'Drag and drop audio files or click to choose files',
      })
    ).toBeVisible();
  });

  test('browser back leaves the upload workspace without a client-side trap', async ({
    page,
  }) => {
    await gotoHome(page);
    await gotoUpload(page);
    await selectAudio(page, 'back-nav.mp3');
    await expect(page.getByText('Track Info', { exact: true })).toBeVisible();

    await page.goBack();
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveURL('/');
    await expect(
      page.locator('main').first().getByRole('heading', {
        name: 'SoundCloud',
        exact: true,
      })
    ).toBeVisible();
  });

  test('replacing the selected file swaps metadata to the newly chosen file', async ({
    page,
  }) => {
    await gotoMetadataStep(page, 'first-track.mp3');
    await expect(page.getByPlaceholder('Track title')).toHaveValue('first-track');

    await page.getByRole('button', { name: 'Replace track', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Upload your audio files.' })
    ).toBeVisible();

    await selectAudio(page, 'second-take.wav');
    await expect(page.getByText('second-take.wav', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Track title')).toHaveValue('second-take');
    await expect(page.getByText('first-track.mp3', { exact: true })).toHaveCount(0);
  });

  test('navigating away during upload is allowed and does not block the next page', async ({
    page,
  }) => {
    await gotoMetadataStep(page, 'leave-during-upload.mp3');

    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(page.getByRole('button', { name: /\d+%/ })).toBeDisabled();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveURL('/');
    await expect(
      page.locator('main').first().getByRole('heading', {
        name: 'SoundCloud',
        exact: true,
      })
    ).toBeVisible();
  });

  test('rapid field edits preserve the final values used for submission', async ({
    page,
  }) => {
    await gotoMetadataStep(page, 'rapid-edits.mp3');

    const titleInput = page.getByPlaceholder('Track title');
    const artistInput = page.getByPlaceholder('Artist name');
    const tagsInput = page.getByPlaceholder('Add styles, moods, tempo.');
    const descriptionInput = page.getByPlaceholder(
      'Tracks with descriptions tend to get more plays and engagements.'
    );

    await titleInput.fill('First Draft');
    await titleInput.fill('Second Draft');
    await titleInput.fill('Final Title');
    await artistInput.fill('First Artist');
    await artistInput.fill('Final Artist');
    await tagsInput.fill('rough');
    await tagsInput.fill('final, approved');
    await descriptionInput.fill('temporary copy');
    await descriptionInput.fill('final description before upload');

    await expect(titleInput).toHaveValue('Final Title');
    await expect(artistInput).toHaveValue('Final Artist');
    await expect(tagsInput).toHaveValue('final, approved');
    await expect(descriptionInput).toHaveValue('final description before upload');
    await expect(page.getByText('https://soundcloud.com/user/final-title')).toBeVisible();

    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Saved to SoundCloud.' })
    ).toBeVisible();
  });
});
