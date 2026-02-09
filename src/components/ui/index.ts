/**
 * UI Components Index
 *
 * Centralized exports for all shadcn/ui components.
 * Provides cleaner import paths and compound component access.
 *
 * NOTE: Prefer importing directly from component files for better tree-shaking:
 * import { Button } from "@/components/ui/button"
 */

// Dialog Component - Compound exports for flexibility
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

// Button Component - Use export type for type-only exports
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";
