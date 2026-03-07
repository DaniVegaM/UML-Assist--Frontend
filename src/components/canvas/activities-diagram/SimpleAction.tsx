import { useCallback, useRef, useState, useEffect } from "react";
import { useCanvas } from "../../../hooks/useCanvas";
import BaseHandle from "../BaseHandle";
import { TEXT_AREA_MAX_LEN } from "../variables";
import { useHandle, type HandleData } from "../../../hooks/useHandle";
import { useNodeId, useReactFlow } from "@xyflow/react";
import "../styles/nodeStyles.css";
import type { DataProps } from "../../../types/canvas";
import { useLiveTextValidation } from "../../../hooks/useLiveTextValidation";


export type Data = {
    label: string;
    incomingEdge: string;
    outgoingEdge: string;
}

type SimpleActionNodeData = {
  label?: string;
  handles?: HandleData[];
  labelError?: string | null;
  mustFillLabel?: boolean;
  incomingEdge?: string;
  outgoingEdge?: string;
  
};

export default function SimpleAction({data} : DataProps) {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();

  const actionData = data as SimpleActionNodeData;
  const labelError = actionData.labelError ?? null;
  const labelFromNode = actionData.label ?? "";
  const mustFillLabel = actionData.mustFillLabel ?? false;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(labelFromNode);
  const { isValid, error, verbGuide } = useLiveTextValidation(value, {
    required: true,
    max: TEXT_AREA_MAX_LEN,
    forbiddenChars: /[¿?]/,
    forbiddenMessage: "No es recomendable signos de interrogación en una acción.",
    enableVerbGuide: true,
  });

  const { setIsZoomOnScrollEnabled } = useCanvas();

  // Manejo de handles
  const [showHandles, setShowHandles] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const { handles, magneticHandle } = useHandle({ 
    handleRef, 
    nodeRef,
    initialHandles: actionData.handles,
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
        ? { ...n, data: { ...n.data, handles, label: value } }
        : n
    ));
  }, [handles, nodeId, setNodes, value]);

  useEffect(() => {
    setValue(labelFromNode);
  }, [labelFromNode]);

  useEffect(() => {
  if (!nodeId) return;

  const current = String(labelFromNode ?? value ?? "").trim();

  if (!isEditing && mustFillLabel && current === "") {
      setNodes((nodes) =>
        nodes.map((n) =>
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

  // Manejo del textarea
  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, labelError: null } } : n
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
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, labelError: null } } : n
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
  }, [isEditing, setIsZoomOnScrollEnabled, nodeId, setNodes]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setIsZoomOnScrollEnabled(true);

    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                mustFillLabel: false,
                label: value.trim(),
                labelError: isValid ? null : (error ?? "Texto inválido."),
              },
            }
          : n
      )
    );
  }, [setIsZoomOnScrollEnabled, nodeId, setNodes, isValid, error, value]);

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
          placeholder={`(Particiones...)\nAcción`}
          className={`node-textarea ${
            isEditing ? "node-textarea-editing" : "node-textarea-readonly"
          } ${
            !isEditing && labelError ? "node-textarea-error" : ""
          }`}
          rows={1}
        />
        {isEditing && (
          <p className="char-counter char-counter-right">{`${value.length}/${TEXT_AREA_MAX_LEN}`}</p>
        )}

        {isEditing && verbGuide && (
          <div className="mt-1 text-[11px] leading-5 font-mono text-center select-none">
            <span className={verbGuide.verbOk ? "text-green-600" : "text-gray-400"}>
              {verbGuide.verbOk ? verbGuide.verb : "VERBO"}
            </span>

            <span className="text-gray-400">{" "}</span>

            <span className={verbGuide.complementOk ? "text-green-600" : "text-gray-400"}>
              {verbGuide.complementOk ? verbGuide.complement : "Complemento"}
            </span>
          </div>
        )}


        {!isEditing && labelError && (
          <p className="node-error-text">{labelError}</p>
        )}

      </div>
    </div>
  )
}