import { createContext, useContext } from 'react';

/**
 * App-level actions that custom BlockNote blocks need but can't own themselves
 * (e.g. opening the blog-media panel that lives at the editor shell level).
 */
export type BlogEditorBridge = {
  /** Open the blog-media panel; the callback fires with the chosen blog-media imageId. */
  pickImage: (onPick: (imageId: string) => void) => void;
};

const noop: BlogEditorBridge = { pickImage: () => undefined };

export const BlogEditorBridgeContext = createContext<BlogEditorBridge>(noop);

export const useBlogEditorBridge = () => useContext(BlogEditorBridgeContext);
