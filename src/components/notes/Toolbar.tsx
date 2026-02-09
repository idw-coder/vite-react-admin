import { Note } from '@/modules/notes/note';
import TextAreaAutoSize from 'react-textarea-autosize';

interface TitleInputProps {
  initialData: Note;
  onTitleChange: (val: string) => void;
}

export function TitleInput({ initialData, onTitleChange }: TitleInputProps) {
  return (
    <div className="pl-[54px] group relative">
      <TextAreaAutoSize
        className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] resize-none w-full"
        placeholder="無題"
        defaultValue={initialData.title}
        onChange={(e) => onTitleChange(e.target.value)}
        key={initialData.id}
      />
    </div>
  );
}
