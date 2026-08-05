# PokoLoko — Typed IPC Protocol

## Principles

- Narrow payloads.
- Explicit direction.
- Runtime validation at process boundaries.
- No generic `send("pet-state", any)`.
- No renderer access to Node or Electron objects.
- No private-content payloads.
- High-frequency position updates stay in the main process where possible.

## Renderer → main commands

```ts
type RendererCommand =
  | { type: "renderer.ready"; windowId: string }
  | { type: "interaction.pointer"; phase: "hover_start" | "hover_end" | "click" | "double_click"; point: Point }
  | { type: "interaction.drag_start"; pointerScreen: Point; hitRegionId: string }
  | { type: "interaction.drag_move"; pointerScreen: Point; dragSessionId: string }
  | { type: "interaction.drag_end"; pointerScreen: Point; dragSessionId: string }
  | { type: "settings.update"; patch: SettingsPatch; requestId: string }
  | { type: "character.change"; character: CharacterId; requestId: string }
  | { type: "pet.pause"; requestId: string }
  | { type: "pet.resume"; requestId: string }
  | { type: "diagnostics.command"; command: DiagnosticCommand };
```

Renderer pointer messages include position only. No key value or typed content is transmitted.

## Main → renderer messages

```ts
type MainMessage =
  | { type: "pet.presentation"; value: PetPresentation }
  | { type: "settings.snapshot"; value: PublicSettings }
  | { type: "command.result"; requestId: string; ok: boolean; errorCode?: string }
  | { type: "diagnostics.snapshot"; value: DiagnosticSnapshot }
  | { type: "app.lifecycle"; mode: LifecycleMode };
```

## Internal main-process ports

Domain code depends on interfaces rather than Electron:

```ts
interface WindowPort {
  applyPosition(point: Point): void;
  getCurrentRect(): Rect;
  setInputMode(mode: "interactive" | "pass_through"): void;
}

interface DisplayPort {
  getDisplays(): DisplaySnapshot[];
  getDisplayForPoint(point: Point): DisplaySnapshot;
}

interface PresentationPort {
  publish(value: PetPresentation): void;
}
```

Electron adapters implement these ports.

## Validation

Every incoming message is validated for:
- exact discriminant;
- finite numeric coordinates;
- known IDs;
- size limits;
- legal enum values;
- request ID format.

Invalid payloads receive a typed error and are logged without application crash.

## Drag optimization

`drag_move` is rate-limited/coalesced. The main process applies native movement directly using the active drag session and publishes lower-frequency presentation snapshots. React is not rerendered for every OS movement tick.

## Settings synchronization

1. UI sends a patch with request ID.
2. main validates and persists atomically.
3. domain applies accepted changes.
4. main broadcasts authoritative settings snapshot.
5. tray and settings UI render that snapshot.

## Security

- `contextIsolation: true`;
- sandbox enabled where supported;
- no `nodeIntegration`;
- preload exposes only typed methods;
- allowed channels are enumerated;
- external navigation is denied by default;
- no arbitrary filesystem paths from renderer;
- no raw OS input stream exposed to renderer.

## Versioning

The protocol exports `IPC_PROTOCOL_VERSION`. Renderer and main reject incompatible major versions during readiness handshake and display a recoverable startup error.
