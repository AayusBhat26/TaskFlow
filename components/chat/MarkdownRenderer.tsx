"use client";

import React from "react";
import { parseMarkdown, MarkdownNode } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  const nodes = parseMarkdown(content);

  const renderNode = (node: MarkdownNode, index: number): JSX.Element => {
    switch (node.type) {
      case 'heading':
        const HeadingTag = `h${node.level}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: "text-2xl font-bold mb-2",
          2: "text-xl font-bold mb-2", 
          3: "text-lg font-semibold mb-1",
          4: "text-base font-semibold mb-1",
          5: "text-sm font-semibold mb-1",
          6: "text-xs font-semibold mb-1"
        };
        
        return React.createElement(
          HeadingTag,
          {
            key: index,
            className: headingClasses[node.level as keyof typeof headingClasses] || headingClasses[1]
          },
          node.content
        );

      case 'bold':
        return (
          <strong key={index} className="font-semibold">
            {node.content}
          </strong>
        );
      
      case 'italic':
        return (
          <em key={index} className="italic">
            {node.content}
          </em>
        );
      
      case 'code':
        return (
          <code 
            key={index} 
            className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono"
          >
            {node.content}
          </code>
        );
      
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {node.content}
          </a>
        );
      
      case 'mention':
        return (
          <span
            key={index}
            className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
            onClick={() => {
              // TODO: Handle mention click (e.g., show user profile)
              console.log(`Clicked mention: ${node.userId}`);
            }}
          >
            {node.content}
          </span>
        );
      
      case 'linebreak':
        return <br key={index} />;
      
      case 'text':
      default:
        return <span key={index}>{node.content}</span>;
    }
  };

  return (
    <span className={className}>
      {nodes.map((node, index) => renderNode(node, index))}
    </span>
  );
};
