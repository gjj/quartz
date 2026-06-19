import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
import { classNames } from "../util/lang";
// @ts-expect-error - inline script import handled by Quartz bundler
import shareNoteScript from "./scripts/sharenote.inline.ts";
import styles from "./styles/sharenote.scss";
import { readFileSync } from "fs";

export interface ShareNoteOptions {
  // The render endpoint that accepts { markdown } and returns { url }.
  endpoint: string;
}

const defaultOptions: ShareNoteOptions = {
  endpoint: "https://notes.jjgoi.cloud/api/render",
};

export default ((userOpts?: Partial<ShareNoteOptions>) => {
  const opts = { ...defaultOptions, ...userOpts };

  const ShareNote: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    // Read the original markdown source at build time. fileData.filePath is the
    // on-disk path set by the content globber (processors/parse.ts).
    let raw = "";
    const fp = (fileData as { filePath?: string }).filePath;
    if (fp) {
      try {
        raw = readFileSync(fp, "utf8");
      } catch {
        raw = "";
      }
    }

    // Synthetic pages (404, folder/tag listings) have no source file: render nothing.
    if (!raw) {
      return null;
    }

    // base64-encode so arbitrary markdown survives as an HTML attribute value.
    const encoded = Buffer.from(raw, "utf8").toString("base64");

    return (
      <button
        class={classNames(displayClass, "share-note")}
        data-markdown={encoded}
        data-endpoint={opts.endpoint}
        aria-label="Publish a public share link"
        title="Publish a public share link"
      >
        <span class="share-note-label">Share</span>
      </button>
    );
  };

  ShareNote.afterDOMLoaded = shareNoteScript;
  ShareNote.css = styles;

  return ShareNote;
}) satisfies QuartzComponentConstructor;
