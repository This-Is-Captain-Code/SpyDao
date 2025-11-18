# SPYDAO Landing Page Design Guidelines

## Design Approach
**Minimal Centered Design** - User explicitly requested "only text in the center" and "nothing more." This guides a brutalist, focused design with maximum restraint.

## Core Design Principles
1. **Extreme Minimalism**: Single-purpose interface with no distractions
2. **Centered Composition**: All elements vertically and horizontally centered
3. **Crypto-Native Aesthetic**: Clean, technical, trustworthy presentation
4. **Functional Focus**: MetaMask connection is the primary interaction

## Layout System

**Spacing**: Use Tailwind units of 4, 6, 8, and 12 for consistent rhythm
- Vertical spacing between elements: space-y-8 to space-y-12
- Container padding: p-8 to p-12

**Viewport**:
- Full viewport height centering: min-h-screen flex items-center justify-center
- Single centered container with max-w-md to max-w-lg

## Typography

**Primary Heading (SPYDAO)**:
- Font: Inter or Space Grotesk (bold, technical feel)
- Size: text-6xl md:text-7xl
- Weight: font-bold
- Letter spacing: tracking-tight

**Tagline/Description** (if needed):
- Font: Same as heading but regular weight
- Size: text-lg md:text-xl
- Weight: font-normal
- Opacity: text-opacity-80 for hierarchy

**Wallet Address Display**:
- Font: Monospace (font-mono)
- Size: text-sm
- Truncate middle with ellipsis (0x1234...5678)

## Component Specifications

**MetaMask Connect Button**:
- Size: px-8 py-4 (generous click target)
- Border radius: rounded-lg
- Font: text-base md:text-lg, font-semibold
- States: Clear visual feedback for hover/disabled states
- Icon: MetaMask fox logo or wallet icon from Heroicons

**Connected State Display**:
- Show truncated wallet address in monospace
- Disconnect button styled as secondary/ghost variant
- Spacing: gap-4 between address and disconnect action

**Loading States**:
- Simple spinner or "Connecting..." text
- Maintain button dimensions during loading

## Visual Hierarchy

1. **SPYDAO Logo/Text** (largest, most prominent)
2. **Brief tagline** (if any - optional, subtle)
3. **Wallet Connection CTA** (bold, actionable)
4. **Connected state info** (informational, lower emphasis)

## Interaction Patterns

- Single primary action: Connect Wallet
- Post-connection: Display address + disconnect option
- Error states: Inline error message below button (text-sm, red accent)
- No wallet detected: Helpful message with MetaMask download link

## Responsive Behavior

**Mobile (base)**:
- Padding: p-6
- Text sizes scale down appropriately
- Maintain centered layout

**Desktop (md+)**:
- Padding: p-12
- Larger typography
- Same centered composition

## Technical Notes

- No background images or complex visual treatments
- Solid background color (handled separately)
- No animations except subtle button hover transitions
- Focus states for keyboard navigation (ring-2 ring-offset-2)

## Icons
Use **Heroicons** via CDN for any wallet/connection icons needed

## Images
**No images required** - Text-only centered design per user specification

This design respects the user's explicit "nothing more" constraint while ensuring the minimal interface is polished and professional.