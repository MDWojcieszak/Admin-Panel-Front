import { createContext, useContext } from 'react';

/**
 * App-level actions that custom BlockNote blocks need but can't own themselves
 * (e.g. opening the blog-media panel that lives at the editor shell level).
 */
export type BlogEditorBridge = {
  /** Open the blog-media panel; the callback fires with the chosen blog-media imageId. */
  pickImage: (onPick: (imageId: string) => void) => void;
  /** Open the comments rail and start a note anchored to this block's section. */
  addComment: (sectionId: string) => void;
};

const noop: BlogEditorBridge = { pickImage: () => undefined, addComment: () => undefined };

export const BlogEditorBridgeContext = createContext<BlogEditorBridge>(noop);

export const useBlogEditorBridge = () => useContext(BlogEditorBridgeContext);
