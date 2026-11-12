---
name: ShareO
description: File handoffs recorded in forest ink on warm stock.
colors:
  forest-ink: "#18382f"
  forest-deep: "#10281f"
  forest-soft: "#315447"
  warm-stock: "#f0eadc"
  light-stock: "#fbf8ef"
  primary-ink: "#1d2b24"
  muted-ink: "#596c60"
  rule-line: "#c6c2b2"
  vermilion: "#bd4934"
  sage-mark: "#a4b39b"
  error-ink: "#9c392b"
  success-ink: "#2e624b"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(4.5rem, 8.2vw, 7.4rem)"
    fontWeight: 600
    lineHeight: 0.8
    letterSpacing: "-0.04em"
  body:
    fontFamily: "DM Sans, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "DM Sans, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  square: "0px"
components:
  button-primary:
    backgroundColor: "{colors.forest-ink}"
    textColor: "{colors.light-stock}"
    rounded: "{rounded.square}"
    padding: "12px 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.forest-deep}"
  button-secondary:
    backgroundColor: "{colors.warm-stock}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.square}"
    padding: "12px 18px"
    height: "48px"
  input-field:
    backgroundColor: "{colors.light-stock}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.square}"
    padding: "11px 13px"
    height: "46px"
  navigation:
    backgroundColor: "{colors.forest-ink}"
    textColor: "{colors.light-stock}"
    typography: "{typography.label}"
    height: "72px"
---

# Design System: ShareO

## Overview

**Creative North Star: "Circulation Ledger"**

ShareO treats a file handoff as a temporary record. Warm stock sets the page; forest ink organizes the action, vermilion marks time-sensitive states, and sage provides quiet indexing. Ruled fields, factual metadata, and a single stamp-like completion cue give the interface its character without relying on decorative texture or a graphic logo.

Condensed Barlow carries display headlines while DM Sans keeps instructions and controls readable. Surfaces stay square and paper-toned; depth comes from thin rules and a soft, offset shadow on task sheets rather than glass, gradients, or nested cards.

**Key Characteristics:**
- Forest framing with warm stock surfaces.
- Vermilion used as a sparse state mark; sage used for quiet navigation cues.
- Condensed display lettering paired with humanist interface text.
- Square controls, ruled metadata, and tabular numerals.
- ShareO is set as text; there is no graphic logo.

## Colors

The palette gives structure to forest ink, leaves most of the canvas warm and quiet, and reserves brighter marks for time or state.

### Primary
- **Forest Ink** (`{colors.forest-ink}`): Main headings, primary actions, and structural rules.
- **Deep Forest** (`{colors.forest-deep}`): The strongest display text and pressed or emphasized action states.
- **Soft Forest** (`{colors.forest-soft}`): Supporting marks, secondary status text, and drawn interface icons.

### Secondary
- **Vermilion** (`{colors.vermilion}`): Expiry stamps, errors, and restrained active details.
- **Sage Mark** (`{colors.sage-mark}`): Current-page rules and quiet state accents.

### Neutral
- **Warm Stock** (`{colors.warm-stock}`): The page ground.
- **Light Stock** (`{colors.light-stock}`): Form and download sheets.
- **Primary Ink** (`{colors.primary-ink}`): Body copy on light surfaces.
- **Muted Ink** (`{colors.muted-ink}`): Supporting copy and metadata.
- **Rule Line** (`{colors.rule-line}`): Ledger dividers and field borders.
- **Error Ink** (`{colors.error-ink}`): Recoverable and blocking errors.
- **Success Ink** (`{colors.success-ink}`): Completed actions and success states.

### Named Rules
**The Stamp Scarcity Rule.** Keep vermilion for expiry, errors, and a few active details; forest remains the primary action color.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** DM Sans (with Segoe UI and sans-serif fallbacks)  
**Label/Mono Font:** Labels use DM Sans; measurements use tabular numerals rather than a separate mono face.

**Character:** Condensed headlines give the page a decisive, printed voice. DM Sans keeps form instructions and metadata calm and familiar.

