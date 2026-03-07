import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";

type CallOperationData = {
  label?: string;
  labelError?: string | null;
  mustFillLabel?: boolean;
  handles?: HandleData[];
};

export default function CallOperation({ data }: DataProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();

  const { setIsZoomOnScrollEnabled } = useCanvas();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const callOperationData = data as CallOperationData;

  const labelFromNode = callOperationData.label ?? "";
  const labelError = callOperationData.labelError ?? null;
  const mustFillLabel = callOperationData.mustFillLabel ?? false;
  const [value, setValue] = useState(labelFromNode);

  // Manejo de handles
  const [showHandles, setShowHandles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { handles, magneticHandle } = useHandle({ 
    handleRef, 
    nodeRef,
    initialHandles: callOperationData.handles
  });

  // Callback ref para actualizar handleRef cuando cambie el último handle
  const setHandleRef = useCallback((node: HTMLDivElement | null) => {
    handleRef.current = node;
  }, []);

  // Sincronizamos handles con node.data cuando cambien
  useEffect(() => {
    if (!nodeId) return;
    setNodes(nodes => nodes.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, handles, ...(isEditing ? { label: value } : {}) } }
        : n
    ));
  }, [handles, nodeId, setNodes, value,  isEditing]);

  useEffect(() => {
    setValue(labelFromNode);
  }, [labelFromNode]);

  useEffect(() => {
    if (!nodeId) return;

    const current = String(labelFromNode ?? value ?? "").trim();

    if (!isEditing && mustFillLabel && current === "") {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  mustFillLabel: false,
                  labelError: null,
                },
              }
            : n
        )
      );

      setIsEditing(true);
      setIsZoomOnScrollEnabled(false);

      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    }
  }, [nodeId, mustFillLabel, labelFromNode, value, isEditing, setNodes, setIsZoomOnScrollEnabled]);
    
  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {

    if (!nodeId) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, labelError: null } }
          : n
      )
    );

    if (evt.target.value.length >= TEXT_AREA_MAX_LEN) {
      setValue(evt.target.value.trim().slice(0, TEXT_AREA_MAX_LEN));
    } else {
      setValue(evt.target.value);
    }
  }, [nodeId, setNodes]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing) {
      if (!nodeId) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, labelError: null } }
            : n
        )
      );
      setIsEditing(true);
      setIsZoomOnScrollEnabled(false);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 0);
    }
  }, [isEditing, nodeId, setNodes, setIsZoomOnScrollEnabled]);

  const handleBlur = useCallback(() => {
    if (!nodeId) return;

    setIsEditing(false);
    setIsZoomOnScrollEnabled(true);

    const trimmed = value.trim();

    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                mustFillLabel: false,
                label: trimmed,
                labelError: trimmed ? null : "No puede estar vacío.",
              },
            }
          : n
      )
    );
  }, [value, nodeId, setNodes, setIsZoomOnScrollEnabled]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
      className="bg-transparent p-4"
      onMouseMove={(evt) => { magneticHandle(evt) }}
    >
      <div ref={nodeRef} className="node-rounded">
        {handles.map((handle, i) => (
          <BaseHandle key={handle.id} id={handle.id} ref={i == handles.length - 1 ? setHandleRef : undefined} showHandle={i == handles.length - 1 ? showHandles : false} position={handle.position} left={handle.left} top={handle.top} />
        ))}
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onWheel={(e) => e.stopPropagation()}
          readOnly={!isEditing}
          placeholder={`(Particiones...)\nC::O`}
          className={`node-textarea ${isEditing ? 'node-textarea-editing' : 'node-textarea-readonly'} ${!isEditing && labelError ? 'node-textarea-error' : ''}`}
          rows={1}
        />
        {!isEditing && labelError && (
          <p className="node-error-text">{labelError}</p>
        )}
        {isEditing &&
          <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
        }
      </div>
    </div>
  )
}