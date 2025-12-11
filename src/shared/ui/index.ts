/**
 * shared/ui 통합 export
 * 도메인 무관 공통 UI 컴포넌트
 */

// Button
export { Button, buttonVariants } from "./Button";
export type { ButtonProps } from "./Button";

// Input
export { Input } from "./Input";
export type { InputProps } from "./Input";

// Textarea
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

// Select
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./Select";
export type {
  SelectTriggerProps,
  SelectContentProps,
  SelectItemProps,
} from "./Select";

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from "./Table";

// Card
export { Card, CardHeader, CardTitle, CardContent } from "./Card";
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
} from "./Card";

// Dialog
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
export type {
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
} from "./Dialog";
