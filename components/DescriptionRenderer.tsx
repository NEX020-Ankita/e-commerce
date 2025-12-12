"use client";

interface DescriptionRendererProps {
  content: string;
  className?: string;
  cleanContent?: boolean;
}

export function DescriptionRenderer({ content, className = "" }: DescriptionRendererProps) {
  const cleanContent = content.replace(/<p>/g, '').replace(/<\/p>/g, '');

  
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
}