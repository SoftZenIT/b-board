# B-Board Security Threat Model

## Overview

This document outlines the threat model for the B-Board custom keyboard element, focusing on the boundaries between the keyboard engine and the host application's DOM.

## Trust Boundaries

The primary trust boundary lies between the `OperationDispatcher` (trusted internal state) and the `TargetAdapter` (untrusted host DOM).

## Identified Threats (STRIDE)

1. **Spoofing:** (Low Risk) The keyboard does not handle authentication.
2. **Tampering:** (High Risk) Malicious scripts modifying the internal state or the target element directly to bypass validation.
   - _Mitigation:_ `TargetValidator` strictly verifies element state (`readonly`, `disabled`) before _every_ operation.
3. **Repudiation:** (N/A) Logging of keystrokes is explicitly avoided for privacy.
4. **Information Disclosure:** (Medium Risk) Keyloggers intercepting custom events.
   - _Mitigation:_ Event payloads contain only necessary state, avoiding exposing full buffered input histories where possible.
5. **Denial of Service:** (Medium Risk) Rapid, programmatic triggering of insertion events causing UI thread lockup.
   - _Mitigation:_ (Future) Implement rate-limiting on the public API methods.
6. **Elevation of Privilege / DOM Escape (XSS):** (Critical Risk) Untrusted text input being interpreted as executable HTML/JS.
   - _Mitigation:_ Adapters strictly use `setRangeText` or `document.execCommand('insertText')`. Direct `innerHTML` manipulation is strictly prohibited.
