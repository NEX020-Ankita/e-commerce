interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  return <div>{children}</div>;
}

export function DropdownMenuContent({ children }: DropdownMenuContentProps) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children }: DropdownMenuItemProps) {
  return (
    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return (
    <div className="px-4 py-2 text-sm font-semibold text-gray-900">
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="border-t border-gray-200 my-1"></div>;
}