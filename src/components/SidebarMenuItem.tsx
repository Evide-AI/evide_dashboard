import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface SidebarMenuItemProps {
  icon: LucideIcon;
  children: ReactNode;
  onAction?: () => void;
  setIsOpen: (isOpen: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function SidebarMenuItem({
  icon: Icon,
  children,
  onAction,
  setIsOpen,
  disabled = false,
  className = "",
}: SidebarMenuItemProps) {
  const handleClick = () => {
    if (onAction) {
      onAction();
    }
    setIsOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full flex items-center px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ${className}`}
    >
      <Icon className="h-4 w-4 mr-3" />
      <span className="text-sm">{children}</span>
    </button>
  );
}
