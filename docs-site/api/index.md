**b-board**

---

# b-board

b-board public API — the single entry point for all consumer imports.
Do not import from internal modules directly.

## Example

```ts
import { createKeyboardEngine, DataLayerImpl } from 'b-board';
```

## Classes

- [DataLayerImpl](classes/DataLayerImpl.md)

## Functions

- [createCompositionRule](functions/createCompositionRule.md)
- [createCompositionState](functions/createCompositionState.md)
- [createEngineOperation](functions/createEngineOperation.md)
- [createKeyboardEngine](functions/createKeyboardEngine.md)
- [createKeyEntry](functions/createKeyEntry.md)
- [createKeyId](functions/createKeyId.md)
- [createKeyOutput](functions/createKeyOutput.md)
- [createLanguageProfile](functions/createLanguageProfile.md)
- [createLayoutLayer](functions/createLayoutLayer.md)
- [createLayoutRow](functions/createLayoutRow.md)
- [createLayoutShape](functions/createLayoutShape.md)
- [createLayoutSlot](functions/createLayoutSlot.md)
- [createResolvedKey](functions/createResolvedKey.md)
- [createResolvedLayout](functions/createResolvedLayout.md)
- [createTargetHandle](functions/createTargetHandle.md)
- [isCompositionMode](functions/isCompositionMode.md)
- [isKeyActionType](functions/isKeyActionType.md)
- [isKeyId](functions/isKeyId.md)
- [isLanguageId](functions/isLanguageId.md)
- [isLayerId](functions/isLayerId.md)
- [isLayoutVariantId](functions/isLayoutVariantId.md)
- [isModifierDisplayMode](functions/isModifierDisplayMode.md)
- [isTargetHandle](functions/isTargetHandle.md)
- [isTargetKind](functions/isTargetKind.md)
- [isThemeId](functions/isThemeId.md)

## Interfaces

- [BaseOperation](interfaces/BaseOperation.md)
- [BBoardErrorEventDetail](interfaces/BBoardErrorEventDetail.md)
- [BBoardKeyPressEventDetail](interfaces/BBoardKeyPressEventDetail.md)
- [BBoardLanguageChangeEventDetail](interfaces/BBoardLanguageChangeEventDetail.md)
- [BBoardReadyEventDetail](interfaces/BBoardReadyEventDetail.md)
- [BBoardThemeChangeEventDetail](interfaces/BBoardThemeChangeEventDetail.md)
- [CompositionRule](interfaces/CompositionRule.md)
- [CompositionRulesCatalog](interfaces/CompositionRulesCatalog.md)
- [CompositionState](interfaces/CompositionState.md)
- [CompositionTriggerEntry](interfaces/CompositionTriggerEntry.md)
- [DataLayer](interfaces/DataLayer.md)
- [DeleteOperation](interfaces/DeleteOperation.md)
- [EngineOperation](interfaces/EngineOperation.md)
- [InsertOperation](interfaces/InsertOperation.md)
- [KeyboardEngine](interfaces/KeyboardEngine.md)
- [KeyboardEngineOptions](interfaces/KeyboardEngineOptions.md)
- [KeyCatalogEntry](interfaces/KeyCatalogEntry.md)
- [KeyOutput](interfaces/KeyOutput.md)
- [LanguageProfile](interfaces/LanguageProfile.md)
- [LanguageRegistryEntry](interfaces/LanguageRegistryEntry.md)
- [LayoutLayer](interfaces/LayoutLayer.md)
- [LayoutRegistryEntry](interfaces/LayoutRegistryEntry.md)
- [LayoutRow](interfaces/LayoutRow.md)
- [LayoutShape](interfaces/LayoutShape.md)
- [LayoutSlot](interfaces/LayoutSlot.md)
- [LifecycleEventMap](interfaces/LifecycleEventMap.md)
- [NormalizedSelection](interfaces/NormalizedSelection.md)
- [OperationResult](interfaces/OperationResult.md)
- [ReadySubstates](interfaces/ReadySubstates.md)
- [RegistryData](interfaces/RegistryData.md)
- [ReplaceOperation](interfaces/ReplaceOperation.md)
- [ResolvedKey](interfaces/ResolvedKey.md)
- [ResolvedLayout](interfaces/ResolvedLayout.md)
- [StateSnapshot](interfaces/StateSnapshot.md)
- [TargetAdapter](interfaces/TargetAdapter.md)

## Type Aliases

- [AttachmentState](type-aliases/AttachmentState.md)
- [BBoardEventMap](type-aliases/BBoardEventMap.md)
- [CompositionMode](type-aliases/CompositionMode.md)
- [CompositionRuleMode](type-aliases/CompositionRuleMode.md)
- [CompositionSubstate](type-aliases/CompositionSubstate.md)
- [FocusState](type-aliases/FocusState.md)
- [InputOperation](type-aliases/InputOperation.md)
- [InteractionState](type-aliases/InteractionState.md)
- [KeyActionType](type-aliases/KeyActionType.md)
- [KeyboardState](type-aliases/KeyboardState.md)
- [KeyId](type-aliases/KeyId.md)
- [LanguageId](type-aliases/LanguageId.md)
- [LayerId](type-aliases/LayerId.md)
- [LayoutVariantId](type-aliases/LayoutVariantId.md)
- [LifecycleEventName](type-aliases/LifecycleEventName.md)
- [ModifierDisplayMode](type-aliases/ModifierDisplayMode.md)
- [OperationErrorCode](type-aliases/OperationErrorCode.md)
- [OperationType](type-aliases/OperationType.md)
- [SurfaceState](type-aliases/SurfaceState.md)
- [TargetHandle](type-aliases/TargetHandle.md)
- [TargetKind](type-aliases/TargetKind.md)
- [ThemeId](type-aliases/ThemeId.md)
- [Unsubscribe](type-aliases/Unsubscribe.md)

## Variables

- [MODIFIER_DISPLAY_MODES](variables/MODIFIER_DISPLAY_MODES.md)
- [OPERATION_ERROR_CODES](variables/OPERATION_ERROR_CODES.md)
- [RECOVERABLE_CODES](variables/RECOVERABLE_CODES.md)
- [RECOVERY_SUGGESTIONS](variables/RECOVERY_SUGGESTIONS.md)

## Enumerations

- [ErrorCode](enumerations/ErrorCode.md)
