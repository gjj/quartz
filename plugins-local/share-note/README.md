# @local/share-note

Adds a "Share" button that publishes the current note's markdown to a render
endpoint and copies the resulting public URL to the clipboard.

How it works:

- At build time the component reads each page's raw markdown from disk
  (`fileData.filePath`) and embeds it base64-encoded on the button.
- On click, the inline client script decodes the markdown and POSTs
  `{ markdown }` to the configured endpoint, then copies the returned `url`.

The endpoint must accept `POST { "markdown": string }` and return
`{ "url": string }`, and must allow cross-origin browser requests (CORS).

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: ./plugins-local/share-note
    enabled: true
    options:
      endpoint: https://notes.jjgoi.cloud/api/render
    layout:
      position: right
      priority: 5
```

## Configuration

| Option   | Default                              | Description                         |
| -------- | ------------------------------------ | ----------------------------------- |
| endpoint | https://notes.jjgoi.cloud/api/render | POST target that returns `{ url }`. |

## License

MIT
