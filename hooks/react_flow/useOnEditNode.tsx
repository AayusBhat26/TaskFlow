// "use client";

import { useCallback } from "react";
import { useReactFlow } from "reactflow";

export const useOnEditNode = () => {
  const { setNodes } = useReactFlow();

  const onEdit = useCallback(
    (nodeId: string, nodeText: string) => {
      setNodes((prevNodes) => {
        const nodes = prevNodes.map((node: any, idx: number) =>
          node.id === nodeId ? { ...node, data: { text: nodeText }, _mapIndex: idx } : { ...node, _mapIndex: idx }
        );
        return nodes;
      });
    },
    [setNodes]
  );

  return { onEdit };
};
