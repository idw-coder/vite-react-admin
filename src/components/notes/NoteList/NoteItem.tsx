import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { FileIcon, MoreHorizontal, Trash } from 'lucide-react';
import { Item } from '@/components/SideBar/Item';
import { cn } from '@/lib/utils';

interface Props {
  id: number;
  label: string;
  isSelected?: boolean;
  // onCreate?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
  onClick?: () => void;
}

export function NoteItem({
  label,
  onClick,
  isSelected = false,
  // onCreate,
  onDelete,
}: Props) {
  const menu = (
    <div className={cn('ml-auto flex items-center gap-x-2')}>
      <DropdownMenu>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
          <div
            className="h-full ml-auto rounded-sm hover:bg-neutral-300"
            role="button"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-60"
          align="start"
          side="right"
          forceMount
        >
          <DropdownMenuItem onClick={onDelete}>
            <Trash className="w-4 h-4 mr-2" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div onClick={onClick} role="button">
      <Item
        label={label}
        icon={FileIcon}
        isActive={isSelected}
        trailingItem={menu}
      />
    </div>
  );
}
