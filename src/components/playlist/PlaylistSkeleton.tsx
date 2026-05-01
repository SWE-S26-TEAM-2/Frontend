"use client";

import styles from "./PlaylistSkeleton.module.css";

const TRACK_SKELETON_ROWS = 7;

export default function PlaylistSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-live="polite">
      {/* Header skeleton */}
      <div className={styles.skeleton__header}>
        <div className={styles.skeleton__inner}>
          <div className={`${styles.skeleton__cover} ${styles.pulse}`} />

          <div className={styles.skeleton__meta}>
            <div className={`${styles.skeleton__line} ${styles["skeleton__line--label"]} ${styles.pulse}`} />
            <div className={`${styles.skeleton__line} ${styles["skeleton__line--title"]} ${styles.pulse}`} />
            <div className={`${styles.skeleton__line} ${styles["skeleton__line--desc"]} ${styles.pulse}`} />
            <div className={`${styles.skeleton__line} ${styles["skeleton__line--desc"]} ${styles.pulse}`} />
            <div className={`${styles.skeleton__line} ${styles["skeleton__line--sub"]} ${styles.pulse}`} />

            <div className={styles.skeleton__actions}>
              <div className={`${styles.skeleton__btn} ${styles.pulse}`} />
              <div className={`${styles.skeleton__btn} ${styles["skeleton__btn--ghost"]} ${styles.pulse}`} />
              <div className={`${styles.skeleton__btn} ${styles["skeleton__btn--ghost"]} ${styles.pulse}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Track list skeleton */}
      <div className={styles.skeleton__tracklist}>
        {Array.from({ length: TRACK_SKELETON_ROWS }).map((_, i) => (
          <div key={i} className={styles.skeleton__trackRow}>
            <div className={`${styles.skeleton__trackIndex} ${styles.pulse}`} />
            <div className={`${styles.skeleton__trackCover} ${styles.pulse}`} />
            <div className={styles.skeleton__trackInfo}>
              <div className={`${styles.skeleton__line} ${styles["skeleton__line--trackTitle"]} ${styles.pulse}`} />
              <div className={`${styles.skeleton__line} ${styles["skeleton__line--trackArtist"]} ${styles.pulse}`} />
            </div>
            <div className={`${styles.skeleton__trackDuration} ${styles.pulse}`} />
          </div>
        ))}
      </div>

      <span className={styles.srOnly}>Loading playlist content…</span>
    </div>
  );
}
