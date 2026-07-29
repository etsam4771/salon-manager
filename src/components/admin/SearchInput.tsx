import { HiOutlineSearch } from "react-icons/hi";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder, className = "" }: SearchInputProps) {
  return (
    <div className={`flex items-center gap-2 bg-sand rounded-full px-4 py-2.5 ${className}`}>
      <HiOutlineSearch className="text-ink/40 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="bg-transparent outline-none text-sm w-full placeholder:text-ink/40"
      />
    </div>
  );
}
