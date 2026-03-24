# Glossary

| Term                 | Definition                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **BBOARD**           | BJ-Keyboard — the Jira project key and npm package name (`b-board`)                               |
| **LanguageId**       | BCP 47 language tag string (e.g. `"yo"` for Yoruba, `"fon"` for Fon)                              |
| **KeyId**            | Unique string identifier for a key within a layout (e.g. `"key-a"`, `"key-shift"`)                |
| **Layout**           | A 2D array of key rows describing the physical shape of a keyboard                                |
| **LayoutShape**      | The structure of the keyboard without language-specific labels (rows + key widths)                |
| **LanguageProfile**  | Language-specific key labels, composition rules, and modifier mappings                            |
| **ResolvedLayout**   | A layout shape merged with a language profile — ready to render                                   |
| **CompositionState** | Current state of multi-keystroke input (e.g. mid-tone-cycle, dead key pending)                    |
| **Dead key**         | A key that modifies the next character without producing output itself (e.g. ´ + a = á)           |
| **Tone mark**        | Diacritic indicating pitch in tonal languages (e.g. macron ā, acute á, caron ǎ, grave à)          |
| **Nasal mark**       | Diacritic or suffix indicating nasalization (e.g. ɛ̃, ã)                                           |
| **Tone cycle**       | Rotating through tone variants of a vowel on repeated key press                                   |
| **Adapter**          | Integration layer that connects the keyboard to a host element (input, textarea, contenteditable) |
| **Host target**      | The DOM element that receives keyboard output                                                     |
| **Custom Element**   | Web Component API wrapper for framework-agnostic usage                                            |
| **State machine**    | Formal model of keyboard lifecycle states (uninitialized → loading → ready → error)               |
| **Phase 0**          | Foundation — project scaffolding, build pipeline, CI, documentation                               |
| **Phase 1**          | Data model & core engine — types, loaders, validators, state machine, composition                 |
| **Phase 2**          | UI & rendering — desktop keyboard, mobile keyboard, theme system                                  |
| **Phase 3**          | Quality & release — accessibility, security, testing, npm publish                                 |
| **AZERTY**           | French keyboard layout used as the physical key anchor for BJ-Keyboard                            |
| **Level A**          | Primary (unshifted) character layer of a key                                                      |
| **Level B**          | Shifted character layer                                                                           |
| **Long-press menu**  | Overlay showing alternate characters when a key is held                                           |
