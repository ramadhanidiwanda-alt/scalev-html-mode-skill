# Landing Patterns

Recommended simple landing structure:

1. Hero: clear promise, audience, primary CTA, product mockup.
2. Problem: short pain points.
3. Solution: how product helps.
4. Contents: cards for bundle/course/worksheet/poster/ebook.
5. Benefits: practical outcomes without overclaiming.
6. Fit: who product is for and not for.
7. Testimonials: screenshots or quote cards.
8. Offer: price, bonuses, CTA.
9. FAQ: place below offer if purchase objections are main concern.
10. Disclaimer: not medical therapy; consult professional when needed.

Mobile hero order for simple conversion:

1. Eyebrow/trust line
2. Headline
3. Short subheadline
4. CTA/price clue
5. Product mockup
6. Proof strip

Avoid placing mockup above headline on mobile unless visual recognition is stronger than copy.

## Preview Grid Responsive Rule

For product preview screenshots, especially PDF pages with readable text, use one column on mobile. Two columns below tablet width make page previews too narrow and reduce trust.

Recommended pattern:

```css
.preview-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }

@media (min-width: 720px) {
  .preview-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 900px) {
  .preview-grid { grid-template-columns: repeat(4, 1fr); }
}
```

If a sticky bottom CTA is present on mobile, avoid adding a second sticky top CTA unless the user explicitly requests it. Duplicate sticky CTAs reduce usable vertical space on small screens.