### Hierarchy
- **Display** (600, `clamp(4.5rem, 8.2vw, 7.4rem)`, 0.8 line-height): Homepage headline.
- **Headline** (600, `clamp(42px, 5vw, 64px)`, 0.95 line-height): Documentation and account-page titles.
- **Title** (600, 27-36px, 1 line-height): Form sheets, sections, and record headings.
- **Body** (400, 13-18px, 1.55-1.8 line-height): Instructions and explanatory text; keep longer reading copy near 68ch.
- **Label** (700, 9-11px, 0.1em tracking, uppercase): Limits, expiry, field labels, and ledger metadata.

**The Measurement Rule.** Use tabular numerals for limits, progress, and expiry values; keep labels distinct from values without switching to a monospaced costume.

## Layout

The homepage is a two-column handoff desk within a 1320px maximum width: the headline and transfer facts sit beside the complete upload form. At 900px the composition becomes a vertical stack; at 680px navigation, documentation, and account surfaces adopt compact layouts, with a final 380px adjustment for narrow phones.

The main navigation is sticky, 72px tall on wide screens and 64px on narrow screens. Group facts and metadata with thin rules, keep related form controls close, and give the headline and form more surrounding space than their internal labels.

## Elevation & Depth

The system is mostly flat. A soft, offset shadow lifts the primary task sheet from the stock ground; the contact dialog uses a deeper shadow over its scrim. Rules, color, and spacing do most of the separation work.

### Shadow Vocabulary
- **Task sheet** (`0 20px 38px rgba(32, 52, 40, .12)`): Upload and download surfaces.
- **Dialog** (`0 22px 50px rgba(16, 40, 31, .24)`): Contact dialog above its overlay.

**The Soft Depth Rule.** Shadows stay offset and blurred; do not add hard, zero-blur shadows or colored halos.

## Shapes

Controls and sheets use square corners, thin borders, and clear rectangular fields. The expiry stamp is the only intentionally skewed form; its small rotation marks a time-bound state rather than adding general decoration.

## Components

### Buttons
- **Shape:** Square corners (0px radius).
- **Primary:** Forest fill, light-stock text, and compact 48px-high targets; hover deepens the forest and lifts by one pixel.
- **Secondary:** Transparent stock ground with a rule-line border; hover adds a subtle stock tint.
- **Focus / Disabled:** A visible vermilion focus outline; disabled controls use a pale field and forest text instead of fading their label.

### Cards / Containers
- **Corner Style:** Square.
- **Background:** Light stock for focused task sheets; warm stock for the page.
- **Shadow Strategy:** Use the task-sheet shadow only where a surface needs separation.
- **Border:** Thin forest outline with a stronger top rule on primary sheets.
- **Internal Padding:** 24-42px on desktop, tightened to 17-21px on compact screens.

### Inputs / Fields
- **Style:** Square, 46px minimum height, light-stock fill, and a rule-line border.
- **Focus:** Forest border plus the shared visible focus outline.
- **Error / Disabled:** Errors use error ink; disabled fields remain readable and clearly inactive.

### Navigation
- **Style:** Sticky forest bar with text-only ShareO, uppercase DM Sans links, and a sage active-page rule.
- **Mobile:** Keep the same links in a tighter, right-aligned row; reduce the bar height rather than hiding the guest or account path.

### Transfer Sheet
- **Structure:** File intake first, optional password second, upload action last; limit and expiry facts stay nearby.
- **States:** Show upload progress, explicit errors, and a share-link result with filename, size, and expiry.
- **Signature:** Reveal one restrained vermilion due stamp when the share link is ready.

### File Register
- **Structure:** Present each file as a ruled record with actions, expiry, and password status; avoid nested cards.
- **States:** Expired records remain visible but muted, and active records retain clear open and copy actions.

## Do's and Don'ts

### Do:
- **Do** keep ShareO as text and do not add a graphic logo.
- **Do** use the forest action color, warm stock ground, and sparse vermilion state marks.
- **Do** keep file limits, expiry, and optional password facts explicit near the handoff form.
- **Do** keep controls square and make keyboard focus visible.

### Don't:
- **Don't** use gradients, glass effects, or decorative texture to imitate paper.
- **Don't** use emoji or Unicode glyphs as interface icons; use the existing authored SVG style.
- **Don't** add repeated stamp animations; the link-ready state owns the single stamp reveal.
- **Don't** imply privacy or security guarantees beyond the implemented product behavior.
